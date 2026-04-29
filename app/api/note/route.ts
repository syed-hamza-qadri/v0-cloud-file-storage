import { type NextRequest, NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabase'

export const runtime = 'nodejs'

// GET - Fetch the current shared note
export async function GET() {
  try {
    const { data: note, error } = await supabaseServer
      .from('notes')
      .select('*')
      .limit(1)
      .single()

    if (error?.code === 'PGRST116') {
      // No records found
      return NextResponse.json({ content: '', updatedAt: null })
    }

    if (error) {
      throw error
    }

    return NextResponse.json({ 
      content: note?.content || '', 
      updatedAt: note?.updated_at
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

// POST - Save the shared note (upsert)
export async function POST(request: NextRequest) {
  try {
    const { content } = await request.json()

    // Get or create note with ID 1 (singleton pattern)
    const { data: note, error: upsertError } = await supabaseServer
      .from('notes')
      .upsert({
        id: 1,
        content: content || '',
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'id'
      })
      .select()
      .single()

    if (upsertError) {
      throw upsertError
    }

    return NextResponse.json({ 
      success: true, 
      updatedAt: note?.updated_at
    })
  } catch (error) {
    console.error('Error saving note:', error)
    return NextResponse.json({ error: 'Save failed' }, { status: 500 })
  }
}

// DELETE - Clear the shared note
export async function DELETE() {
  try {
    const { error } = await supabaseServer
      .from('notes')
      .delete()
      .eq('id', 1)

    if (error) {
      throw error
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting note:', error)
    return NextResponse.json({ error: 'Delete failed' }, { status: 500 })
  }
}
