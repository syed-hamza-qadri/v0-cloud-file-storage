'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import { Upload, X, Check, Loader2, FileUp } from 'lucide-react'
import { cn } from '@/lib/utils'

interface UploadZoneProps {
  onUploadComplete: () => void
}

interface UploadingFile {
  id: string
  file: File
  status: 'uploading' | 'complete' | 'error'
}

const MAX_CONCURRENT_UPLOADS = 6

export function UploadZone({ onUploadComplete }: UploadZoneProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [uploadingFiles, setUploadingFiles] = useState<UploadingFile[]>([])
  const uploadQueueRef = useRef<File[]>([])
  const activeUploadsRef = useRef(0)

  const processQueue = useCallback(() => {
    while (
      uploadQueueRef.current.length > 0 &&
      activeUploadsRef.current < MAX_CONCURRENT_UPLOADS
    ) {
      const file = uploadQueueRef.current.shift()
      if (file) {
        activeUploadsRef.current++
        uploadSingleFile(file)
      }
    }
  }, [])

  const uploadSingleFile = async (file: File) => {
    const id = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`
    
    console.log('[v0] Uploading file:', file.name, 'size:', file.size, 'type:', file.type)
    setUploadingFiles(prev => [...prev, { id, file, status: 'uploading' }])

    try {
      const formData = new FormData()
      formData.append('file', file)

      console.log('[v0] Sending to /api/upload')
      const response = await fetch('/api/upload', {
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

      setUploadingFiles(prev =>
        prev.map(f => f.id === id ? { ...f, status: 'complete' } : f)
      )

      setTimeout(() => {
        setUploadingFiles(prev => prev.filter(f => f.id !== id))
      }, 1000)

      onUploadComplete()
    } catch {
      setUploadingFiles(prev =>
        prev.map(f => f.id === id ? { ...f, status: 'error' } : f)
      )
      setTimeout(() => {
        setUploadingFiles(prev => prev.filter(f => f.id !== id))
      }, 2000)
    } finally {
      activeUploadsRef.current--
      processQueue()
    }
  }

  const queueFiles = useCallback((files: File[]) => {
    uploadQueueRef.current.push(...files)
    processQueue()
  }, [processQueue])

  // Global Ctrl+V paste handler for non-image files
  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      const items = e.clipboardData?.items
      if (!items) return

      const files: File[] = []
      for (const item of items) {
        // Skip images - handled by PasteZone
        if (item.type.startsWith('image/')) continue
        
        if (item.kind === 'file') {
          const file = item.getAsFile()
          if (file) files.push(file)
        }
      }

      if (files.length > 0) {
        e.preventDefault()
        queueFiles(files)
      }
    }

    document.addEventListener('paste', handlePaste)
    return () => document.removeEventListener('paste', handlePaste)
  }, [queueFiles])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const files = Array.from(e.dataTransfer.files)
    queueFiles(files)
  }, [queueFiles])

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    queueFiles(files)
    e.target.value = ''
  }, [queueFiles])

  return (
    <div className="rounded-lg border bg-card">
      <div className="flex items-center gap-2 border-b p-3">
        <FileUp className="h-4 w-4" />
        <span className="text-sm font-medium">Files</span>
        <span className="text-xs text-muted-foreground">(Drag, click, or Ctrl+V)</span>
      </div>

      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={cn(
          'relative cursor-pointer p-4 transition-colors',
          isDragging && 'bg-muted'
        )}
      >
        <input
          type="file"
          multiple
          onChange={handleFileSelect}
          className="absolute inset-0 cursor-pointer opacity-0"
        />

        {uploadingFiles.length > 0 ? (
          <div className="space-y-1">
            {uploadingFiles.slice(0, 4).map((item) => (
              <div key={item.id} className="flex items-center gap-2 text-sm">
                {item.status === 'uploading' && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                {item.status === 'complete' && <Check className="h-3.5 w-3.5" />}
                {item.status === 'error' && <X className="h-3.5 w-3.5 text-destructive" />}
                <span className="truncate text-xs">{item.file.name}</span>
              </div>
            ))}
            {uploadingFiles.length > 4 && (
              <p className="text-xs text-muted-foreground">+{uploadingFiles.length - 4} more</p>
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-2 text-center">
            <Upload className={cn('mb-1 h-6 w-6 text-muted-foreground/50', isDragging && 'scale-110')} />
            <p className="text-xs text-muted-foreground">Drop files or click to upload</p>
          </div>
        )}
      </div>
    </div>
  )
}
