'use client'

import useSWR from 'swr'
import { Cloud, HardDrive, FileUp, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { UploadZone } from '@/components/upload-zone'
import { FileList, type FileItem } from '@/components/file-list'
import { TextEditor } from '@/components/text-editor'
import { PasteZone } from '@/components/paste-zone'

const fetcher = (url: string) => fetch(url).then(res => res.json())

export default function CloudStoragePage() {
  const { data, error, isLoading, mutate } = useSWR<{ files: FileItem[] }>(
    '/api/files',
    fetcher,
    {
      revalidateOnFocus: true,
      dedupingInterval: 500,
      refreshInterval: 3000,
    }
  )

  const files = data?.files || []
  const isRefreshing = isLoading

  const handleRefresh = () => {
    mutate()
  }

  const handleUploadComplete = () => {
    mutate()
  }

  const handleDelete = async (pathname: string) => {
    mutate(
      { files: files.filter(f => f.pathname !== pathname) },
      false
    )

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
  const formatTotalSize = (bytes: number) => {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <Cloud className="h-6 w-6" />
            <h1 className="text-lg font-semibold">CloudVault</h1>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleRefresh}
            disabled={isRefreshing}
          >
            <RefreshCw className={`mr-2 h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-6">
        {/* Stats */}
        <div className="mb-6 flex gap-6 text-sm">
          <div className="flex items-center gap-2">
            <FileUp className="h-4 w-4 text-muted-foreground" />
            <span className="font-medium">{files.length}</span>
            <span className="text-muted-foreground">files</span>
          </div>
          <div className="flex items-center gap-2">
            <HardDrive className="h-4 w-4 text-muted-foreground" />
            <span className="font-medium">{formatTotalSize(totalSize)}</span>
            <span className="text-muted-foreground">used</span>
          </div>
        </div>

        {/* Paste Zone - Ctrl+V images sync across all devices */}
        <section className="mb-6">
          <PasteZone />
        </section>

        {/* Real-time Shared Text - Syncs across all devices */}
        <section className="mb-6">
          <TextEditor />
        </section>

        {/* Upload Zone */}
        <section className="mb-6">
          <UploadZone onUploadComplete={handleUploadComplete} />
        </section>

        {/* File List */}
        <section>
          <FileList files={files} isLoading={isLoading} onDelete={handleDelete} />
        </section>
      </main>
    </div>
  )
}
