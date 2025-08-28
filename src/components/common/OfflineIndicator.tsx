import React, { useState, useEffect } from 'react'
import { Wifi, WifiOff } from 'lucide-react'
import { cn } from '@/utils/cn'

interface OfflineIndicatorProps {
  className?: string
  showWhenOnline?: boolean
}

const OfflineIndicator: React.FC<OfflineIndicatorProps> = ({
  className,
  showWhenOnline = false
}) => {
  const [isOnline, setIsOnline] = useState(navigator.onLine)
  const [showIndicator, setShowIndicator] = useState(false)

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true)
      setShowIndicator(true)
      setTimeout(() => setShowIndicator(false), 3000)
    }

    const handleOffline = () => {
      setIsOnline(false)
      setShowIndicator(true)
    }

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  // Don't show indicator if online and showWhenOnline is false
  if (isOnline && !showWhenOnline) {
    return null
  }

  // Don't show indicator if offline and showWhenOnline is true
  if (!isOnline && showWhenOnline) {
    return null
  }

  return (
    <div
      className={cn(
        'fixed top-4 left-1/2 transform -translate-x-1/2 z-[3000]',
        'flex items-center gap-2 px-4 py-2 rounded-full shadow-lg backdrop-blur-sm',
        'transition-all duration-300',
        showIndicator ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0',
        isOnline 
          ? 'bg-green-50 border border-green-200 text-green-800' 
          : 'bg-red-50 border border-red-200 text-red-800',
        className
      )}
      role="status"
      aria-live="polite"
    >
      {isOnline ? (
        <Wifi className="w-4 h-4" />
      ) : (
        <WifiOff className="w-4 h-4" />
      )}
      <span className="text-sm font-medium">
        {isOnline ? 'Đã kết nối lại' : 'Không có kết nối internet'}
      </span>
    </div>
  )
}

interface ConnectionStatusProps {
  className?: string
  variant?: 'indicator' | 'banner'
}

const ConnectionStatus: React.FC<ConnectionStatusProps> = ({
  className,
  variant = 'indicator'
}) => {
  const [isOnline, setIsOnline] = useState(navigator.onLine)

  useEffect(() => {
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  if (variant === 'banner' && !isOnline) {
    return (
      <div className={cn(
        'bg-red-600 text-white px-4 py-2 text-center text-sm font-medium',
        className
      )}>
        <div className="flex items-center justify-center gap-2">
          <WifiOff className="w-4 h-4" />
          <span>Không có kết nối internet. Một số tính năng có thể không hoạt động.</span>
        </div>
      </div>
    )
  }

  return (
    <div className={cn(
      'flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium',
      isOnline 
        ? 'bg-green-100 text-green-800' 
        : 'bg-red-100 text-red-800',
      className
    )}>
      {isOnline ? (
        <Wifi className="w-3 h-3" />
      ) : (
        <WifiOff className="w-3 h-3" />
      )}
      <span>
        {isOnline ? 'Trực tuyến' : 'Ngoại tuyến'}
      </span>
    </div>
  )
}

export { OfflineIndicator, ConnectionStatus }
