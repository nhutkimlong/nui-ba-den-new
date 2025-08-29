import { ReactNode, useState, useEffect, useRef, useCallback } from 'react'
import { cn } from '@/utils/cn'
import { useDevice } from './DeviceDetector'

interface AdaptiveLayoutProps {
  children: ReactNode
  className?: string
  sidebar?: ReactNode
  bottomNav?: ReactNode
  variant?: 'mobile' | 'tablet' | 'desktop' | 'auto'
  sidebarWidth?: number
  showSidebarOnDesktop?: boolean
  showSidebarOnTablet?: boolean
  showSidebarOnMobile?: boolean
  enableGestures?: boolean
  transitionDuration?: number
}

const AdaptiveLayout = ({
  children,
  className,
  sidebar,
  bottomNav,
  variant = 'auto',
  sidebarWidth = 280,
  showSidebarOnDesktop = true,
  showSidebarOnTablet = false,
  showSidebarOnMobile = false,
  enableGestures = true,
  transitionDuration = 300
}: AdaptiveLayoutProps) => {
  const device = useDevice()
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [isTransitioning, setIsTransitioning] = useState(false)
  const sidebarRef = useRef<HTMLDivElement>(null)
  const startXRef = useRef<number>(0)
  const currentXRef = useRef<number>(0)
  const isDraggingRef = useRef<boolean>(false)

  // Determine current layout variant
  const currentVariant = variant === 'auto' 
    ? (device.isMobile ? 'mobile' : device.isTablet ? 'tablet' : 'desktop')
    : variant

  // Handle smooth transitions between layouts
  useEffect(() => {
    setIsTransitioning(true)
    const timer = setTimeout(() => setIsTransitioning(false), transitionDuration)
    return () => clearTimeout(timer)
  }, [currentVariant, transitionDuration])

  // Gesture handlers for sidebar
  const handleTouchStart = useCallback((e: TouchEvent) => {
    if (!enableGestures || currentVariant === 'desktop') return
    
    const touch = e.touches[0]
    startXRef.current = touch.clientX
    currentXRef.current = touch.clientX
    isDraggingRef.current = false
  }, [enableGestures, currentVariant])

  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (!enableGestures || currentVariant === 'desktop') return
    
    const touch = e.touches[0]
    const deltaX = touch.clientX - startXRef.current
    currentXRef.current = touch.clientX
    
    // Start dragging if moved more than 10px
    if (Math.abs(deltaX) > 10) {
      isDraggingRef.current = true
    }
    
    // Handle sidebar gesture
    if (isDraggingRef.current) {
      const isSwipeRight = deltaX > 0
      const isSwipeLeft = deltaX < 0
      
      // Open sidebar with right swipe from left edge
      if (isSwipeRight && startXRef.current < 50 && !isSidebarOpen) {
        e.preventDefault()
        const progress = Math.min(deltaX / sidebarWidth, 1)
        if (sidebarRef.current) {
          sidebarRef.current.style.transform = `translateX(${-sidebarWidth + (progress * sidebarWidth)}px)`
        }
      }
      
      // Close sidebar with left swipe
      if (isSwipeLeft && isSidebarOpen) {
        e.preventDefault()
        const progress = Math.max(deltaX / sidebarWidth, -1)
        if (sidebarRef.current) {
          sidebarRef.current.style.transform = `translateX(${progress * sidebarWidth}px)`
        }
      }
    }
  }, [enableGestures, currentVariant, isSidebarOpen, sidebarWidth])

  const handleTouchEnd = useCallback((e: TouchEvent) => {
    if (!enableGestures || currentVariant === 'desktop' || !isDraggingRef.current) return
    
    const deltaX = currentXRef.current - startXRef.current
    const threshold = sidebarWidth * 0.3 // 30% threshold
    
    // Reset transform
    if (sidebarRef.current) {
      sidebarRef.current.style.transform = ''
    }
    
    // Determine if should open/close sidebar
    if (Math.abs(deltaX) > threshold) {
      if (deltaX > 0 && !isSidebarOpen) {
        setIsSidebarOpen(true)
      } else if (deltaX < 0 && isSidebarOpen) {
        setIsSidebarOpen(false)
      }
    }
    
    isDraggingRef.current = false
  }, [enableGestures, currentVariant, isSidebarOpen, sidebarWidth])

  // Add gesture event listeners
  useEffect(() => {
    if (!enableGestures) return
    
    document.addEventListener('touchstart', handleTouchStart, { passive: false })
    document.addEventListener('touchmove', handleTouchMove, { passive: false })
    document.addEventListener('touchend', handleTouchEnd, { passive: false })
    
    return () => {
      document.removeEventListener('touchstart', handleTouchStart)
      document.removeEventListener('touchmove', handleTouchMove)
      document.removeEventListener('touchend', handleTouchEnd)
    }
  }, [handleTouchStart, handleTouchMove, handleTouchEnd, enableGestures])

  const shouldShowSidebar = 
    (currentVariant === 'desktop' && showSidebarOnDesktop) ||
    (currentVariant === 'tablet' && showSidebarOnTablet) ||
    (currentVariant === 'mobile' && showSidebarOnMobile)

  const isSidebarVisible = shouldShowSidebar && (currentVariant === 'desktop' || isSidebarOpen)

  return (
    <div 
      className={cn(
        "flex h-full transition-all duration-300 ease-in-out",
        isTransitioning && "pointer-events-none",
        className
      )}
      style={{
        '--transition-duration': `${transitionDuration}ms`
      } as React.CSSProperties}
    >
      {/* Sidebar */}
      {sidebar && shouldShowSidebar && (
        <>
          {/* Desktop Sidebar */}
          {currentVariant === 'desktop' && (
            <aside 
              className={cn(
                        "hidden lg:block bg-white/95 border-r border-gray-200 shadow-sm transition-all duration-300"
              )}
              style={{ width: sidebarWidth }}
            >
              <div className="h-full overflow-y-auto">
                {sidebar}
              </div>
            </aside>
          )}
          
          {/* Mobile/Tablet Sidebar */}
          {(currentVariant === 'mobile' || currentVariant === 'tablet') && (
            <div
              ref={sidebarRef}
              className={cn(
                "fixed inset-y-0 left-0 z-[1300] transform transition-all ease-out",
                isSidebarOpen ? "translate-x-0" : "-translate-x-full"
              )}
              style={{ 
                width: sidebarWidth,
                transitionDuration: `${transitionDuration}ms`
              }}
            >
              {/* Backdrop */}
              {isSidebarOpen && (
                <div 
                  className={cn(
                    "fixed inset-0 bg-black/20 backdrop-blur-sm z-[1200] transition-opacity",
                    "supports-[backdrop-filter]:bg-black/10"
                  )}
                  style={{ transitionDuration: `${transitionDuration}ms` }}
                  onClick={() => setIsSidebarOpen(false)}
                />
              )}
              
              {/* Sidebar Content */}
              <div className={cn(
                                          "relative h-full bg-white/95 shadow-2xl z-[1300]",
                  "border-r border-gray-200/50"
              )}>
                <div className="h-full overflow-y-auto">
                  {sidebar}
                </div>
                
                {/* Gesture indicator */}
                {enableGestures && (
                  <div className="absolute top-1/2 -right-3 transform -translate-y-1/2 w-1 h-12 bg-gray-300 rounded-full opacity-30" />
                )}
              </div>
            </div>
          )}
        </>
      )}

      {/* Main Content */}
      <main 
        className={cn(
          "flex-1 flex flex-col min-h-0 transition-all duration-300",
          currentVariant === 'desktop' && shouldShowSidebar && "lg:ml-0",
          currentVariant === 'mobile' && bottomNav && "pb-16" // Space for bottom nav
        )}
      >
        {/* Mobile/Tablet Sidebar Toggle */}
        {(currentVariant === 'mobile' || currentVariant === 'tablet') && shouldShowSidebar && (
          <button
            onClick={() => setIsSidebarOpen(true)}
            className={cn(
              "lg:hidden fixed top-4 left-4 z-[1100] p-3 bg-white/95 rounded-xl shadow-lg border border-gray-200",
              "hover:bg-white active:scale-95 transition-all duration-200"
            )}
            aria-label="Mở menu"
          >
            <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        )}

        {/* Main content area */}
        <div className="flex-1 overflow-hidden">
          {children}
        </div>
      </main>

      {/* Bottom Navigation for Mobile */}
      {currentVariant === 'mobile' && bottomNav && (
        <div className="fixed bottom-0 left-0 right-0 z-[1000]">
          {bottomNav}
        </div>
      )}
    </div>
  )
}

export default AdaptiveLayout
