'use client'

import { useState, useEffect, useCallback } from 'react'
import useSWR from 'swr'
import { Image as ImageIcon, Loader2, X, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'

const fetcher = (url: string) => fetch(url).then(res => res.json())

interface PastedImage {
  pathname: string
  filename: string
  uploadedAt: string
}

export function PasteZone() {
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState<string>('')

  // Fetch pasted images - poll every 2 seconds for real-time sync
  const { data, mutate, isLoading } = useSWR<{ images: PastedImage[] }>(
    '/api/images',
    fetcher,
    {
      refreshInterval: 2000,
      revalidateOnFocus: true,
      dedupingInterval: 1000,
    }
  )

  const images = data?.images || []

  // Handle paste event globally
  const handlePaste = useCallback(async (e: ClipboardEvent) => {
    const items = e.clipboardData?.items
    if (!items) return

    for (const item of items) {
      if (item.type.startsWith('image/')) {
        e.preventDefault()
        const file = item.getAsFile()
        if (!file) continue

        setIsUploading(true)
        setUploadProgress('Uploading image...')

        try {
          const formData = new FormData()
          formData.append('file', file)

          const response = await fetch('/api/images', {
            method: 'POST',
            body: formData,
          })

          if (!response.ok) throw new Error('Upload failed')

          setUploadProgress('Uploaded!')
          mutate()
          
          setTimeout(() => {
            setUploadProgress('')
          }, 1500)
        } catch (error) {
          console.error('Upload error:', error)
          setUploadProgress('Upload failed')
          setTimeout(() => setUploadProgress(''), 2000)
        } finally {
          setIsUploading(false)
        }

        break
      }
    }
  }, [mutate])

  // Add global paste listener
  useEffect(() => {
    document.addEventListener('paste', handlePaste)
    return () => document.removeEventListener('paste', handlePaste)
  }, [handlePaste])

  const handleDelete = async (pathname: string) => {
    // Optimistic update
    mutate({ images: images.filter(img => img.pathname !== pathname) }, false)

    try {
      await fetch('/api/images', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pathname }),
      })
      mutate()
    } catch (error) {
      console.error('Delete error:', error)
      mutate()
    }
  }

  return (
    <div className="rounded-lg border bg-card">
      <div className="flex items-center justify-between border-b p-3">
        <div className="flex items-center gap-2">
          <ImageIcon className="h-4 w-4" />
          <span className="text-sm font-medium">Pasted Images</span>
          <span className="text-xs text-muted-foreground">(Ctrl+V anywhere to paste)</span>
          {isUploading && (
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Loader2 className="h-3 w-3 animate-spin" />
              {uploadProgress}
            </div>
          )}
          {!isUploading && uploadProgress && (
            <span className="text-xs text-muted-foreground">{uploadProgress}</span>
          )}
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={() => mutate()}
          title="Refresh"
        >
          <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
        </Button>
      </div>

      {images.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <ImageIcon className="mb-2 h-8 w-8 text-muted-foreground/50" />
          <p className="text-sm text-muted-foreground">No images yet</p>
          <p className="text-xs text-muted-foreground">Press Ctrl+V to paste an image</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-2 p-3 sm:grid-cols-3 md:grid-cols-4">
          {images.map((image) => (
            <div key={image.pathname} className="group relative aspect-square overflow-hidden rounded-lg border bg-muted">
              <img
                src={`/api/file?pathname=${encodeURIComponent(image.pathname)}`}
                alt={image.filename}
                className="h-full w-full object-cover"
                loading="lazy"
              />
              <Button
                variant="destructive"
                size="icon"
                className="absolute right-1 top-1 h-6 w-6 opacity-0 transition-opacity group-hover:opacity-100"
                onClick={() => handleDelete(image.pathname)}
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
