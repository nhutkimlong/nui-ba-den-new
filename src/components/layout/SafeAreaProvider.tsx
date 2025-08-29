import { ReactNode, useEffect, useState, createContext, useContext } from 'react'
import { cn } from '@/utils/cn'
import { useDevice } from './DeviceDetector'

interface SafeAreaInsets {
  top: number
  bottom: number
  left: number
  right: number
}

interface SafeAreaContextType {
  insets: SafeAreaInsets
  hasNotch: boolean
  hasHomeIndicator: boolean
  orientation: 'portrait' | 'landscape'
  isFullscreen: boolean
}

const SafeAreaContext = createContext<SafeAreaContextType | null>(null)

export const useSafeArea = () => {
  const context = useContext(SafeAreaContext)
  if (!context) {
    throw new Error('useSafeArea must be used within a SafeAreaProvider')
  }
  return context
}

interface SafeAreaProviderProps {
  children: ReactNode
  className?: string
  enableSafeArea?: boolean
  safeAreaTop?: boolean
  safeAreaBottom?: boolean
  safeAreaLeft?: boolean
  safeAreaRight?: boolean
  adaptToKeyboard?: boolean
  handleNotch?: boolean
  handleHomeIndicator?: boolean
}

const SafeAreaProvider = ({
  children,
  className,
  enableSafeArea = true,
  safeAreaTop = true,
  safeAreaBottom = true,
  safeAreaLeft = true,
  safeAreaRight = true,
  adaptToKeyboard = true,
  handleNotch = true,
  handleHomeIndicator = true
}: SafeAreaProviderProps) => {
  const device = useDevice()
  const [safeAreaInsets, setSafeAreaInsets] = useState<SafeAreaInsets>({
    top: 0,
    bottom: 0,
    left: 0,
    right: 0
  })
  const [hasNotch, setHasNotch] = useState(false)
  const [hasHomeIndicator, setHasHomeIndicator] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [keyboardHeight, setKeyboardHeight] = useState(0)

  // Detect device capabilities
  useEffect(() => {
    const detectDeviceFeatures = () => {
      // Detect notch (iPhone X and newer)
      const hasNotchSupport = CSS.supports('padding-top: env(safe-area-inset-top)')
      const topInset = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--sat') || '0')
      setHasNotch(hasNotchSupport && topInset > 20)

      // Detect home indicator (devices with gesture navigation)
      const bottomInset = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--sab') || '0')
      setHasHomeIndicator(bottomInset > 0)

      // Detect fullscreen mode
      setIsFullscreen(
        (window.navigator as any).standalone === true ||
        window.matchMedia('(display-mode: fullscreen)').matches ||
        window.matchMedia('(display-mode: standalone)').matches
      )
    }

    detectDeviceFeatures()
  }, [])

  // Handle keyboard visibility on mobile
  useEffect(() => {
    if (!adaptToKeyboard || !device.isMobile) return

    const handleVisualViewportChange = () => {
      if (window.visualViewport) {
        const keyboardHeight = window.innerHeight - window.visualViewport.height
        setKeyboardHeight(Math.max(0, keyboardHeight))
      }
    }

    // Modern approach using Visual Viewport API
    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', handleVisualViewportChange)
      return () => {
        window.visualViewport?.removeEventListener('resize', handleVisualViewportChange)
      }
    }

    // Fallback for older browsers
    const handleResize = () => {
      const currentHeight = window.innerHeight
      const screenHeight = window.screen.height
      const heightDiff = screenHeight - currentHeight
      
      // Assume keyboard is open if height difference is significant
      if (heightDiff > 150) {
        setKeyboardHeight(heightDiff)
      } else {
        setKeyboardHeight(0)
      }
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [adaptToKeyboard, device.isMobile])

  // Mount-time: set CSS env() based variables once
  useEffect(() => {
    if (!enableSafeArea) return
    const root = document.documentElement
    root.style.setProperty('--sat', 'env(safe-area-inset-top, 0px)')
    root.style.setProperty('--sab', 'env(safe-area-inset-bottom, 0px)')
    root.style.setProperty('--sal', 'env(safe-area-inset-left, 0px)')
    root.style.setProperty('--sar', 'env(safe-area-inset-right, 0px)')
  }, [enableSafeArea])

  // Calculate insets when viewport or relevant flags change
  useEffect(() => {
    if (!enableSafeArea) return

    const parseInset = (value: string) => {
      const match = value.match(/(\d+(?:\.\d+)?)px/)
      return match ? parseFloat(match[1]) : 0
    }

    const updateSafeAreaInsets = () => {
      const computedStyle = getComputedStyle(document.documentElement)
      const top = parseInset(computedStyle.getPropertyValue('--sat') || '0px')
      const bottom = parseInset(computedStyle.getPropertyValue('--sab') || '0px')
      const left = parseInset(computedStyle.getPropertyValue('--sal') || '0px')
      const right = parseInset(computedStyle.getPropertyValue('--sar') || '0px')

      const adjustedBottom = adaptToKeyboard && keyboardHeight > 0
        ? Math.max(bottom, keyboardHeight)
        : bottom

      const nextInsets: SafeAreaInsets = {
        top: handleNotch ? top : 0,
        bottom: handleHomeIndicator ? adjustedBottom : 0,
        left,
        right
      }

      setSafeAreaInsets(prev => {
        if (
          prev.top === nextInsets.top &&
          prev.bottom === nextInsets.bottom &&
          prev.left === nextInsets.left &&
          prev.right === nextInsets.right
        ) {
          return prev
        }
        return nextInsets
      })
    }

    // Initial compute
    updateSafeAreaInsets()

    const handleOrientationChange = () => {
      setTimeout(updateSafeAreaInsets, 100)
    }

    window.addEventListener('orientationchange', handleOrientationChange)
    window.addEventListener('resize', updateSafeAreaInsets)
    document.addEventListener('fullscreenchange', updateSafeAreaInsets)
    document.addEventListener('webkitfullscreenchange', updateSafeAreaInsets)

    return () => {
      window.removeEventListener('orientationchange', handleOrientationChange)
      window.removeEventListener('resize', updateSafeAreaInsets)
      document.removeEventListener('fullscreenchange', updateSafeAreaInsets)
      document.removeEventListener('webkitfullscreenchange', updateSafeAreaInsets)
    }
  }, [enableSafeArea, handleNotch, handleHomeIndicator, adaptToKeyboard, keyboardHeight])

  // Reflect current values into CSS custom properties whenever they change
  useEffect(() => {
    if (!enableSafeArea) return
    const root = document.documentElement
    root.style.setProperty('--safe-area-top', `${safeAreaInsets.top}px`)
    root.style.setProperty('--safe-area-bottom', `${safeAreaInsets.bottom}px`)
    root.style.setProperty('--safe-area-left', `${safeAreaInsets.left}px`)
    root.style.setProperty('--safe-area-right', `${safeAreaInsets.right}px`)
    root.style.setProperty('--keyboard-height', `${keyboardHeight}px`)
  }, [enableSafeArea, safeAreaInsets, keyboardHeight])

  const getSafeAreaStyles = () => {
    if (!enableSafeArea) return {}

    const styles: React.CSSProperties = {}
    
    if (safeAreaTop && safeAreaInsets.top > 0) {
      styles.paddingTop = `${safeAreaInsets.top}px`
    }
    
    if (safeAreaBottom && safeAreaInsets.bottom > 0) {
      styles.paddingBottom = `${safeAreaInsets.bottom}px`
    }
    
    if (safeAreaLeft && safeAreaInsets.left > 0) {
      styles.paddingLeft = `${safeAreaInsets.left}px`
    }
    
    if (safeAreaRight && safeAreaInsets.right > 0) {
      styles.paddingRight = `${safeAreaInsets.right}px`
    }

    return styles
  }

  const contextValue: SafeAreaContextType = {
    insets: safeAreaInsets,
    hasNotch,
    hasHomeIndicator,
    orientation: device.orientation,
    isFullscreen
  }

  return (
    <SafeAreaContext.Provider value={contextValue}>
      <div 
        className={cn(
          "w-full h-full transition-all duration-300 ease-in-out",
          enableSafeArea && [
            safeAreaTop && "pt-safe",
            safeAreaBottom && "pb-safe", 
            safeAreaLeft && "pl-safe",
            safeAreaRight && "pr-safe"
          ],
          keyboardHeight > 0 && "keyboard-visible",
          hasNotch && "has-notch",
          hasHomeIndicator && "has-home-indicator",
          isFullscreen && "is-fullscreen",
          className
        )}
        style={{
          ...getSafeAreaStyles(),
          '--current-keyboard-height': `${keyboardHeight}px`
        } as React.CSSProperties}
        data-safe-area-top={safeAreaInsets.top}
        data-safe-area-bottom={safeAreaInsets.bottom}
        data-safe-area-left={safeAreaInsets.left}
        data-safe-area-right={safeAreaInsets.right}
        data-keyboard-height={keyboardHeight}
      >
        {children}
      </div>
    </SafeAreaContext.Provider>
  )
}

// Utility components for specific safe area needs
export const SafeAreaTop = ({ 
  children, 
  className,
  respectNotch = true 
}: { 
  children: ReactNode
  className?: string
  respectNotch?: boolean
}) => {
  const { hasNotch } = useSafeArea()
  
  return (
    <div className={cn(
      respectNotch && hasNotch ? "pt-safe" : "pt-4",
      className
    )}>
      {children}
    </div>
  )
}

export const SafeAreaBottom = ({ 
  children, 
  className,
  respectHomeIndicator = true,
  respectKeyboard = true
}: { 
  children: ReactNode
  className?: string
  respectHomeIndicator?: boolean
  respectKeyboard?: boolean
}) => {
  const { hasHomeIndicator } = useSafeArea()
  
  return (
    <div className={cn(
      respectHomeIndicator && hasHomeIndicator ? "pb-safe" : "pb-4",
      respectKeyboard && "keyboard-aware",
      className
    )}>
      {children}
    </div>
  )
}

export const SafeAreaLeft = ({ children, className }: { children: ReactNode; className?: string }) => (
  <div className={cn("pl-safe", className)}>
    {children}
  </div>
)

export const SafeAreaRight = ({ children, className }: { children: ReactNode; className?: string }) => (
  <div className={cn("pr-safe", className)}>
    {children}
  </div>
)

// New utility components
export const NotchAwareHeader = ({ 
  children, 
  className,
  blur = true 
}: { 
  children: ReactNode
  className?: string
  blur?: boolean
}) => {
  const { hasNotch, insets } = useSafeArea()
  
  return (
    <header 
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
        blur && "bg-white/95",
        hasNotch && "pt-safe",
        className
      )}
      style={{
        paddingTop: hasNotch ? `${insets.top}px` : '0px'
      }}
    >
      {children}
    </header>
  )
}

export const HomeIndicatorAwareFooter = ({ 
  children, 
  className,
  blur = true 
}: { 
  children: ReactNode
  className?: string
  blur?: boolean
}) => {
  const { hasHomeIndicator, insets } = useSafeArea()
  
  return (
    <footer 
      className={cn(
        "fixed bottom-0 left-0 right-0 z-50 transition-all duration-300",
        blur && "bg-white/95",
        hasHomeIndicator && "pb-safe",
        className
      )}
      style={{
        paddingBottom: hasHomeIndicator ? `${insets.bottom}px` : '0px'
      }}
    >
      {children}
    </footer>
  )
}

export const KeyboardAwareContainer = ({ 
  children, 
  className 
}: { 
  children: ReactNode
  className?: string
}) => (
  <div 
    className={cn(
      "transition-all duration-300 ease-in-out",
      "keyboard-aware",
      className
    )}
    style={{
      paddingBottom: 'var(--keyboard-height, 0px)'
    }}
  >
    {children}
  </div>
)

export default SafeAreaProvider
