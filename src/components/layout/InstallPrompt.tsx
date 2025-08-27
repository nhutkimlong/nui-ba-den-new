import { useEffect, useState } from 'react'
import { X } from 'lucide-react'

declare global {
  interface BeforeInstallPromptEvent extends Event {
    prompt: () => Promise<void>
    userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>
  }
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
        // Delay slightly to avoid showing immediately
        setTimeout(() => setVisible(true), 500)
      }
    }
    window.addEventListener('beforeinstallprompt', handler as EventListener)
    return () => window.removeEventListener('beforeinstallprompt', handler as EventListener)
  }, [])

  if (!visible || !deferredPrompt) return null

  const install = async () => {
    try {
      await deferredPrompt.prompt()
      await deferredPrompt.userChoice
    } finally {
      setVisible(false)
      setDeferredPrompt(null)
    }
  }

  return (
    <div className="fixed bottom-4 left-4 right-4 z-[1050] md:hidden">
      <div className="mx-auto max-w-2xl bg-white/95 backdrop-blur border border-gray-200 rounded-xl shadow-xl p-3 flex items-center gap-3">
        <div className="flex-1">
          <p className="text-sm font-semibold text-gray-800">Cài đặt ứng dụng</p>
          <p className="text-xs text-gray-600">Thêm "Núi Bà Đen" vào màn hình chính để dùng như app.</p>
        </div>
        <button onClick={install} className="btn btn-primary px-3 py-2 text-sm">Cài đặt</button>
        <button onClick={() => setVisible(false)} className="text-gray-400 hover:text-gray-600 p-2" aria-label="Đóng">
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}

export default InstallPrompt


