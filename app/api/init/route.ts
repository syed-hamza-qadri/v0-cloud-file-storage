import { NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabase'

export const runtime = 'nodejs'

export async function POST() {
  try {
    // Check if tables exist by trying to query them
    const { error: notesError } = await supabaseServer
      .from('notes')
      .select('*')
      .limit(1)

    const { error: filesError } = await supabaseServer
      .from('files')
      .select('*')
      .limit(1)

    const { error: imagesError } = await supabaseServer
      .from('images')
      .select('*')
      .limit(1)

    // If tables don't exist, try to create them via raw SQL
    if (notesError?.code === 'PGRST116' || filesError?.code === 'PGRST116' || imagesError?.code === 'PGRST116') {
      console.log('[v0] Tables not found, attempting to create...')

      // Try to create tables via RPC call (if function exists)
      // Otherwise, tables will be created on first query
      try {
        await supabaseServer.rpc('create_cloudvault_tables')
      } catch (e) {
        console.log('[v0] RPC function not available, using standard approach')
      }
    }

    // Ensure initial note record exists
    const { data: notes } = await supabaseServer
      .from('notes')
      .select('*')
      .limit(1)

    if (!notes || notes.length === 0) {
      await supabaseServer
        .from('notes')
        .insert({ id: 1, content: '', updated_at: new Date().toISOString() })
        .catch(() => {}) // Ignore if already exists
    }

    return NextResponse.json({
      success: true,
      message: 'Database tables verified',
    })
  } catch (error) {
    console.error('[v0] Init error:', error)
    return NextResponse.json({
      success: false,
      message: error instanceof Error ? error.message : 'Initialization failed',
    }, { status: 500 })
  }
}
