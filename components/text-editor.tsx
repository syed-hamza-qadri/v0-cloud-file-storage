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
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const isLocalChange = useRef(false)

  // Real-time sync - poll every 2 seconds for updates from other devices
  const { data, mutate } = useSWR<{ content: string; updatedAt: string | null }>(
    '/api/note',
    fetcher,
    {
      refreshInterval: 2000,
      revalidateOnFocus: true,
      dedupingInterval: 1000,
    }
  )

  // Sync remote changes to local state (only if not currently editing)
  useEffect(() => {
    if (data?.content !== undefined && !isLocalChange.current) {
      setLocalText(data.content)
    }
    isLocalChange.current = false
  }, [data?.content])

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

  // Real-time auto-save with debounce (300ms after user stops typing)
  const handleTextChange = (newText: string) => {
    isLocalChange.current = true
    setLocalText(newText)

    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current)
    }

    saveTimeoutRef.current = setTimeout(() => {
      saveText(newText)
    }, 300)
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
