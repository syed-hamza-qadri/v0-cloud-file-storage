'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import useSWR from 'swr'
import { Copy, Trash2, Check, Loader2, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'

const fetcher = (url: string) => fetch(url).then(res => res.json())

export function TextEditor() {
  const [localText, setLocalText] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [copied, setCopied] = useState(false)
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle')
  const [lastSavedText, setLastSavedText] = useState('')
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const lastTypingTime = useRef(0)
  const isFocused = useRef(false)

  // Real-time sync - poll every 500ms for instant updates from other devices
  const { data, mutate } = useSWR<{ content: string; updatedAt: string | null }>(
    '/api/note',
    fetcher,
    {
      refreshInterval: 500,
      revalidateOnFocus: true,
      dedupingInterval: 300,
    }
  )

  // Sync remote changes to local state
  // Only skip if user is actively typing (within 1.5 seconds)
  useEffect(() => {
    if (data?.content === undefined) return
    
    const now = Date.now()
    const timeSinceTyping = now - lastTypingTime.current
    const remoteContent = data.content || ''
    
    // If user typed very recently (within 1.5s) and is focused, don't overwrite
    if (timeSinceTyping < 1500 && isFocused.current) {
      return
    }
    
    // Update local text if remote is different
    if (remoteContent !== localText && remoteContent !== lastSavedText) {
      setLocalText(remoteContent)
      setLastSavedText(remoteContent)
    } else if (!isFocused.current && remoteContent !== localText) {
      // If not focused, always sync from server
      setLocalText(remoteContent)
      setLastSavedText(remoteContent)
    }
  }, [data?.content, data?.updatedAt])

  // Auto-save function
  const saveText = useCallback(async (content: string) => {
    setIsSaving(true)
    setSaveStatus('saving')
    
    try {
      const response = await fetch('/api/note', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content }),
      })

      if (!response.ok) throw new Error('Save failed')
      
      setLastSavedText(content)
      setSaveStatus('saved')
      mutate({ content, updatedAt: new Date().toISOString() }, false)
      
      setTimeout(() => setSaveStatus('idle'), 1500)
    } catch (error) {
      console.error('Save error:', error)
      setSaveStatus('idle')
    } finally {
      setIsSaving(false)
    }
  }, [mutate])

  // Real-time auto-save with debounce (150ms after user stops typing for instant sync)
  const handleTextChange = (newText: string) => {
    lastTypingTime.current = Date.now()
    setLocalText(newText)

    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current)
    }

    saveTimeoutRef.current = setTimeout(() => {
      saveText(newText)
    }, 150)
  }

  const handleFocus = () => {
    isFocused.current = true
  }

  const handleBlur = () => {
    isFocused.current = false
  }

  const handleCopy = async () => {
    if (!localText) return
    
    try {
      await navigator.clipboard.writeText(localText)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.error('Copy failed:', error)
    }
  }

  const handleClear = async () => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current)
    }
    
    setLocalText('')
    setLastSavedText('')
    setSaveStatus('saving')
    
    try {
      await fetch('/api/note', { method: 'DELETE' })
      mutate({ content: '', updatedAt: null }, false)
      setSaveStatus('saved')
      setTimeout(() => setSaveStatus('idle'), 1500)
    } catch (error) {
      console.error('Clear failed:', error)
      setSaveStatus('idle')
    }
    
    textareaRef.current?.focus()
  }

  const handleRefresh = () => {
    lastTypingTime.current = 0
    mutate()
  }

  return (
    <div className="rounded-lg border bg-card">
      <div className="flex items-center justify-between border-b p-3">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">Shared Note</span>
          <span className="text-xs text-muted-foreground">(syncs across all devices)</span>
          {saveStatus === 'saving' && (
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Loader2 className="h-3 w-3 animate-spin" />
              Saving...
            </div>
          )}
          {saveStatus === 'saved' && (
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Check className="h-3 w-3" />
              Saved
            </div>
          )}
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={handleRefresh}
            title="Refresh"
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleCopy}
            disabled={!localText}
          >
            {copied ? (
              <>
                <Check className="mr-1 h-4 w-4" />
                Copied
              </>
            ) : (
              <>
                <Copy className="mr-1 h-4 w-4" />
                Copy
              </>
            )}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClear}
            disabled={!localText || isSaving}
          >
            <Trash2 className="mr-1 h-4 w-4" />
            Clear
          </Button>
        </div>
      </div>
      <textarea
        ref={textareaRef}
        value={localText}
        onChange={(e) => handleTextChange(e.target.value)}
        onFocus={handleFocus}
        onBlur={handleBlur}
        placeholder="Start typing... syncs in real-time across all devices"
        className="min-h-[200px] w-full resize-y bg-transparent p-4 font-mono text-sm focus:outline-none"
        style={{ whiteSpace: 'pre-wrap' }}
      />
      <div className="flex items-center justify-between border-t px-4 py-2 text-xs text-muted-foreground">
        <span>{localText.length} characters</span>
      </div>
    </div>
  )
}
