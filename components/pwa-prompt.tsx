'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Download, X, Share } from 'lucide-react'

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

export function PWAPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [showPrompt, setShowPrompt] = useState(false)
  const [isInstalled, setIsInstalled] = useState(false)
  const [isIOS, setIsIOS] = useState(false)
  const [dismissed, setDismissed] = useState(false)

  useEffect(() => {
    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true)
      return
    }

    // Check if dismissed before
    if (localStorage.getItem('pwa-dismissed') === 'true') {
      setDismissed(true)
      return
    }

    // Detect iOS
    const isIOSDevice = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as typeof window & { MSStream?: unknown }).MSStream
    setIsIOS(isIOSDevice)

    // Register service worker
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js')
        .then(() => console.log('[v0] Service worker registered'))
        .catch((err) => console.log('[v0] SW registration failed:', err))
    }

    // Show prompt for iOS after delay
    if (isIOSDevice) {
      setTimeout(() => setShowPrompt(true), 2000)
      return
    }

    const handler = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e as BeforeInstallPromptEvent)
      setShowPrompt(true)
      console.log('[v0] beforeinstallprompt fired')
    }

    window.addEventListener('beforeinstallprompt', handler)

    window.addEventListener('appinstalled', () => {
      setIsInstalled(true)
      setShowPrompt(false)
      setDeferredPrompt(null)
      console.log('[v0] App installed')
    })

    // Show prompt after delay if on Android/Chrome
    setTimeout(() => {
      if (!isIOSDevice) setShowPrompt(true)
    }, 3000)

    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  const handleInstall = async () => {
    if (!deferredPrompt) return

    deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice

    if (outcome === 'accepted') {
      setIsInstalled(true)
    }
    setDeferredPrompt(null)
    setShowPrompt(false)
  }

  const handleDismiss = () => {
    setShowPrompt(false)
    setDismissed(true)
    localStorage.setItem('pwa-dismissed', 'true')
  }

  if (isInstalled || !showPrompt || dismissed) return null

  // iOS Safari instructions
  if (isIOS) {
    return (
      <div className="fixed bottom-4 left-4 right-4 z-50 mx-auto max-w-md rounded-lg border bg-background p-4 shadow-lg">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-muted">
            <Share className="h-5 w-5" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold">Install CloudVault</h3>
            <p className="text-sm text-muted-foreground">
              Tap the share button then &quot;Add to Home Screen&quot;
            </p>
          </div>
          <Button variant="ghost" size="icon" onClick={handleDismiss} className="shrink-0">
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
    )
  }

  // Android/Desktop Chrome install prompt
  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 mx-auto max-w-md rounded-lg border bg-background p-4 shadow-lg">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-muted">
          <Download className="h-5 w-5" />
        </div>
        <div className="flex-1">
          <h3 className="font-semibold">Install CloudVault</h3>
          <p className="text-sm text-muted-foreground">
            Install for faster access and offline support
          </p>
        </div>
        <Button variant="ghost" size="icon" onClick={handleDismiss} className="shrink-0">
          <X className="h-4 w-4" />
        </Button>
      </div>
      {deferredPrompt ? (
        <div className="mt-3 flex gap-2">
          <Button onClick={handleInstall} className="flex-1">
            Install App
          </Button>
          <Button variant="outline" onClick={handleDismiss}>
            Not Now
          </Button>
        </div>
      ) : (
        <p className="mt-3 text-xs text-muted-foreground">
          Use Chrome menu &gt; Install app, or click the install icon in the address bar
        </p>
      )}
    </div>
  )
}
