'use client'

import { useState } from 'react'
import { Download, Trash2, MoreVertical, Search, Copy, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { FileIcon, getFileTypeLabel, isTextFile } from './file-icon'

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
  onDelete: (pathname: string) => void
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
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function FileList({ files, isLoading, onDelete }: FileListProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [deletingUrl, setDeletingUrl] = useState<string | null>(null)
  const [copiedId, setCopiedId] = useState<string | null>(null)

  const filteredFiles = files.filter(file =>
    file.filename.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleDelete = async (pathname: string) => {
    setDeletingUrl(pathname)
    await onDelete(pathname)
    setDeletingUrl(null)
  }

  const handleDownload = async (pathname: string, filename: string) => {
    const downloadUrl = `/api/file?pathname=${encodeURIComponent(pathname)}`
    const link = document.createElement('a')
    link.href = downloadUrl
    link.download = filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const handleCopyContent = async (pathname: string) => {
    try {
      const response = await fetch(`/api/file?pathname=${encodeURIComponent(pathname)}`)
      const text = await response.text()
      await navigator.clipboard.writeText(text)
      setCopiedId(pathname)
      setTimeout(() => setCopiedId(null), 2000)
    } catch (error) {
      console.error('Copy failed:', error)
    }
  }

  if (isLoading) {
    return (
      <div className="flex h-32 items-center justify-center">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-foreground border-t-transparent" />
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search files..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* File List */}
      {filteredFiles.length === 0 ? (
        <div className="flex h-32 flex-col items-center justify-center rounded-lg border border-dashed">
          <p className="text-sm text-muted-foreground">
            {searchQuery ? 'No files match your search' : 'No files uploaded yet'}
          </p>
        </div>
      ) : (
        <div className="divide-y rounded-lg border">
          {filteredFiles.map((file) => (
            <div
              key={file.pathname}
              className="flex items-center gap-3 p-3 transition-colors hover:bg-muted/50"
            >
              <FileIcon filename={file.filename} className="h-8 w-8 shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="truncate text-sm font-medium">{file.filename}</p>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span>{getFileTypeLabel(file.filename)}</span>
                  <span>·</span>
                  <span>{formatFileSize(file.size)}</span>
                  <span className="hidden sm:inline">·</span>
                  <span className="hidden sm:inline">{formatDate(file.uploadedAt)}</span>
                </div>
              </div>
              <div className="flex items-center gap-1">
                {/* Copy button for text files */}
                {isTextFile(file.filename) && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => handleCopyContent(file.pathname)}
                  >
                    {copiedId === file.pathname ? (
                      <Check className="h-4 w-4" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => handleDownload(file.pathname, file.filename)}
                >
                  <Download className="h-4 w-4" />
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => handleDownload(file.pathname, file.filename)}>
                      <Download className="mr-2 h-4 w-4" />
                      Download
                    </DropdownMenuItem>
                    {isTextFile(file.filename) && (
                      <DropdownMenuItem onClick={() => handleCopyContent(file.pathname)}>
                        <Copy className="mr-2 h-4 w-4" />
                        Copy content
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem
                      onClick={() => handleDelete(file.pathname)}
                      className="text-destructive focus:text-destructive"
                      disabled={deletingUrl === file.pathname}
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      {deletingUrl === file.pathname ? 'Deleting...' : 'Delete'}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
