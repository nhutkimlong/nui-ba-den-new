import { createContext, useContext, useEffect, useState, ReactNode } from 'react'

interface DeviceInfo {
  isMobile: boolean
  isTablet: boolean
  isDesktop: boolean
  isLandscape: boolean
  isPortrait: boolean
  screenWidth: number
  screenHeight: number
  orientation: 'landscape' | 'portrait'
  userAgent: string
  isTouchDevice: boolean
  isPWA: boolean
  isStandalone: boolean
}

const DeviceContext = createContext<DeviceInfo | null>(null)

export const useDevice = () => {
  const context = useContext(DeviceContext)
  if (!context) {
    throw new Error('useDevice must be used within a DeviceProvider')
  }
  return context
}

interface DeviceProviderProps {
  children: ReactNode
}

export const DeviceProvider = ({ children }: DeviceProviderProps) => {
  const [deviceInfo, setDeviceInfo] = useState<DeviceInfo>({
    isMobile: false,
    isTablet: false,
    isDesktop: false,
    isLandscape: false,
    isPortrait: false,
    screenWidth: 0,
    screenHeight: 0,
    orientation: 'portrait',
    userAgent: '',
    isTouchDevice: false,
    isPWA: false,
    isStandalone: false
  })

  useEffect(() => {
    const updateDeviceInfo = () => {
      const width = window.innerWidth
      const height = window.innerHeight
      const userAgent = navigator.userAgent
      
      // Detect device type
      const isMobile = width < 768
      const isTablet = width >= 768 && width < 1024
      const isDesktop = width >= 1024
      
      // Detect orientation
      const isLandscape = width > height
      const isPortrait = height > width
      const orientation = isLandscape ? 'landscape' : 'portrait'
      
      // Detect touch device
      const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0
      
      // Detect PWA
      const isPWA = window.matchMedia('(display-mode: standalone)').matches
      const isStandalone = window.navigator.standalone || isPWA

      setDeviceInfo({
        isMobile,
        isTablet,
        isDesktop,
        isLandscape,
        isPortrait,
        screenWidth: width,
        screenHeight: height,
        orientation,
        userAgent,
        isTouchDevice,
        isPWA,
        isStandalone
      })
    }

    // Initial detection
    updateDeviceInfo()

    // Listen for changes
    window.addEventListener('resize', updateDeviceInfo)
    window.addEventListener('orientationchange', updateDeviceInfo)

    return () => {
      window.removeEventListener('resize', updateDeviceInfo)
      window.removeEventListener('orientationchange', updateDeviceInfo)
    }
  }, [])

  return (
    <DeviceContext.Provider value={deviceInfo}>
      {children}
    </DeviceContext.Provider>
  )
}

// Utility components
export const MobileOnly = ({ children }: { children: ReactNode }) => {
  const { isMobile } = useDevice()
  return isMobile ? <>{children}</> : null
}

export const TabletOnly = ({ children }: { children: ReactNode }) => {
  const { isTablet } = useDevice()
  return isTablet ? <>{children}</> : null
}

export const DesktopOnly = ({ children }: { children: ReactNode }) => {
  const { isDesktop } = useDevice()
  return isDesktop ? <>{children}</> : null
}

export const MobileAndTablet = ({ children }: { children: ReactNode }) => {
  const { isMobile, isTablet } = useDevice()
  return (isMobile || isTablet) ? <>{children}</> : null
}

export const TabletAndDesktop = ({ children }: { children: ReactNode }) => {
  const { isTablet, isDesktop } = useDevice()
  return (isTablet || isDesktop) ? <>{children}</> : null
}

export default DeviceProvider
