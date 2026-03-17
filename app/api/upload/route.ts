import { put } from '@vercel/blob'
import { type NextRequest, NextResponse } from 'next/server'

// Disable body parsing to enable streaming for large files
export const runtime = 'edge'

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

    // Use private access for secure file storage
    const blob = await put(filename, file, {
      access: 'private',
      addRandomSuffix: false,
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
