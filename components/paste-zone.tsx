'use client'

import { useState, useEffect, useCallback } from 'react'
import useSWR from 'swr'
import { Image as ImageIcon, Loader2, X, RefreshCw, Download } from 'lucide-react'
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

  const { data, mutate, isLoading } = useSWR<{ images: PastedImage[] }>(
    '/api/images',
    fetcher,
    {
      refreshInterval: 2000,
      revalidateOnFocus: true,
      dedupingInterval: 500,
    }
  )

  const images = data?.images || []

  const handlePaste = useCallback(async (e: ClipboardEvent) => {
    console.log('[v0] Paste event detected')
    const items = e.clipboardData?.items
    if (!items) {
      console.log('[v0] No clipboard items')
      return
    }

    console.log('[v0] Clipboard items count:', items.length)
    for (let i = 0; i < items.length; i++) {
      console.log('[v0] Item', i, '- kind:', items[i].kind, 'type:', items[i].type)
    }

    for (const item of items) {
      if (item.type.startsWith('image/')) {
        e.preventDefault()
        const file = item.getAsFile()
        if (!file) {
          console.log('[v0] Could not get file from item')
          continue
        }

        console.log('[v0] Got image file:', file.name, 'size:', file.size)
        setIsUploading(true)
        setUploadProgress('Uploading...')

        try {
          const formData = new FormData()
          formData.append('file', file)

          console.log('[v0] Sending to /api/images')
          const response = await fetch('/api/images', {
            method: 'POST',
            body: formData,
          })

          console.log('[v0] Response status:', response.status)
          if (!response.ok) {
            const errorData = await response.json()
            console.log('[v0] Error response:', errorData)
            throw new Error('Upload failed')
          }

          const data = await response.json()
          console.log('[v0] Upload success:', data)

          setUploadProgress('Done')
          mutate()
          
          setTimeout(() => setUploadProgress(''), 1000)
        } catch (error) {
          console.error('[v0] Upload error:', error)
          setUploadProgress('Failed')
          setTimeout(() => setUploadProgress(''), 1500)
        } finally {
          setIsUploading(false)
        }
        break
      }
    }
  }, [mutate])

  useEffect(() => {
    document.addEventListener('paste', handlePaste)
    return () => document.removeEventListener('paste', handlePaste)
  }, [handlePaste])

  const handleDelete = async (pathname: string) => {
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

  const handleDownload = (pathname: string, filename: string) => {
    const link = document.createElement('a')
    link.href = `/api/file?pathname=${encodeURIComponent(pathname)}`
    link.download = filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div className="rounded-lg border bg-card">
      <div className="flex items-center justify-between border-b p-3">
        <div className="flex items-center gap-2">
          <ImageIcon className="h-4 w-4" />
          <span className="text-sm font-medium">Images</span>
          <span className="text-xs text-muted-foreground">(Ctrl+V to paste)</span>
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
          className="h-7 w-7"
          onClick={() => mutate()}
        >
          <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? 'animate-spin' : ''}`} />
        </Button>
      </div>

      {images.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-6 text-center">
          <ImageIcon className="mb-2 h-6 w-6 text-muted-foreground/50" />
          <p className="text-xs text-muted-foreground">Ctrl+V to paste images</p>
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-1.5 p-2 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6">
          {images.map((image) => (
            <div key={image.pathname} className="group relative aspect-square overflow-hidden rounded border bg-muted">
              <img
                src={`/api/file?pathname=${encodeURIComponent(image.pathname)}`}
                alt={image.filename}
                className="h-full w-full object-cover"
                loading="lazy"
              />
              <div className="absolute inset-0 flex items-center justify-center gap-1 bg-background/80 opacity-0 transition-opacity group-hover:opacity-100">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7"
                  onClick={() => handleDownload(image.pathname, image.filename)}
                >
                  <Download className="h-3.5 w-3.5" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 text-destructive hover:text-destructive"
                  onClick={() => handleDelete(image.pathname)}
                >
                  <X className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
