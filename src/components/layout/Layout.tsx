import { Outlet, useLocation } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { cn } from '@/utils/cn'
import Header from './Header'
import Footer from './Footer'
import ScrollToTop from '../common/ScrollToTop'
import InstallPrompt from './InstallPrompt'
import TabletSidebar from './TabletSidebar'
import { DeviceProvider, useDevice } from './DeviceDetector'
import SafeAreaProvider from './SafeAreaProvider'

const LayoutContent = () => {
  const location = useLocation()
  const [isScrolled, setIsScrolled] = useState(false)
  const [isTabletSidebarOpen, setIsTabletSidebarOpen] = useState(false)
  const { isMobile, isTablet } = useDevice()

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10)
    }
    handleScroll()
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const isMapPage = location.pathname.startsWith('/map')
  // Disable page scroll on map page to ensure gestures (press/drag) don't scroll the document
  useEffect(() => {
    if (!isMapPage) return
    const previousOverflow = document.body.style.overflow
    const previousTouch = document.body.style.touchAction
    document.body.style.overflow = 'hidden'
    document.body.style.touchAction = 'none'
    return () => {
      document.body.style.overflow = previousOverflow
      document.body.style.touchAction = previousTouch
    }
  }, [isMapPage])
  const isHomePage = location.pathname === '/'
  return (
    <SafeAreaProvider>
      <div className="min-h-[100dvh] flex flex-col">
        {/* Header - Always show (including on map) */}
        <Header 
          hideOnMobile={isScrolled}
          onTabletMenuClick={isTablet ? () => setIsTabletSidebarOpen(true) : undefined}
        />
        
        {/* Main content */}
        <main className={cn(
          "flex-1 md:pb-0",
          // Use CSS variable for mobile nav offset
          isMapPage ? 'pb-0' : (isScrolled ? 'pb-mobile-nav' : 'pb-0 md:pb-0')
        )}>
          <Outlet />
        </main>
        
        {/* Footer - Only show on home page for optimization */}
        {isHomePage && <Footer />}
        
        {/* Tablet Sidebar */}
        <TabletSidebar 
          isOpen={isTabletSidebarOpen} 
          onClose={() => setIsTabletSidebarOpen(false)} 
        />
        
        {/* Install Prompt */}
        <InstallPrompt />
        
        {/* Mobile Bottom Navigation removed */}
        
        {/* Scroll to Top */}
        <ScrollToTop />
      </div>
    </SafeAreaProvider>
  )
}

const Layout = () => {
  return (
    <DeviceProvider>
      <LayoutContent />
    </DeviceProvider>
  )
}

export default Layout
