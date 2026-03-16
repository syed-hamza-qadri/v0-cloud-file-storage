'use client'

import { useState, useCallback } from 'react'
import { Upload, X, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface UploadZoneProps {
  onUploadComplete: () => void
}

interface UploadingFile {
  file: File
  progress: number
  status: 'uploading' | 'complete' | 'error'
  error?: string
}

export function UploadZone({ onUploadComplete }: UploadZoneProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [uploadingFiles, setUploadingFiles] = useState<UploadingFile[]>([])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

  const uploadFile = async (file: File) => {
    const formData = new FormData()
    formData.append('file', file)

    setUploadingFiles(prev => [...prev, { file, progress: 0, status: 'uploading' }])

    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        throw new Error('Upload failed')
      }

      setUploadingFiles(prev =>
        prev.map(f =>
          f.file === file ? { ...f, progress: 100, status: 'complete' } : f
        )
      )

      // Remove completed file from list after 2 seconds
      setTimeout(() => {
        setUploadingFiles(prev => prev.filter(f => f.file !== file))
      }, 2000)

      onUploadComplete()
    } catch (error) {
      setUploadingFiles(prev =>
        prev.map(f =>
          f.file === file
            ? { ...f, status: 'error', error: 'Upload failed' }
            : f
        )
      )
    }
  }

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)

    const files = Array.from(e.dataTransfer.files)
    files.forEach(uploadFile)
  }, [])

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    files.forEach(uploadFile)
    e.target.value = ''
  }, [])

  const removeFile = (file: File) => {
    setUploadingFiles(prev => prev.filter(f => f.file !== file))
  }

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
          accept=".m,.mat,.mlx,.mlapp,.fig,.slx,.ms14,.ms13,.ms12,.ms11,.ms10,.ewprj,.ewb,*"
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
          or click to browse - supports MATLAB, Multisim, and all file types
        </p>
      </div>

      {/* Upload Progress */}
      {uploadingFiles.length > 0 && (
        <div className="space-y-2">
          {uploadingFiles.map((item, index) => (
            <div
              key={`${item.file.name}-${index}`}
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
                      onClick={() => removeFile(item.file)}
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
