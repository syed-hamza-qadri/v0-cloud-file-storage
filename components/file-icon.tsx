'use client'

import { FileText, FileCode, FileSpreadsheet, File, FileArchive, FileImage, FileVideo, FileAudio, Cpu, Zap } from 'lucide-react'

interface FileIconProps {
  filename: string
  className?: string
}

export function FileIcon({ filename, className = 'h-8 w-8' }: FileIconProps) {
  const ext = filename.split('.').pop()?.toLowerCase() || ''

  // MATLAB files
  if (['m', 'mat', 'mlx', 'mlapp', 'fig', 'slx'].includes(ext)) {
    return (
      <div className={`${className} flex items-center justify-center rounded-lg bg-orange-500/10`}>
        <Cpu className="h-5 w-5 text-orange-500" />
      </div>
    )
  }

  // Multisim files
  if (['ms14', 'ms13', 'ms12', 'ms11', 'ms10', 'ewprj', 'ewb'].includes(ext)) {
    return (
      <div className={`${className} flex items-center justify-center rounded-lg bg-emerald-500/10`}>
        <Zap className="h-5 w-5 text-emerald-500" />
      </div>
    )
  }

  // Code files
  if (['js', 'ts', 'jsx', 'tsx', 'py', 'c', 'cpp', 'h', 'java', 'html', 'css', 'json', 'xml'].includes(ext)) {
    return (
      <div className={`${className} flex items-center justify-center rounded-lg bg-blue-500/10`}>
        <FileCode className="h-5 w-5 text-blue-500" />
      </div>
    )
  }

  // Spreadsheet files
  if (['xlsx', 'xls', 'csv'].includes(ext)) {
    return (
      <div className={`${className} flex items-center justify-center rounded-lg bg-green-500/10`}>
        <FileSpreadsheet className="h-5 w-5 text-green-500" />
      </div>
    )
  }

  // Document files
  if (['pdf', 'doc', 'docx', 'txt', 'rtf'].includes(ext)) {
    return (
      <div className={`${className} flex items-center justify-center rounded-lg bg-red-500/10`}>
        <FileText className="h-5 w-5 text-red-500" />
      </div>
    )
  }

  // Archive files
  if (['zip', 'rar', '7z', 'tar', 'gz'].includes(ext)) {
    return (
      <div className={`${className} flex items-center justify-center rounded-lg bg-yellow-500/10`}>
        <FileArchive className="h-5 w-5 text-yellow-500" />
      </div>
    )
  }

  // Image files
  if (['jpg', 'jpeg', 'png', 'gif', 'svg', 'webp', 'bmp'].includes(ext)) {
    return (
      <div className={`${className} flex items-center justify-center rounded-lg bg-pink-500/10`}>
        <FileImage className="h-5 w-5 text-pink-500" />
      </div>
    )
  }

  // Video files
  if (['mp4', 'avi', 'mov', 'mkv', 'webm'].includes(ext)) {
    return (
      <div className={`${className} flex items-center justify-center rounded-lg bg-purple-500/10`}>
        <FileVideo className="h-5 w-5 text-purple-500" />
      </div>
    )
  }

  // Audio files
  if (['mp3', 'wav', 'ogg', 'flac', 'aac'].includes(ext)) {
    return (
      <div className={`${className} flex items-center justify-center rounded-lg bg-cyan-500/10`}>
        <FileAudio className="h-5 w-5 text-cyan-500" />
      </div>
    )
  }

  // Default file icon
  return (
    <div className={`${className} flex items-center justify-center rounded-lg bg-muted`}>
      <File className="h-5 w-5 text-muted-foreground" />
    </div>
  )
}

export function getFileTypeLabel(filename: string): string {
  const ext = filename.split('.').pop()?.toLowerCase() || ''

  if (['m', 'mat', 'mlx', 'mlapp', 'fig', 'slx'].includes(ext)) {
    return 'MATLAB'
  }
  if (['ms14', 'ms13', 'ms12', 'ms11', 'ms10', 'ewprj', 'ewb'].includes(ext)) {
    return 'Multisim'
  }
  if (['js', 'ts', 'jsx', 'tsx', 'py', 'c', 'cpp', 'h', 'java'].includes(ext)) {
    return 'Code'
  }
  if (['xlsx', 'xls', 'csv'].includes(ext)) {
    return 'Spreadsheet'
  }
  if (['pdf', 'doc', 'docx', 'txt', 'rtf'].includes(ext)) {
    return 'Document'
  }
  if (['zip', 'rar', '7z', 'tar', 'gz'].includes(ext)) {
    return 'Archive'
  }
  if (['jpg', 'jpeg', 'png', 'gif', 'svg', 'webp', 'bmp'].includes(ext)) {
    return 'Image'
  }
  if (['mp4', 'avi', 'mov', 'mkv', 'webm'].includes(ext)) {
    return 'Video'
  }
  if (['mp3', 'wav', 'ogg', 'flac', 'aac'].includes(ext)) {
    return 'Audio'
  }

  return ext.toUpperCase() || 'File'
}
