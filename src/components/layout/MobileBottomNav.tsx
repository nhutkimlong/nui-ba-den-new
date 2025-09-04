import { Link, useLocation, useNavigate } from 'react-router-dom'
import { createPortal } from 'react-dom'
import { Map, Home, BookOpen, Mountain, User } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { cn } from '@/utils/cn'
import { useEffect, useState, useRef, useCallback } from 'react'

type MobileBottomNavProps = {
  visible?: boolean
}

const MobileBottomNav = ({ visible = false }: MobileBottomNavProps) => {
  const location = useLocation()
  const navigate = useNavigate()
  const [isPressed, setIsPressed] = useState<string | null>(null)
  const [pendingScrollToFooter, setPendingScrollToFooter] = useState(false)
  const [activeIndex, setActiveIndex] = useState(0)
  const [indicatorStyle, setIndicatorStyle] = useState({ left: 0, width: 0 })
  const navRef = useRef<HTMLUListElement>(null)
  const touchStartX = useRef<number>(0)
  const touchStartY = useRef<number>(0)
  const [swipeDirection, setSwipeDirection] = useState<'left' | 'right' | null>(null)

  const { isAuthenticated } = useAuth()
  const items = [
    { to: '/', label: 'Trang chủ', icon: Home },
    { to: '/map', label: 'Bản đồ', icon: Map },
    { to: '/guide', label: 'Cẩm nang', icon: BookOpen },
    { to: '/climb', label: 'Leo núi', icon: Mountain },
    { to: isAuthenticated ? '/profile' : '/personal', label: isAuthenticated ? 'Hồ sơ' : 'Cá nhân', icon: User },
  ]

  // Update active index based on current route
  useEffect(() => {
    const currentIndex = items.findIndex(item => item.to === location.pathname)
    if (currentIndex !== -1) {
      setActiveIndex(currentIndex)
    }
  }, [location.pathname])

  // Update pill indicator position
  const updateIndicatorPosition = useCallback(() => {
    if (!navRef.current) return
    
    const activeItem = navRef.current.children[activeIndex] as HTMLElement
    if (activeItem) {
      const itemRect = activeItem.getBoundingClientRect()
      const navRect = navRef.current.getBoundingClientRect()
      const left = itemRect.left - navRect.left + (itemRect.width * 0.15) // Center with padding
      const width = itemRect.width * 0.7 // Pill width is 70% of item width
      
      setIndicatorStyle({ left, width })
    }
  }, [activeIndex])

  useEffect(() => {
    updateIndicatorPosition()
    window.addEventListener('resize', updateIndicatorPosition)
    return () => window.removeEventListener('resize', updateIndicatorPosition)
  }, [updateIndicatorPosition])

  // Auto-hide on scroll: show when scrolling up, hide when scrolling down
  useEffect(() => {
    let lastY = window.scrollY
    let ticking = false
    const onScroll = () => {
      if (ticking) return
      window.requestAnimationFrame(() => {
        const currentY = window.scrollY
        const scrolledUp = currentY < lastY - 4
        const scrolledDown = currentY > lastY + 4
        lastY = currentY
        const root = document.documentElement
        // expose height variable in case it needs to be read elsewhere
        root.style.setProperty('--mobile-nav-height', '64px')
        if (scrolledDown) {
          root.style.setProperty('--mobile-nav-visible', '0')
        } else if (scrolledUp) {
          root.style.setProperty('--mobile-nav-visible', '1')
        }
        ticking = false
      })
      ticking = true
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Enhanced haptic feedback for mobile devices
  const triggerHapticFeedback = (type: 'light' | 'medium' | 'heavy' = 'light') => {
    if ('vibrate' in navigator) {
      const patterns = {
        light: [10],
        medium: [20],
        heavy: [30, 10, 30]
      }
      navigator.vibrate(patterns[type])
    }
  }

  // Swipe gesture handling for tab switching
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX
    touchStartY.current = e.touches[0].clientY
    setSwipeDirection(null)
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!touchStartX.current || !touchStartY.current) return

    const currentX = e.touches[0].clientX
    const currentY = e.touches[0].clientY
    const diffX = touchStartX.current - currentX
    const diffY = touchStartY.current - currentY

    // Only handle horizontal swipes (ignore vertical scrolling)
    if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 50) {
      const direction = diffX > 0 ? 'right' : 'left'
      setSwipeDirection(direction)
    }
  }

  const handleTouchEnd = () => {
    if (swipeDirection && items.length > 1) {
      const currentIndex = activeIndex
      let newIndex = currentIndex

      if (swipeDirection === 'left' && currentIndex < items.length - 1) {
        newIndex = currentIndex + 1
      } else if (swipeDirection === 'right' && currentIndex > 0) {
        newIndex = currentIndex - 1
      }

      if (newIndex !== currentIndex) {
        triggerHapticFeedback('medium')
        const targetItem = items[newIndex]
        navigate(targetItem.to)
      }
    }

    touchStartX.current = 0
    touchStartY.current = 0
    setSwipeDirection(null)
  }

  const handleClick = (item: any, e: React.MouseEvent) => {
    triggerHapticFeedback('light')
    
    // No special handling
  }

  const handlePointerDown = (itemTo: string) => {
    setIsPressed(itemTo)
    triggerHapticFeedback('light')
  }

  const handlePointerUp = () => {
    requestAnimationFrame(() => setIsPressed(null))
  }

  // Scroll behavior only on route change (avoid interrupting user scroll)
  useEffect(() => {
    if (pendingScrollToFooter && location.pathname === '/') {
      const footer = document.getElementById('footer')
      if (footer) footer.scrollIntoView({ behavior: 'smooth' })
      else window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' })
      setPendingScrollToFooter(false)
      return
    }
    // Default: go to top when path changes
    window.scrollTo({ top: 0, behavior: 'auto' })
  }, [location.pathname])

  const content = (
    <nav className={cn(
      "fixed bottom-0 left-0 right-0 z-[1100] md:hidden w-screen select-none transition-all duration-300 will-change-transform",
      visible ? "translate-y-0" : "translate-y-full"
    )}>
      <div className="w-full">
        {/* Modern solid background */}
        <div
          className="border-t border-gray-200 shadow-2xl h-mobile-nav pb-safe relative overflow-hidden"
          style={{ 
            paddingTop: 'env(safe-area-inset-top, 0px)',
            background: 'rgba(255,255,255,0.96)',
            backdropFilter: 'none',
            WebkitBackdropFilter: 'none'
          }}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          {/* Animated pill indicator */}
          <div
            className="absolute top-2 bg-primary-500/20 backdrop-blur-sm rounded-full transition-all duration-300 ease-out z-10"
            style={{
              left: `${indicatorStyle.left}px`,
              width: `${indicatorStyle.width}px`,
              height: '4px',
              transform: 'translateZ(0)', // Hardware acceleration
            }}
          />
          
          {/* Active pill background */}
          <div
            className="absolute top-3 bg-primary-500/10 backdrop-blur-sm rounded-full transition-all duration-300 ease-out z-0"
            style={{
              left: `${indicatorStyle.left - 8}px`,
              width: `${indicatorStyle.width + 16}px`,
              height: '58px',
              transform: 'translateZ(0)',
            }}
          />

          <ul ref={navRef} className="grid grid-cols-5 w-full h-full relative z-20">
            {items.map((item, index) => {
              const Icon = item.icon
              const active = location.pathname === item.to
              const isItemPressed = isPressed === item.to
              const isSwipeTarget = swipeDirection && (
                (swipeDirection === 'left' && index === activeIndex + 1) ||
                (swipeDirection === 'right' && index === activeIndex - 1)
              )
              
              return (
                <li key={item.to} className="relative">
                  <Link
                    to={item.to}
                    onClick={(e) => handleClick(item, e)}
                    onPointerDown={() => handlePointerDown(item.to)}
                    onPointerUp={handlePointerUp}
                    onPointerCancel={handlePointerUp}
                    onPointerLeave={handlePointerUp}
                    className={cn(
                      'flex flex-col items-center justify-center text-xs focus:outline-none h-[64px] relative',
                      'px-2 transition-all duration-300 ease-out touch-target haptic-feedback',
                      'focus-visible:ring-2 focus-visible:ring-primary-500/50 focus-visible:ring-offset-2 rounded-lg',
                      active ? 'text-primary-600' : 'text-neutral-600 hover:text-primary-500',
                      isItemPressed && 'scale-95',
                      isSwipeTarget && 'scale-105 text-primary-500'
                    )}
                    aria-current={active ? 'page' : undefined}
                    aria-label={`${item.label}${active ? ' (hiện tại)' : ''}`}
                  >
                    {/* Modern icon container with pill shape when active */}
                    <div className={cn(
                      'relative mb-1 transition-all duration-300 ease-out',
                      'flex items-center justify-center',
                      active && 'transform scale-110'
                    )}>
                      {/* Pill background for active state */}
                      {active && (
                        <div className="absolute inset-0 bg-primary-500/15 rounded-full scale-150 animate-pulse-soft" />
                      )}
                      
                      <Icon className={cn(
                        'w-6 h-6 transition-all duration-300 relative z-10',
                        active && 'stroke-[2.5] drop-shadow-sm filter brightness-110',
                        isSwipeTarget && 'stroke-[2.5]'
                      )} />
                      
                      {/* Enhanced ripple effect */}
                      {isItemPressed && (
                        <>
                          <div className="absolute inset-0 bg-primary-200/50 rounded-full animate-ping opacity-75 scale-150" />
                          <div className="absolute inset-0 bg-primary-300/30 rounded-full animate-ping opacity-50 scale-125" 
                               style={{ animationDelay: '0.1s' }} />
                        </>
                      )}
                      
                      {/* Swipe preview indicator */}
                      {isSwipeTarget && (
                        <div className="absolute inset-0 bg-primary-400/20 rounded-full animate-pulse scale-125" />
                      )}
                    </div>
                    
                    {/* Enhanced label with modern typography */}
                    <span className={cn(
                      'leading-none font-medium transition-all duration-300 text-center',
                      'tracking-tight',
                      active && 'font-semibold text-primary-600 drop-shadow-sm',
                      isSwipeTarget && 'font-semibold'
                    )}>
                      {item.label}
                    </span>
                    
                    {/* Active state glow effect */}
                    {active && (
                      <div className="absolute inset-0 bg-gradient-to-t from-primary-500/5 to-transparent rounded-lg pointer-events-none" />
                    )}
                  </Link>
                </li>
              )
            })}
          </ul>
          
          {/* Swipe hint indicator */}
          {swipeDirection && (
            <div className={cn(
              "absolute bottom-1 left-1/2 transform -translate-x-1/2",
              "text-xs text-primary-500 font-medium opacity-75",
              "transition-all duration-200"
            )}>
              {swipeDirection === 'left' ? '→' : '←'}
            </div>
          )}
        </div>
      </div>
    </nav>
  )

  if (typeof document !== 'undefined') {
    return createPortal(content, document.body)
  }
  return content
}

export default MobileBottomNav


