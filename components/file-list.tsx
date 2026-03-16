'use client'

import { useState } from 'react'
import { Download, Trash2, MoreVertical, Search, Grid3X3, List, ExternalLink } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { FileIcon, getFileTypeLabel } from './file-icon'
import { cn } from '@/lib/utils'

export interface FileItem {
  url: string
  pathname: string
  filename: string
  size: number
  uploadedAt: string
  contentType: string
}

interface FileListProps {
  files: FileItem[]
  isLoading: boolean
  onDelete: (url: string) => void
}

function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

function formatDate(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function FileList({ files, isLoading, onDelete }: FileListProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list')
  const [deletingUrl, setDeletingUrl] = useState<string | null>(null)

  const filteredFiles = files.filter(file =>
    file.filename.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleDelete = async (url: string) => {
    setDeletingUrl(url)
    await onDelete(url)
    setDeletingUrl(null)
  }

  const handleDownload = (url: string, filename: string) => {
    const link = document.createElement('a')
    link.href = url
    link.download = filename
    link.target = '_blank'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Search and View Toggle */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search files..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex items-center rounded-lg border bg-muted/50 p-1">
          <button
            onClick={() => setViewMode('list')}
            className={cn(
              'rounded-md p-2 transition-colors',
              viewMode === 'list' ? 'bg-background shadow-sm' : 'hover:bg-background/50'
            )}
          >
            <List className="h-4 w-4" />
          </button>
          <button
            onClick={() => setViewMode('grid')}
            className={cn(
              'rounded-md p-2 transition-colors',
              viewMode === 'grid' ? 'bg-background shadow-sm' : 'hover:bg-background/50'
            )}
          >
            <Grid3X3 className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* File List */}
      {filteredFiles.length === 0 ? (
        <div className="flex h-48 flex-col items-center justify-center rounded-xl border border-dashed bg-muted/30">
          <p className="text-muted-foreground">
            {searchQuery ? 'No files match your search' : 'No files uploaded yet'}
          </p>
        </div>
      ) : viewMode === 'list' ? (
        <div className="divide-y rounded-xl border bg-card">
          {filteredFiles.map((file) => (
            <div
              key={file.url}
              className="flex items-center gap-4 p-4 transition-colors hover:bg-muted/50"
            >
              <FileIcon filename={file.filename} />
              <div className="flex-1 min-w-0">
                <p className="truncate font-medium">{file.filename}</p>
                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                  <span className="inline-flex items-center rounded-full bg-muted px-2 py-0.5 text-xs font-medium">
                    {getFileTypeLabel(file.filename)}
                  </span>
                  <span>{formatFileSize(file.size)}</span>
                  <span className="hidden sm:inline">{formatDate(file.uploadedAt)}</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDownload(file.url, file.filename)}
                  className="hidden sm:flex"
                >
                  <Download className="mr-2 h-4 w-4" />
                  Download
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => handleDownload(file.url, file.filename)}>
                      <Download className="mr-2 h-4 w-4" />
                      Download
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => window.open(file.url, '_blank')}>
                      <ExternalLink className="mr-2 h-4 w-4" />
                      Open in new tab
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => handleDelete(file.url)}
                      className="text-destructive focus:text-destructive"
                      disabled={deletingUrl === file.url}
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      {deletingUrl === file.url ? 'Deleting...' : 'Delete'}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {filteredFiles.map((file) => (
            <div
              key={file.url}
              className="group relative flex flex-col items-center rounded-xl border bg-card p-4 transition-all hover:shadow-md"
            >
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="absolute right-2 top-2 rounded-full p-1 opacity-0 transition-opacity hover:bg-muted group-hover:opacity-100">
                    <MoreVertical className="h-4 w-4" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => handleDownload(file.url, file.filename)}>
                    <Download className="mr-2 h-4 w-4" />
                    Download
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => window.open(file.url, '_blank')}>
                    <ExternalLink className="mr-2 h-4 w-4" />
                    Open in new tab
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => handleDelete(file.url)}
                    className="text-destructive focus:text-destructive"
                    disabled={deletingUrl === file.url}
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    {deletingUrl === file.url ? 'Deleting...' : 'Delete'}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <FileIcon filename={file.filename} className="mb-3 h-12 w-12" />
              <p className="w-full truncate text-center text-sm font-medium">{file.filename}</p>
              <span className="mt-1 text-xs text-muted-foreground">{formatFileSize(file.size)}</span>
              <span className="mt-1 inline-flex items-center rounded-full bg-muted px-2 py-0.5 text-xs font-medium">
                {getFileTypeLabel(file.filename)}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
