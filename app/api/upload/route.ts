import { put } from '@vercel/blob'
import { type NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    // Generate a unique filename with timestamp
    const timestamp = Date.now()
    const filename = `${timestamp}-${file.name}`

    const blob = await put(filename, file, {
      access: 'public',
    })

    return NextResponse.json({
      url: blob.url,
      pathname: blob.pathname,
      filename: file.name,
      size: file.size,
      contentType: blob.contentType,
      uploadedAt: blob.uploadedAt,
    })
  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 })
  }
}
