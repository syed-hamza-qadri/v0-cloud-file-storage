import { put, list, del } from '@vercel/blob'
import { type NextRequest, NextResponse } from 'next/server'

export const runtime = 'edge'

const IMAGES_PREFIX = '_pasted_images_/'

export async function GET() {
  try {
    const { blobs } = await list({
      prefix: IMAGES_PREFIX,
    })

    const images = blobs.map((blob) => ({
      pathname: blob.pathname,
      filename: blob.pathname.replace(IMAGES_PREFIX, ''),
      uploadedAt: blob.uploadedAt,
    }))

    // Sort newest first
    images.sort((a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime())

    return NextResponse.json({ images })
  } catch (error) {
    console.error('Error listing images:', error)
    return NextResponse.json({ images: [] })
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log('[v0] Images API POST called')
    const formData = await request.formData()
    const file = formData.get('file') as File

    if (!file) {
      console.log('[v0] No file in formData')
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    console.log('[v0] Uploading image:', file.name, 'size:', file.size, 'type:', file.type)

    // Generate unique filename
    const timestamp = Date.now()
    const ext = file.type.split('/')[1] || 'png'
    const filename = `${IMAGES_PREFIX}${timestamp}.${ext}`

    const blob = await put(filename, file, {
      access: 'private',
      addRandomSuffix: false,
    })

    console.log('[v0] Image upload success:', blob.pathname)

    return NextResponse.json({
      pathname: blob.pathname,
      filename: blob.pathname.replace(IMAGES_PREFIX, ''),
      uploadedAt: blob.uploadedAt,
    })
  } catch (error) {
    console.error('[v0] Image upload error:', error)
    return NextResponse.json({ error: 'Upload failed', details: String(error) }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { pathname } = await request.json()

    if (!pathname) {
      return NextResponse.json({ error: 'No pathname provided' }, { status: 400 })
    }

    await del(pathname)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete error:', error)
    return NextResponse.json({ error: 'Delete failed' }, { status: 500 })
  }
}
