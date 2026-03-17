import { list } from '@vercel/blob'
import { type NextRequest, NextResponse } from 'next/server'

// Use edge runtime for fastest response
export const runtime = 'edge'

export async function GET(request: NextRequest) {
  try {
    // Support pagination cursor for large file lists
    const cursor = request.nextUrl.searchParams.get('cursor') || undefined
    const limit = parseInt(request.nextUrl.searchParams.get('limit') || '100')

    const { blobs, cursor: nextCursor, hasMore } = await list({
      cursor,
      limit,
    })

    // Filter out images and notes (they have their own APIs)
    const filteredBlobs = blobs.filter(blob => 
      !blob.pathname.startsWith('_pasted_images_/') && 
      !blob.pathname.startsWith('_shared_note')
    )

    const files = filteredBlobs.map((blob) => {
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

    return NextResponse.json({ 
      files,
      nextCursor: hasMore ? nextCursor : null,
      hasMore,
    }, {
      headers: {
        'Cache-Control': 'private, no-cache',
      }
    })
  } catch (error) {
    console.error('Error listing files:', error)
    return NextResponse.json({ error: 'Failed to list files' }, { status: 500 })
  }
}
