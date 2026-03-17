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
      <div className={`${className} flex items-center justify-center rounded-lg bg-muted`}>
        <Cpu className="h-5 w-5 text-foreground" />
      </div>
    )
  }

  // Multisim files
  if (['ms14', 'ms13', 'ms12', 'ms11', 'ms10', 'ewprj', 'ewb'].includes(ext)) {
    return (
      <div className={`${className} flex items-center justify-center rounded-lg bg-muted`}>
        <Zap className="h-5 w-5 text-foreground" />
      </div>
    )
  }

  // JSON files
  if (['json'].includes(ext)) {
    return (
      <div className={`${className} flex items-center justify-center rounded-lg bg-muted`}>
        <FileJson className="h-5 w-5 text-foreground" />
      </div>
    )
  }

  // SQL / Database files
  if (['sql', 'db', 'sqlite', 'mdb', 'accdb'].includes(ext)) {
    return (
      <div className={`${className} flex items-center justify-center rounded-lg bg-muted`}>
        <Database className="h-5 w-5 text-foreground" />
      </div>
    )
  }

  // Code files
  if (['js', 'ts', 'jsx', 'tsx', 'py', 'c', 'cpp', 'h', 'hpp', 'java', 'html', 'css', 'scss', 'sass', 'less', 'xml', 'yaml', 'yml', 'sh', 'bash', 'ps1', 'bat', 'cmd', 'php', 'rb', 'go', 'rs', 'swift', 'kt', 'kts', 'scala', 'r', 'lua', 'pl', 'pm', 'vue', 'svelte', 'astro', 'md', 'mdx', 'ini', 'cfg', 'conf', 'env', 'gitignore', 'dockerfile', 'makefile', 'cmake', 'gradle', 'toml', 'lock'].includes(ext)) {
    return (
      <div className={`${className} flex items-center justify-center rounded-lg bg-muted`}>
        <FileCode className="h-5 w-5 text-foreground" />
      </div>
    )
  }

  // Spreadsheet files
  if (['xlsx', 'xls', 'xlsm', 'xlsb', 'xlt', 'xltx', 'csv', 'ods', 'numbers'].includes(ext)) {
    return (
      <div className={`${className} flex items-center justify-center rounded-lg bg-muted`}>
        <FileSpreadsheet className="h-5 w-5 text-foreground" />
      </div>
    )
  }

  // Presentation files
  if (['ppt', 'pptx', 'pptm', 'pps', 'ppsx', 'pot', 'potx', 'odp', 'key'].includes(ext)) {
    return (
      <div className={`${className} flex items-center justify-center rounded-lg bg-muted`}>
        <Presentation className="h-5 w-5 text-foreground" />
      </div>
    )
  }

  // Document files
  if (['pdf', 'doc', 'docx', 'docm', 'dot', 'dotx', 'txt', 'rtf', 'odt', 'pages', 'tex', 'log', 'readme'].includes(ext)) {
    return (
      <div className={`${className} flex items-center justify-center rounded-lg bg-muted`}>
        <FileText className="h-5 w-5 text-foreground" />
      </div>
    )
  }

  // Archive files
  if (['zip', 'rar', '7z', 'tar', 'gz', 'bz2', 'xz', 'tgz', 'tbz2', 'lz', 'lzma', 'cab', 'iso', 'dmg', 'pkg', 'deb', 'rpm'].includes(ext)) {
    return (
      <div className={`${className} flex items-center justify-center rounded-lg bg-muted`}>
        <FileArchive className="h-5 w-5 text-foreground" />
      </div>
    )
  }

  // Image files
  if (['jpg', 'jpeg', 'png', 'gif', 'svg', 'webp', 'bmp', 'ico', 'tiff', 'tif', 'psd', 'ai', 'eps', 'raw', 'cr2', 'nef', 'heic', 'heif'].includes(ext)) {
    return (
      <div className={`${className} flex items-center justify-center rounded-lg bg-muted`}>
        <FileImage className="h-5 w-5 text-foreground" />
      </div>
    )
  }

  // Video files
  if (['mp4', 'avi', 'mov', 'mkv', 'webm', 'flv', 'wmv', 'm4v', '3gp', 'mpeg', 'mpg'].includes(ext)) {
    return (
      <div className={`${className} flex items-center justify-center rounded-lg bg-muted`}>
        <FileVideo className="h-5 w-5 text-foreground" />
      </div>
    )
  }

  // Audio files
  if (['mp3', 'wav', 'ogg', 'flac', 'aac', 'm4a', 'wma', 'aiff', 'alac'].includes(ext)) {
    return (
      <div className={`${className} flex items-center justify-center rounded-lg bg-muted`}>
        <FileAudio className="h-5 w-5 text-foreground" />
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

  if (['m', 'mat', 'mlx', 'mlapp', 'fig', 'slx'].includes(ext)) return 'MATLAB'
  if (['ms14', 'ms13', 'ms12', 'ms11', 'ms10', 'ewprj', 'ewb'].includes(ext)) return 'Multisim'
  if (['json'].includes(ext)) return 'JSON'
  if (['sql', 'db', 'sqlite', 'mdb', 'accdb'].includes(ext)) return 'Database'
  if (['js', 'ts', 'jsx', 'tsx', 'py', 'c', 'cpp', 'h', 'hpp', 'java', 'html', 'css', 'scss', 'sass', 'less', 'xml', 'yaml', 'yml', 'sh', 'bash', 'ps1', 'bat', 'cmd', 'php', 'rb', 'go', 'rs', 'swift', 'kt', 'kts', 'scala', 'r', 'lua', 'pl', 'pm', 'vue', 'svelte', 'astro', 'md', 'mdx', 'ini', 'cfg', 'conf', 'env', 'gitignore', 'dockerfile', 'makefile', 'cmake', 'gradle', 'toml', 'lock'].includes(ext)) return 'Code'
  if (['xlsx', 'xls', 'xlsm', 'xlsb', 'xlt', 'xltx', 'csv', 'ods', 'numbers'].includes(ext)) return 'Spreadsheet'
  if (['ppt', 'pptx', 'pptm', 'pps', 'ppsx', 'pot', 'potx', 'odp', 'key'].includes(ext)) return 'Presentation'
  if (['pdf', 'doc', 'docx', 'docm', 'dot', 'dotx', 'txt', 'rtf', 'odt', 'pages', 'tex', 'log', 'readme'].includes(ext)) return 'Document'
  if (['zip', 'rar', '7z', 'tar', 'gz', 'bz2', 'xz', 'tgz', 'tbz2', 'lz', 'lzma', 'cab', 'iso', 'dmg', 'pkg', 'deb', 'rpm'].includes(ext)) return 'Archive'
  if (['jpg', 'jpeg', 'png', 'gif', 'svg', 'webp', 'bmp', 'ico', 'tiff', 'tif', 'psd', 'ai', 'eps', 'raw', 'cr2', 'nef', 'heic', 'heif'].includes(ext)) return 'Image'
  if (['mp4', 'avi', 'mov', 'mkv', 'webm', 'flv', 'wmv', 'm4v', '3gp', 'mpeg', 'mpg'].includes(ext)) return 'Video'
  if (['mp3', 'wav', 'ogg', 'flac', 'aac', 'm4a', 'wma', 'aiff', 'alac'].includes(ext)) return 'Audio'

  return ext.toUpperCase() || 'File'
}

// Check if file is a text-based file that can be viewed/edited
export function isTextFile(filename: string): boolean {
  const ext = filename.split('.').pop()?.toLowerCase() || ''
  const textExtensions = [
    'txt', 'md', 'mdx', 'json', 'xml', 'yaml', 'yml', 'csv', 'sql',
    'js', 'ts', 'jsx', 'tsx', 'py', 'c', 'cpp', 'h', 'hpp', 'java',
    'html', 'css', 'scss', 'sass', 'less', 'sh', 'bash', 'ps1', 'bat', 'cmd',
    'php', 'rb', 'go', 'rs', 'swift', 'kt', 'kts', 'scala', 'r', 'lua',
    'pl', 'pm', 'vue', 'svelte', 'astro', 'ini', 'cfg', 'conf', 'env',
    'gitignore', 'dockerfile', 'makefile', 'cmake', 'gradle', 'toml', 'lock',
    'm', 'mat', 'log', 'rtf'
  ]
  return textExtensions.includes(ext)
}
