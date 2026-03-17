'use client'

import { useState, useRef } from 'react'
import { Save, Copy, Trash2, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

interface TextEditorProps {
  onSaveComplete: () => void
}

export function TextEditor({ onSaveComplete }: TextEditorProps) {
  const [text, setText] = useState('')
  const [filename, setFilename] = useState('document.txt')
  const [isSaving, setIsSaving] = useState(false)
  const [copied, setCopied] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const handleSave = async () => {
    if (!text.trim()) return
    
    setIsSaving(true)
    try {
      // Create a file from the text content - preserves exact formatting
      const blob = new Blob([text], { type: 'text/plain' })
      const file = new File([blob], filename, { type: 'text/plain' })
      
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) throw new Error('Save failed')
      
      onSaveComplete()
      setText('')
      setFilename('document.txt')
    } catch (error) {
      console.error('Save error:', error)
    } finally {
      setIsSaving(false)
    }
  }

  const handleCopy = async () => {
    if (!text) return
    
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.error('Copy failed:', error)
    }
  }

  const handleClear = () => {
    setText('')
    setFilename('document.txt')
    textareaRef.current?.focus()
  }

  return (
    <div className="rounded-lg border bg-card">
      <div className="flex items-center justify-between border-b p-3">
        <Input
          value={filename}
          onChange={(e) => setFilename(e.target.value)}
          placeholder="filename.txt"
          className="h-8 w-48 text-sm"
        />
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleCopy}
            disabled={!text}
          >
            {copied ? (
              <>
                <Check className="mr-1.5 h-4 w-4" />
                Copied
              </>
            ) : (
              <>
                <Copy className="mr-1.5 h-4 w-4" />
                Copy
              </>
            )}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClear}
            disabled={!text}
          >
            <Trash2 className="mr-1.5 h-4 w-4" />
            Clear
          </Button>
          <Button
            size="sm"
            onClick={handleSave}
            disabled={!text.trim() || isSaving}
          >
            <Save className="mr-1.5 h-4 w-4" />
            {isSaving ? 'Saving...' : 'Save'}
          </Button>
        </div>
      </div>
      <textarea
        ref={textareaRef}
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Enter text here. Formatting, line breaks, and spacing will be preserved exactly as you type..."
        className="min-h-[200px] w-full resize-y bg-transparent p-4 font-mono text-sm focus:outline-none"
        style={{ whiteSpace: 'pre-wrap' }}
      />
      {text && (
        <div className="border-t px-4 py-2 text-xs text-muted-foreground">
          {text.length} characters
        </div>
      )}
    </div>
  )
}
