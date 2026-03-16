import { list } from '@vercel/blob'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const { blobs } = await list()

    const files = blobs.map((blob) => {
      // Extract original filename (remove timestamp prefix)
      const pathname = blob.pathname
      const parts = pathname.split('/')
      const fullName = parts[parts.length - 1] || 'unknown'
      // Remove timestamp prefix if present (format: timestamp-filename)
      const filename = fullName.includes('-') 
        ? fullName.substring(fullName.indexOf('-') + 1)
        : fullName

      return {
        url: blob.url,
        pathname: blob.pathname,
        filename,
        size: blob.size,
        uploadedAt: blob.uploadedAt,
        contentType: blob.contentType || 'application/octet-stream',
      }
    })

    // Sort by upload date (newest first)
    files.sort((a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime())

    return NextResponse.json({ files })
  } catch (error) {
    console.error('Error listing files:', error)
    return NextResponse.json({ error: 'Failed to list files' }, { status: 500 })
  }
}
