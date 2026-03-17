import { put, list, get, del } from '@vercel/blob'
import { type NextRequest, NextResponse } from 'next/server'

export const runtime = 'edge'

const NOTE_KEY = 'shared-note.txt'

// GET - Fetch the current shared note
export async function GET() {
  try {
    const { blobs } = await list({ prefix: NOTE_KEY })
    
    if (blobs.length === 0) {
      return NextResponse.json({ content: '', updatedAt: null })
    }

    const result = await get(blobs[0].pathname, { access: 'private' })
    
    if (!result) {
      return NextResponse.json({ content: '', updatedAt: null })
    }

    const content = await new Response(result.stream).text()
    
    return NextResponse.json({ 
      content, 
      updatedAt: blobs[0].uploadedAt 
    }, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate',
      }
    })
  } catch (error) {
    console.error('Error fetching note:', error)
    return NextResponse.json({ content: '', updatedAt: null })
  }
}

// POST - Save the shared note
export async function POST(request: NextRequest) {
  try {
    const { content } = await request.json()
    
    // Delete old notes first
    const { blobs } = await list({ prefix: NOTE_KEY })
    for (const blob of blobs) {
      await del(blob.pathname)
    }

    if (!content || content.trim() === '') {
      return NextResponse.json({ success: true, updatedAt: new Date().toISOString() })
    }

    const blob = await put(NOTE_KEY, content, {
      access: 'private',
      addRandomSuffix: false,
    })

    return NextResponse.json({ 
      success: true, 
      updatedAt: blob.uploadedAt 
    })
  } catch (error) {
    console.error('Error saving note:', error)
    return NextResponse.json({ error: 'Save failed' }, { status: 500 })
  }
}

// DELETE - Clear the shared note
export async function DELETE() {
  try {
    const { blobs } = await list({ prefix: NOTE_KEY })
    for (const blob of blobs) {
      await del(blob.pathname)
    }
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting note:', error)
    return NextResponse.json({ error: 'Delete failed' }, { status: 500 })
  }
}
