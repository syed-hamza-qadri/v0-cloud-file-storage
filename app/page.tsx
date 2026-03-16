'use client'

import useSWR from 'swr'
import { Cloud, HardDrive, FileUp, RefreshCw, Zap } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { UploadZone } from '@/components/upload-zone'
import { FileList, type FileItem } from '@/components/file-list'

const fetcher = (url: string) => fetch(url).then(res => res.json())

export default function CloudStoragePage() {
  const { data, error, isLoading, mutate } = useSWR<{ files: FileItem[] }>(
    '/api/files',
    fetcher,
    {
      revalidateOnFocus: false,
      dedupingInterval: 2000,
    }
  )

  const files = data?.files || []
  const isRefreshing = isLoading

  const handleRefresh = () => {
    mutate()
  }

  const handleUploadComplete = () => {
    // Revalidate immediately after upload
    mutate()
  }

  const handleDelete = async (url: string) => {
    // Optimistic update - remove file immediately from UI
    mutate(
      { files: files.filter(f => f.url !== url) },
      false
    )

    try {
      const response = await fetch('/api/delete', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      })

      if (!response.ok) throw new Error('Delete failed')
      
      // Revalidate to confirm deletion
      mutate()
    } catch (error) {
      console.error('Error deleting file:', error)
      // Revert on error
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
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary">
              <Cloud className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight">CloudVault</h1>
              <p className="text-xs text-muted-foreground">Engineering File Storage</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="hidden items-center gap-1 rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-600 sm:flex">
              <Zap className="h-3 w-3" />
              Edge-Powered
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={isRefreshing}
            >
              <RefreshCw className={`mr-2 h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8">
        {/* Stats Cards */}
        <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="flex items-center gap-4 rounded-xl border bg-card p-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
              <FileUp className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold">{files.length}</p>
              <p className="text-sm text-muted-foreground">Total Files</p>
            </div>
          </div>
          <div className="flex items-center gap-4 rounded-xl border bg-card p-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-emerald-500/10">
              <HardDrive className="h-6 w-6 text-emerald-500" />
            </div>
            <div>
              <p className="text-2xl font-bold">{formatTotalSize(totalSize)}</p>
              <p className="text-sm text-muted-foreground">Storage Used</p>
            </div>
          </div>
          <div className="flex items-center gap-4 rounded-xl border bg-card p-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-orange-500/10">
              <Cloud className="h-6 w-6 text-orange-500" />
            </div>
            <div>
              <p className="text-2xl font-bold">
                {files.filter(f => 
                  ['m', 'mat', 'mlx', 'ms14', 'ewprj'].includes(
                    f.filename.split('.').pop()?.toLowerCase() || ''
                  )
                ).length}
              </p>
              <p className="text-sm text-muted-foreground">MATLAB / Multisim</p>
            </div>
          </div>
        </div>

        {/* Upload Zone */}
        <section className="mb-8">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold">Upload Files</h2>
            <span className="text-xs text-muted-foreground">5 parallel uploads for max speed</span>
          </div>
          <UploadZone onUploadComplete={handleUploadComplete} />
        </section>

        {/* File List */}
        <section>
          <h2 className="mb-4 text-lg font-semibold">Your Files</h2>
          <FileList files={files} isLoading={isLoading} onDelete={handleDelete} />
        </section>

        {/* Supported File Types */}
        <section className="mt-12 rounded-xl border bg-muted/30 p-6">
          <h3 className="mb-4 font-semibold">Supported File Types</h3>
          <div className="grid grid-cols-2 gap-4 text-sm sm:grid-cols-3 lg:grid-cols-4">
            <div>
              <p className="font-medium text-orange-500">MATLAB</p>
              <p className="text-muted-foreground">.m, .mat, .mlx, .fig, .slx</p>
            </div>
            <div>
              <p className="font-medium text-emerald-500">Multisim</p>
              <p className="text-muted-foreground">.ms14, .ewprj, .ewb</p>
            </div>
            <div>
              <p className="font-medium text-yellow-500">Archives</p>
              <p className="text-muted-foreground">.zip, .rar, .7z, .tar, .gz</p>
            </div>
            <div>
              <p className="font-medium text-amber-500">Data</p>
              <p className="text-muted-foreground">.json, .xml, .csv, .yaml</p>
            </div>
            <div>
              <p className="font-medium text-violet-500">Database</p>
              <p className="text-muted-foreground">.sql, .db, .sqlite, .mdb</p>
            </div>
            <div>
              <p className="font-medium text-red-500">Documents</p>
              <p className="text-muted-foreground">.pdf, .doc, .docx, .txt, .rtf</p>
            </div>
            <div>
              <p className="font-medium text-rose-500">Presentations</p>
              <p className="text-muted-foreground">.ppt, .pptx, .odp, .key</p>
            </div>
            <div>
              <p className="font-medium text-green-500">Spreadsheets</p>
              <p className="text-muted-foreground">.xlsx, .xls, .csv, .ods</p>
            </div>
            <div>
              <p className="font-medium text-blue-500">Code</p>
              <p className="text-muted-foreground">.py, .js, .ts, .c, .cpp, .java</p>
            </div>
            <div>
              <p className="font-medium text-pink-500">Images</p>
              <p className="text-muted-foreground">.jpg, .png, .gif, .svg, .webp</p>
            </div>
            <div>
              <p className="font-medium text-purple-500">Video</p>
              <p className="text-muted-foreground">.mp4, .avi, .mov, .mkv</p>
            </div>
            <div>
              <p className="font-medium text-cyan-500">Audio</p>
              <p className="text-muted-foreground">.mp3, .wav, .ogg, .flac</p>
            </div>
          </div>
        </section>

        {/* Performance Info */}
        <section className="mt-6 rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4">
          <div className="flex items-start gap-3">
            <Zap className="mt-0.5 h-5 w-5 text-emerald-500" />
            <div>
              <h4 className="font-medium text-emerald-700 dark:text-emerald-400">Optimized for Speed</h4>
              <p className="mt-1 text-sm text-muted-foreground">
                Edge runtime for ultra-fast API responses, parallel uploads (5 concurrent), 
                SWR caching for instant UI updates, and optimistic updates for seamless interactions.
              </p>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t py-6">
        <div className="mx-auto max-w-6xl px-4 text-center text-sm text-muted-foreground">
          <p>CloudVault - Fast, secure cloud storage for your engineering files</p>
        </div>
      </footer>
    </div>
  )
}
