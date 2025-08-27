import { useEffect, useState } from 'react'
import { X } from 'lucide-react'

declare global {
  interface BeforeInstallPromptEvent extends Event {
    prompt: () => Promise<void>
    userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>
  }
}

const DISMISS_KEY = 'pwa_install_prompt_dismissed_at'
const DISMISS_COOLDOWN_DAYS = 30
const SEEN_KEY = 'pwa_install_prompt_seen'

const isSuppressed = (): boolean => {
  try {
    // If we've already shown once, never show again
    const seen = localStorage.getItem(SEEN_KEY)
    if (seen === '1') return true
    const ts = localStorage.getItem(DISMISS_KEY)
    if (!ts) return false
    const dismissedAt = parseInt(ts)
    if (Number.isNaN(dismissedAt)) return false
    const msSince = Date.now() - dismissedAt
    return msSince < DISMISS_COOLDOWN_DAYS * 24 * 60 * 60 * 1000
  } catch {
    return false
  }
}

const rememberDismiss = () => {
  try {
    localStorage.setItem(DISMISS_KEY, String(Date.now()))
  } catch {}
}

const rememberSeenOnce = () => {
  try {
    localStorage.setItem(SEEN_KEY, '1')
  } catch {}
}

const InstallPrompt = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e as BeforeInstallPromptEvent)
      // Only show on mobile screens
      if (window.matchMedia && window.matchMedia('(max-width: 768px)').matches) {
        // Respect dismissal cooldown
        if (!isSuppressed()) {
          // Delay slightly to avoid showing immediately
          rememberSeenOnce()
          setTimeout(() => setVisible(true), 500)
        }
      }
    }
    window.addEventListener('beforeinstallprompt', handler as EventListener)
    return () => window.removeEventListener('beforeinstallprompt', handler as EventListener)
  }, [])

  if (!visible || !deferredPrompt) return null

  const install = async () => {
    try {
      await deferredPrompt.prompt()
      const choice = await deferredPrompt.userChoice
      if (choice?.outcome === 'dismissed') {
        rememberDismiss()
      }
    } finally {
      setVisible(false)
      setDeferredPrompt(null)
    }
  }

  const close = () => {
    rememberDismiss()
    setVisible(false)
    setDeferredPrompt(null)
  }

  return (
    <div className="fixed inset-0 z-[1300] md:hidden flex items-center justify-center p-4">
      <div className="mx-auto max-w-2xl bg-white/95 backdrop-blur border border-gray-200 rounded-xl shadow-xl p-3 flex items-center gap-3">
        <div className="flex-1">
          <p className="text-sm font-semibold text-gray-800">Cài đặt ứng dụng</p>
          <p className="text-xs text-gray-600">Thêm "Núi Bà Đen" vào màn hình chính để dùng như app.</p>
        </div>
        <button onClick={install} className="btn btn-primary px-3 py-2 text-sm">Cài đặt</button>
        <button onClick={close} className="text-gray-400 hover:text-gray-600 p-2" aria-label="Đóng">
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}

export default InstallPrompt


