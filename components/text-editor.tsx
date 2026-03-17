'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { Copy, Trash2, Check, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

interface TextEditorProps {
  onSaveComplete: () => void
}

export function TextEditor({ onSaveComplete }: TextEditorProps) {
  const [text, setText] = useState('')
  const [filename, setFilename] = useState('note.txt')
  const [isSaving, setIsSaving] = useState(false)
  const [copied, setCopied] = useState(false)
  const [lastSaved, setLastSaved] = useState<string | null>(null)
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle')
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const lastTextRef = useRef('')

  // Auto-save function
  const saveText = useCallback(async (content: string, name: string) => {
    if (!content.trim()) return
    
    setIsSaving(true)
    setSaveStatus('saving')
    
    try {
      const blob = new Blob([content], { type: 'text/plain' })
      const file = new File([blob], name, { type: 'text/plain' })
      
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) throw new Error('Save failed')
      
      lastTextRef.current = content
      setLastSaved(new Date().toLocaleTimeString())
      setSaveStatus('saved')
      onSaveComplete()
      
      // Reset status after 2 seconds
      setTimeout(() => setSaveStatus('idle'), 2000)
    } catch (error) {
      console.error('Save error:', error)
      setSaveStatus('idle')
    } finally {
      setIsSaving(false)
    }
  }, [onSaveComplete])

  // Real-time auto-save with debounce (500ms after user stops typing)
  useEffect(() => {
    if (!text.trim() || text === lastTextRef.current) return

    // Clear existing timeout
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current)
    }

    // Set new timeout for auto-save
    saveTimeoutRef.current = setTimeout(() => {
      saveText(text, filename)
    }, 500)

    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current)
      }
    }
  }, [text, filename, saveText])

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
    lastTextRef.current = ''
    setLastSaved(null)
    setSaveStatus('idle')
    textareaRef.current?.focus()
  }

  return (
    <div className="rounded-lg border bg-card">
      <div className="flex items-center justify-between border-b p-3">
        <div className="flex items-center gap-3">
          <Input
            value={filename}
            onChange={(e) => setFilename(e.target.value)}
            placeholder="filename.txt"
            className="h-8 w-40 text-sm"
          />
          {saveStatus === 'saving' && (
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Loader2 className="h-3 w-3 animate-spin" />
              Saving...
            </div>
          )}
          {saveStatus === 'saved' && (
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Check className="h-3 w-3" />
              Saved
            </div>
          )}
        </div>
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
        </div>
      </div>
      <textarea
        ref={textareaRef}
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Start typing... Auto-saves as you type"
        className="min-h-[180px] w-full resize-y bg-transparent p-4 font-mono text-sm focus:outline-none"
        style={{ whiteSpace: 'pre-wrap' }}
      />
      <div className="flex items-center justify-between border-t px-4 py-2 text-xs text-muted-foreground">
        <span>{text.length} characters</span>
        {lastSaved && <span>Last saved: {lastSaved}</span>}
      </div>
    </div>
  )
}
