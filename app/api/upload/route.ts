import { NextRequest, NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabase'

export const runtime = 'nodejs'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    // Generate a unique filename with timestamp
    const timestamp = Date.now()
    const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_')
    const storageName = `${timestamp}-${sanitizedName}`

    // Upload to Supabase Storage
    const { error: uploadError, data } = await supabaseServer.storage
      .from('files')
      .upload(storageName, file, {
        cacheControl: '3600',
        upsert: false,
      })

    if (uploadError) {
      throw uploadError
    }

    // Insert metadata into database
    const { data: record, error: dbError } = await supabaseServer
      .from('files')
      .insert({
        filename: file.name,
        storage_path: `files/${storageName}`,
        size: file.size,
        content_type: file.type,
      })
      .select()
      .single()

    if (dbError) {
      throw dbError
    }

    return NextResponse.json({
      id: record?.id,
      pathname: record?.storage_path,
      filename: file.name,
      size: file.size,
      contentType: file.type,
      created_at: record?.created_at,
    })
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Upload failed'
    console.error('Upload error:', error)
    return NextResponse.json({ error: errorMessage }, { status: 500 })
  }
}
