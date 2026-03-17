import { put } from '@vercel/blob'
import { type NextRequest, NextResponse } from 'next/server'

// Disable body parsing to enable streaming for large files
export const runtime = 'edge'

export async function POST(request: NextRequest) {
  try {
    console.log('[v0] Upload API called')
    const formData = await request.formData()
    const file = formData.get('file') as File

    if (!file) {
      console.log('[v0] No file in formData')
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    console.log('[v0] Uploading file:', file.name, 'size:', file.size, 'type:', file.type)

    // Generate a unique filename with timestamp
    const timestamp = Date.now()
    const filename = `${timestamp}-${file.name}`

    // Use private access for secure file storage
    const blob = await put(filename, file, {
      access: 'private',
      addRandomSuffix: false,
    })

    console.log('[v0] Upload success:', blob.pathname)

    return NextResponse.json({
      url: blob.url,
      pathname: blob.pathname,
      filename: file.name,
      size: file.size,
      contentType: blob.contentType,
      uploadedAt: blob.uploadedAt,
    })
  } catch (error) {
    console.error('[v0] Upload error:', error)
    return NextResponse.json({ error: 'Upload failed', details: String(error) }, { status: 500 })
  }
}
