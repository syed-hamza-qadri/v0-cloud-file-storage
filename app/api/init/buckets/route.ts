import { NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabase'

export const runtime = 'nodejs'

export async function POST() {
  try {
    // Check if files bucket exists
    const { data: buckets } = await supabaseServer.storage.listBuckets()
    
    const filesBucketExists = buckets?.some(b => b.name === 'files')
    const imagesBucketExists = buckets?.some(b => b.name === 'images')

    // Create files bucket if it doesn't exist
    if (!filesBucketExists) {
      await supabaseServer.storage.createBucket('files', {
        public: true,
        allowedMimeTypes: null, // Allow all file types
      })
      console.log('[v0] Created files bucket')
    }

    // Create images bucket if it doesn't exist
    if (!imagesBucketExists) {
      await supabaseServer.storage.createBucket('images', {
        public: true,
        allowedMimeTypes: [
          'image/png',
          'image/jpeg',
          'image/gif',
          'image/webp',
          'image/svg+xml',
        ],
      })
      console.log('[v0] Created images bucket')
    }

    return NextResponse.json({
      success: true,
      message: 'Storage buckets ready',
      buckets: {
        files: filesBucketExists ? 'exists' : 'created',
        images: imagesBucketExists ? 'exists' : 'created',
      },
    })
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    
    // Buckets might already exist - that's OK
    if (errorMessage.includes('already exists')) {
      return NextResponse.json({
        success: true,
        message: 'Storage buckets already exist',
      })
    }

    console.error('[v0] Buckets error:', error)
    return NextResponse.json({
      success: false,
      message: errorMessage,
    }, { status: 500 })
  }
}
