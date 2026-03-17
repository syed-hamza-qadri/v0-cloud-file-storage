'use client'

import { useState, useCallback, useRef } from 'react'
import { Upload, X, Check, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface UploadZoneProps {
  onUploadComplete: () => void
}

interface UploadingFile {
  id: string
  file: File
  status: 'uploading' | 'complete' | 'error'
}

const MAX_CONCURRENT_UPLOADS = 5

export function UploadZone({ onUploadComplete }: UploadZoneProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [uploadingFiles, setUploadingFiles] = useState<UploadingFile[]>([])
  const uploadQueueRef = useRef<File[]>([])
  const activeUploadsRef = useRef(0)

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

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
    
    setUploadingFiles(prev => [...prev, { id, file, status: 'uploading' }])

    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) throw new Error('Upload failed')

      setUploadingFiles(prev =>
        prev.map(f => f.id === id ? { ...f, status: 'complete' } : f)
      )

      setTimeout(() => {
        setUploadingFiles(prev => prev.filter(f => f.id !== id))
      }, 1500)

      onUploadComplete()
    } catch {
      setUploadingFiles(prev =>
        prev.map(f => f.id === id ? { ...f, status: 'error' } : f)
      )
    } finally {
      activeUploadsRef.current--
      processQueue()
    }
  }

  const queueFiles = useCallback((files: File[]) => {
    uploadQueueRef.current.push(...files)
    processQueue()
  }, [processQueue])

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

  const removeFile = (id: string) => {
    setUploadingFiles(prev => prev.filter(f => f.id !== id))
  }

  return (
    <div className="space-y-3">
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={cn(
          'relative flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-6 transition-colors',
          isDragging ? 'border-foreground bg-muted' : 'border-border hover:border-foreground/50'
        )}
      >
        <input
          type="file"
          multiple
          onChange={handleFileSelect}
          className="absolute inset-0 cursor-pointer opacity-0"
        />
        <Upload className="mb-2 h-6 w-6 text-muted-foreground" />
        <p className="text-sm text-muted-foreground">
          Drop files or click to upload
        </p>
      </div>

      {uploadingFiles.length > 0 && (
        <div className="space-y-2">
          {uploadingFiles.map((item) => (
            <div
              key={item.id}
              className="flex items-center gap-3 rounded-lg border p-2 text-sm"
            >
              <span className="flex-1 truncate">{item.file.name}</span>
              {item.status === 'uploading' && (
                <Loader2 className="h-4 w-4 animate-spin" />
              )}
              {item.status === 'complete' && (
                <Check className="h-4 w-4" />
              )}
              {item.status === 'error' && (
                <button onClick={() => removeFile(item.id)} className="p-1 hover:bg-muted rounded">
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
