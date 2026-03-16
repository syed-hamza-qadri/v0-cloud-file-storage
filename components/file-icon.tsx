'use client'

import { FileText, FileCode, FileSpreadsheet, File, FileArchive, FileImage, FileVideo, FileAudio, Cpu, Zap, Database, Presentation, FileJson } from 'lucide-react'

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

  // JSON files (special handling)
  if (['json'].includes(ext)) {
    return (
      <div className={`${className} flex items-center justify-center rounded-lg bg-amber-500/10`}>
        <FileJson className="h-5 w-5 text-amber-500" />
      </div>
    )
  }

  // SQL / Database files
  if (['sql', 'db', 'sqlite', 'mdb', 'accdb'].includes(ext)) {
    return (
      <div className={`${className} flex items-center justify-center rounded-lg bg-violet-500/10`}>
        <Database className="h-5 w-5 text-violet-500" />
      </div>
    )
  }

  // Code files (expanded)
  if (['js', 'ts', 'jsx', 'tsx', 'py', 'c', 'cpp', 'h', 'hpp', 'java', 'html', 'css', 'scss', 'sass', 'less', 'xml', 'yaml', 'yml', 'sh', 'bash', 'ps1', 'bat', 'cmd', 'php', 'rb', 'go', 'rs', 'swift', 'kt', 'kts', 'scala', 'r', 'lua', 'pl', 'pm', 'vue', 'svelte', 'astro', 'md', 'mdx', 'ini', 'cfg', 'conf', 'env', 'gitignore', 'dockerfile', 'makefile', 'cmake', 'gradle', 'toml', 'lock'].includes(ext)) {
    return (
      <div className={`${className} flex items-center justify-center rounded-lg bg-blue-500/10`}>
        <FileCode className="h-5 w-5 text-blue-500" />
      </div>
    )
  }

  // Spreadsheet files (expanded)
  if (['xlsx', 'xls', 'xlsm', 'xlsb', 'xlt', 'xltx', 'csv', 'ods', 'numbers'].includes(ext)) {
    return (
      <div className={`${className} flex items-center justify-center rounded-lg bg-green-500/10`}>
        <FileSpreadsheet className="h-5 w-5 text-green-500" />
      </div>
    )
  }

  // Presentation files
  if (['ppt', 'pptx', 'pptm', 'pps', 'ppsx', 'pot', 'potx', 'odp', 'key'].includes(ext)) {
    return (
      <div className={`${className} flex items-center justify-center rounded-lg bg-rose-500/10`}>
        <Presentation className="h-5 w-5 text-rose-500" />
      </div>
    )
  }

  // Document files (expanded)
  if (['pdf', 'doc', 'docx', 'docm', 'dot', 'dotx', 'txt', 'rtf', 'odt', 'pages', 'tex', 'log', 'readme'].includes(ext)) {
    return (
      <div className={`${className} flex items-center justify-center rounded-lg bg-red-500/10`}>
        <FileText className="h-5 w-5 text-red-500" />
      </div>
    )
  }

  // Archive files (expanded)
  if (['zip', 'rar', '7z', 'tar', 'gz', 'bz2', 'xz', 'tgz', 'tbz2', 'lz', 'lzma', 'cab', 'iso', 'dmg', 'pkg', 'deb', 'rpm'].includes(ext)) {
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
  if (['json'].includes(ext)) {
    return 'JSON'
  }
  if (['sql', 'db', 'sqlite', 'mdb', 'accdb'].includes(ext)) {
    return 'Database'
  }
  if (['js', 'ts', 'jsx', 'tsx', 'py', 'c', 'cpp', 'h', 'hpp', 'java', 'html', 'css', 'scss', 'sass', 'less', 'xml', 'yaml', 'yml', 'sh', 'bash', 'ps1', 'bat', 'cmd', 'php', 'rb', 'go', 'rs', 'swift', 'kt', 'kts', 'scala', 'r', 'lua', 'pl', 'pm', 'vue', 'svelte', 'astro', 'md', 'mdx', 'ini', 'cfg', 'conf', 'env', 'gitignore', 'dockerfile', 'makefile', 'cmake', 'gradle', 'toml', 'lock'].includes(ext)) {
    return 'Code'
  }
  if (['xlsx', 'xls', 'xlsm', 'xlsb', 'xlt', 'xltx', 'csv', 'ods', 'numbers'].includes(ext)) {
    return 'Spreadsheet'
  }
  if (['ppt', 'pptx', 'pptm', 'pps', 'ppsx', 'pot', 'potx', 'odp', 'key'].includes(ext)) {
    return 'Presentation'
  }
  if (['pdf', 'doc', 'docx', 'docm', 'dot', 'dotx', 'txt', 'rtf', 'odt', 'pages', 'tex', 'log', 'readme'].includes(ext)) {
    return 'Document'
  }
  if (['zip', 'rar', '7z', 'tar', 'gz', 'bz2', 'xz', 'tgz', 'tbz2', 'lz', 'lzma', 'cab', 'iso', 'dmg', 'pkg', 'deb', 'rpm'].includes(ext)) {
    return 'Archive'
  }
  if (['jpg', 'jpeg', 'png', 'gif', 'svg', 'webp', 'bmp', 'ico', 'tiff', 'tif', 'psd', 'ai', 'eps', 'raw', 'cr2', 'nef', 'heic', 'heif'].includes(ext)) {
    return 'Image'
  }
  if (['mp4', 'avi', 'mov', 'mkv', 'webm', 'flv', 'wmv', 'm4v', '3gp', 'mpeg', 'mpg'].includes(ext)) {
    return 'Video'
  }
  if (['mp3', 'wav', 'ogg', 'flac', 'aac', 'm4a', 'wma', 'aiff', 'alac'].includes(ext)) {
    return 'Audio'
  }

  return ext.toUpperCase() || 'File'
}
