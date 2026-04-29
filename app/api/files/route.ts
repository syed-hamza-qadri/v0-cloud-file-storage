import { NextRequest, NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabase'

export const runtime = 'nodejs'

export async function GET(request: NextRequest) {
  try {
    const limit = parseInt(request.nextUrl.searchParams.get('limit') || '100')

    const { data: files, error } = await supabaseServer
      .from('files')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error) {
      console.error('Supabase error:', error)
      return NextResponse.json({ files: [] })
    }

    return NextResponse.json({ 
      files: files || [],
    }, {
      headers: {
        'Cache-Control': 'private, no-cache',
      }
    })
  } catch (error) {
    console.error('Error listing files:', error)
    return NextResponse.json({ files: [] })
  }
}
