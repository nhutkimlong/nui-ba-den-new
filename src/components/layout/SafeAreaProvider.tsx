import { ReactNode, useEffect, useState } from 'react'
import { cn } from '@/utils/cn'

interface SafeAreaProviderProps {
  children: ReactNode
  className?: string
  enableSafeArea?: boolean
  safeAreaTop?: boolean
  safeAreaBottom?: boolean
  safeAreaLeft?: boolean
  safeAreaRight?: boolean
}

const SafeAreaProvider = ({
  children,
  className,
  enableSafeArea = true,
  safeAreaTop = true,
  safeAreaBottom = true,
  safeAreaLeft = true,
  safeAreaRight = true
}: SafeAreaProviderProps) => {
  const [safeAreaInsets, setSafeAreaInsets] = useState({
    top: 0,
    bottom: 0,
    left: 0,
    right: 0
  })

  useEffect(() => {
    if (!enableSafeArea) return

    const updateSafeAreaInsets = () => {
      const style = getComputedStyle(document.documentElement)
      
      const top = parseInt(style.getPropertyValue('--sat') || '0')
      const bottom = parseInt(style.getPropertyValue('--sab') || '0')
      const left = parseInt(style.getPropertyValue('--sal') || '0')
      const right = parseInt(style.getPropertyValue('--sar') || '0')

      setSafeAreaInsets({
        top: top || 0,
        bottom: bottom || 0,
        left: left || 0,
        right: right || 0
      })
    }

    // Set CSS custom properties for safe area
    const setCSSVariables = () => {
      const root = document.documentElement
      
      // Use CSS env() function for safe area insets
      root.style.setProperty('--sat', 'env(safe-area-inset-top, 0px)')
      root.style.setProperty('--sab', 'env(safe-area-inset-bottom, 0px)')
      root.style.setProperty('--sal', 'env(safe-area-inset-left, 0px)')
      root.style.setProperty('--sar', 'env(safe-area-inset-right, 0px)')
    }

    setCSSVariables()
    updateSafeAreaInsets()

    // Listen for orientation changes
    window.addEventListener('orientationchange', updateSafeAreaInsets)
    window.addEventListener('resize', updateSafeAreaInsets)

    return () => {
      window.removeEventListener('orientationchange', updateSafeAreaInsets)
      window.removeEventListener('resize', updateSafeAreaInsets)
    }
  }, [enableSafeArea])

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

  return (
    <div 
      className={cn(
        "w-full h-full",
        enableSafeArea && "pb-safe pt-safe pl-safe pr-safe",
        className
      )}
      style={getSafeAreaStyles()}
    >
      {children}
    </div>
  )
}

// Utility components for specific safe area needs
export const SafeAreaTop = ({ children, className }: { children: ReactNode; className?: string }) => (
  <div className={cn("pt-safe", className)}>
    {children}
  </div>
)

export const SafeAreaBottom = ({ children, className }: { children: ReactNode; className?: string }) => (
  <div className={cn("pb-safe", className)}>
    {children}
  </div>
)

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

export default SafeAreaProvider
