import { NextRequest, NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabase'

export const runtime = 'nodejs'

export async function GET() {
  try {
    const { data: images, error } = await supabaseServer
      .from('images')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Supabase error:', error)
      return NextResponse.json({ images: [] })
    }

    return NextResponse.json({ images: images || [] })
  } catch (error) {
    console.error('Error listing images:', error)
    return NextResponse.json({ images: [] })
  }
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    // Generate unique filename
    const timestamp = Date.now()
    const ext = file.type.split('/')[1] || 'png'
    const filename = `${timestamp}.${ext}`

    // Upload to Supabase Storage
    const { error: uploadError, data } = await supabaseServer.storage
      .from('images')
      .upload(filename, file, {
        cacheControl: '3600',
        upsert: false,
      })

    if (uploadError) {
      throw uploadError
    }

    // Insert metadata into database
    const { data: record, error: dbError } = await supabaseServer
      .from('images')
      .insert({
        filename,
        storage_path: `images/${filename}`,
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
      filename,
      storage_path: record?.storage_path,
      created_at: record?.created_at,
    })
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Upload failed'
    console.error('Upload error:', error)
    return NextResponse.json({ error: errorMessage }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { id } = await request.json()

    if (!id) {
      return NextResponse.json({ error: 'No image ID provided' }, { status: 400 })
    }

    // Get the storage path first
    const { data: image, error: fetchError } = await supabaseServer
      .from('images')
      .select('storage_path, filename')
      .eq('id', id)
      .single()

    if (fetchError || !image) {
      throw new Error('Image not found')
    }

    // Delete from storage
    const { error: deleteError } = await supabaseServer.storage
      .from('images')
      .remove([image.filename])

    if (deleteError) {
      throw deleteError
    }

    // Delete from database
    const { error: dbError } = await supabaseServer
      .from('images')
      .delete()
      .eq('id', id)

    if (dbError) {
      throw dbError
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete error:', error)
    return NextResponse.json({ error: 'Delete failed' }, { status: 500 })
  }
}
