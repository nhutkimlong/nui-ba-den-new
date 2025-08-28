import { useEffect, useRef, useState } from 'react'
import { RefreshCw } from 'lucide-react'

interface PullToRefreshProps {
  onRefresh: () => Promise<void>
  children: React.ReactNode
  threshold?: number
  maxPull?: number
}

const PullToRefresh = ({ 
  onRefresh, 
  children, 
  threshold = 80, 
  maxPull = 120 
}: PullToRefreshProps) => {
  const [isPulling, setIsPulling] = useState(false)
  const [pullDistance, setPullDistance] = useState(0)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const startY = useRef<number>(0)
  const currentY = useRef<number>(0)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const handleTouchStart = (e: TouchEvent) => {
      // Only trigger if at the top of the scroll
      if (container.scrollTop <= 0) {
        startY.current = e.touches[0].clientY
        currentY.current = e.touches[0].clientY
        setIsPulling(true)
      }
    }

    const handleTouchMove = (e: TouchEvent) => {
      if (!isPulling) return

      currentY.current = e.touches[0].clientY
      const pull = Math.max(0, currentY.current - startY.current)
      
      if (pull > 0) {
        e.preventDefault()
        setPullDistance(Math.min(pull, maxPull))
      }
    }

    const handleTouchEnd = async () => {
      if (!isPulling) return

      if (pullDistance >= threshold) {
        setIsRefreshing(true)
        try {
          await onRefresh()
        } catch (error) {
          console.error('Pull to refresh failed:', error)
        } finally {
          setIsRefreshing(false)
        }
      }

      setIsPulling(false)
      setPullDistance(0)
    }

    container.addEventListener('touchstart', handleTouchStart, { passive: false })
    container.addEventListener('touchmove', handleTouchMove, { passive: false })
    container.addEventListener('touchend', handleTouchEnd, { passive: false })

    return () => {
      container.removeEventListener('touchstart', handleTouchStart)
      container.removeEventListener('touchmove', handleTouchMove)
      container.removeEventListener('touchend', handleTouchEnd)
    }
  }, [isPulling, pullDistance, threshold, maxPull, onRefresh])

  const progress = Math.min(pullDistance / threshold, 1)
  const rotation = progress * 360

  return (
    <div className="relative">
      {/* Pull indicator */}
      {(isPulling || isRefreshing) && (
        <div 
          className="absolute top-0 left-1/2 transform -translate-x-1/2 z-50 flex items-center justify-center"
          style={{ 
            top: `${Math.min(pullDistance, maxPull)}px`,
            transition: isRefreshing ? 'none' : 'top 0.1s ease-out'
          }}
        >
          <div className="bg-white rounded-full p-3 shadow-lg border border-gray-200">
            <RefreshCw 
              className={`w-6 h-6 text-primary-500 transition-all duration-200 ${
                isRefreshing ? 'animate-spin' : ''
              }`}
              style={{
                transform: isRefreshing ? 'none' : `rotate(${rotation}deg)`
              }}
            />
          </div>
        </div>
      )}

      {/* Content */}
      <div 
        ref={containerRef}
        className="w-full h-full overflow-auto"
        style={{
          transform: isPulling ? `translateY(${pullDistance * 0.3}px)` : 'none',
          transition: isPulling ? 'none' : 'transform 0.3s ease-out'
        }}
      >
        {children}
      </div>
    </div>
  )
}

export default PullToRefresh
