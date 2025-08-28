import { Link, useLocation, useNavigate } from 'react-router-dom'
import { createPortal } from 'react-dom'
import { Map, Home, BookOpen, Mountain, Phone } from 'lucide-react'
import { cn } from '@/utils/cn'
import { useEffect, useState } from 'react'

type MobileBottomNavProps = {
  visible?: boolean
}

const MobileBottomNav = ({ visible = false }: MobileBottomNavProps) => {
  const location = useLocation()
  const navigate = useNavigate()
  const [isPressed, setIsPressed] = useState<string | null>(null)
  const [pendingScrollToFooter, setPendingScrollToFooter] = useState(false)

  const items = [
    { to: '/', label: 'Trang chủ', icon: Home },
    { to: '/map', label: 'Bản đồ', icon: Map },
    { to: '/guide', label: 'Cẩm nang', icon: BookOpen },
    { to: '/climb', label: 'Leo núi', icon: Mountain },
    { to: '#footer', label: 'Liên hệ', icon: Phone, isContact: true },
  ]

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

  // Haptic feedback for mobile devices
  const triggerHapticFeedback = () => {
    if ('vibrate' in navigator) {
      navigator.vibrate(10) // Short vibration for feedback
    }
  }

  const handleClick = (item: any, e: React.MouseEvent) => {
    triggerHapticFeedback()
    
    if (item.isContact) {
      e.preventDefault()
      if (location.pathname !== '/') {
        setPendingScrollToFooter(true)
        navigate('/')
      } else {
        const footer = document.getElementById('footer')
        if (footer) footer.scrollIntoView({ behavior: 'smooth' })
        else window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' })
      }
    }
  }

  const handlePointerDown = (itemTo: string) => {
    setIsPressed(itemTo)
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
        <div
          className="bg-white/95 backdrop-blur-md supports-[backdrop-filter]:bg-white/80 border-t border-gray-200/50 shadow-2xl h-mobile-nav pb-safe"
          style={{ paddingTop: 'env(safe-area-inset-top, 0px)' }}
        >
          <ul className="grid grid-cols-5 w-full h-full">
            {items.map((item) => {
              const Icon = item.icon
              const active = location.pathname === item.to
              const isItemPressed = isPressed === item.to
              
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
                      'px-2 transition-all duration-200 ease-out',
                      'active:scale-95',
                      active ? 'text-primary-600' : 'text-gray-600 hover:text-primary-600',
                      isItemPressed && 'scale-95'
                    )}
                    aria-current={active ? 'page' : undefined}
                  >
                    {/* Active indicator */}
                    {active && (
                      <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-8 h-1 bg-primary-500 rounded-full" />
                    )}
                    
                    {/* Icon with improved styling */}
                    <div className={cn(
                      'relative mb-1 transition-all duration-200',
                      active && 'transform scale-110'
                    )}>
                      <Icon className={cn(
                        'w-6 h-6 transition-all duration-200',
                        active && 'stroke-[2.5] drop-shadow-sm'
                      )} />
                      
                      {/* Ripple effect */}
                      {isItemPressed && (
                        <div className="absolute inset-0 bg-primary-100 rounded-full animate-ping opacity-75" />
                      )}
                    </div>
                    
                    {/* Label with better typography */}
                    <span className={cn(
                      'leading-none font-medium transition-all duration-200',
                      active && 'font-semibold'
                    )}>
                      {item.label}
                    </span>
                  </Link>
                </li>
              )
            })}
          </ul>
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


