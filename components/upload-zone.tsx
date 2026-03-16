'use client'

import { useState, useCallback, useRef } from 'react'
import { Upload, X, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface UploadZoneProps {
  onUploadComplete: () => void
}

interface UploadingFile {
  id: string
  file: File
  progress: number
  status: 'uploading' | 'complete' | 'error'
  error?: string
}

// Max concurrent uploads for optimal speed
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
    
    setUploadingFiles(prev => [...prev, { id, file, progress: 0, status: 'uploading' }])

    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        throw new Error('Upload failed')
      }

      setUploadingFiles(prev =>
        prev.map(f =>
          f.id === id ? { ...f, progress: 100, status: 'complete' } : f
        )
      )

      // Remove completed file from list after 1.5 seconds
      setTimeout(() => {
        setUploadingFiles(prev => prev.filter(f => f.id !== id))
      }, 1500)

      onUploadComplete()
    } catch (error) {
      setUploadingFiles(prev =>
        prev.map(f =>
          f.id === id
            ? { ...f, status: 'error', error: 'Upload failed' }
            : f
        )
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

  const completedCount = uploadingFiles.filter(f => f.status === 'complete').length
  const uploadingCount = uploadingFiles.filter(f => f.status === 'uploading').length

  return (
    <div className="space-y-4">
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={cn(
          'relative flex flex-col items-center justify-center rounded-xl border-2 border-dashed p-8 transition-all duration-200',
          isDragging
            ? 'border-primary bg-primary/5'
            : 'border-border bg-muted/30 hover:border-primary/50 hover:bg-muted/50'
        )}
      >
        <input
          type="file"
          multiple
          onChange={handleFileSelect}
          className="absolute inset-0 cursor-pointer opacity-0"
        />
        <div className={cn(
          'mb-4 rounded-full p-4 transition-colors',
          isDragging ? 'bg-primary/10' : 'bg-muted'
        )}>
          <Upload className={cn(
            'h-8 w-8 transition-colors',
            isDragging ? 'text-primary' : 'text-muted-foreground'
          )} />
        </div>
        <p className="text-center text-lg font-medium text-foreground">
          {isDragging ? 'Drop files here' : 'Drag and drop files'}
        </p>
        <p className="mt-1 text-center text-sm text-muted-foreground">
          or click to browse - supports all file types
        </p>
        <p className="mt-2 text-center text-xs text-muted-foreground">
          Up to {MAX_CONCURRENT_UPLOADS} parallel uploads for maximum speed
        </p>
      </div>

      {/* Upload Progress */}
      {uploadingFiles.length > 0 && (
        <div className="space-y-2">
          {/* Summary bar */}
          {(uploadingCount > 0 || completedCount > 0) && (
            <div className="flex items-center justify-between rounded-lg bg-muted/50 px-3 py-2 text-sm">
              <span className="text-muted-foreground">
                {uploadingCount > 0 && `Uploading ${uploadingCount} file${uploadingCount > 1 ? 's' : ''}...`}
                {uploadingCount === 0 && completedCount > 0 && 'All uploads complete'}
              </span>
              {uploadingCount > 0 && (
                <div className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin text-primary" />
                  <span className="font-medium text-primary">{uploadingCount} active</span>
                </div>
              )}
            </div>
          )}
          
          {uploadingFiles.map((item) => (
            <div
              key={item.id}
              className="flex items-center gap-3 rounded-lg border bg-card p-3"
            >
              <div className="flex-1 min-w-0">
                <p className="truncate text-sm font-medium">{item.file.name}</p>
                <p className="text-xs text-muted-foreground">
                  {(item.file.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
              <div className="flex items-center gap-2">
                {item.status === 'uploading' && (
                  <Loader2 className="h-5 w-5 animate-spin text-primary" />
                )}
                {item.status === 'complete' && (
                  <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                )}
                {item.status === 'error' && (
                  <>
                    <AlertCircle className="h-5 w-5 text-destructive" />
                    <button
                      onClick={() => removeFile(item.id)}
                      className="rounded-full p-1 hover:bg-muted"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
