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
    const errorMessage = error instanceof Error ? error.message : 'Upload failed'
    console.error('Upload error:', error)
    
    // Handle specific Blob errors
    if (errorMessage.includes('suspended')) {
      return NextResponse.json({ 
        error: 'Storage suspended - Check your Vercel Blob account status and billing' 
      }, { status: 503 })
    }
    if (errorMessage.includes('quota')) {
      return NextResponse.json({ 
        error: 'Storage quota exceeded - Delete some files or upgrade your plan' 
      }, { status: 507 })
    }
    
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 })
  }
}
