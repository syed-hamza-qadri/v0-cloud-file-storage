'use client'

import useSWR from 'swr'
import { Cloud, HardDrive, FileUp, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { TextEditor } from '@/components/text-editor'
import { PasteZone } from '@/components/paste-zone'
import { UploadZone } from '@/components/upload-zone'
import { FileList, type FileItem } from '@/components/file-list'

const fetcher = (url: string) => fetch(url).then(res => res.json())

export default function CloudStoragePage() {
  const { data, error, isLoading, mutate } = useSWR<{ files: FileItem[] }>(
    '/api/files',
    fetcher,
    {
      revalidateOnFocus: true,
      dedupingInterval: 500,
      refreshInterval: 2000,
    }
  )

  const files = data?.files || []

  const handleDelete = async (pathname: string) => {
    mutate({ files: files.filter(f => f.pathname !== pathname) }, false)

    try {
      const response = await fetch('/api/delete', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pathname }),
      })
      if (!response.ok) throw new Error('Delete failed')
      mutate()
    } catch (error) {
      console.error('Error deleting file:', error)
      mutate()
    }
  }

  const totalSize = files.reduce((sum, file) => sum + file.size, 0)
  const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur">
        <div className="mx-auto flex h-12 max-w-4xl items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <Cloud className="h-5 w-5" />
            <h1 className="font-semibold">CloudVault</h1>
          </div>
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <FileUp className="h-3.5 w-3.5" />
              {files.length}
            </span>
            <span className="flex items-center gap-1">
              <HardDrive className="h-3.5 w-3.5" />
              {formatSize(totalSize)}
            </span>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={() => mutate()}
            >
              <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-4xl space-y-4 px-4 py-4">
        {/* 1. Text Editor - Real-time sync */}
        <TextEditor />

        {/* 2. Images - Ctrl+V paste */}
        <PasteZone />

        {/* 3. Files - Upload & Ctrl+V */}
        <UploadZone onUploadComplete={() => mutate()} />

        {/* 4. File List */}
        <FileList files={files} isLoading={isLoading} onDelete={handleDelete} />
      </main>
    </div>
  )
}
