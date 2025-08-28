import { Outlet, useLocation } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { cn } from '@/utils/cn'
import Header from './Header'
import Footer from './Footer'
import ScrollToTop from '../common/ScrollToTop'
import InstallPrompt from './InstallPrompt'
import MobileBottomNav from './MobileBottomNav'
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
  return (
    <SafeAreaProvider>
      <div className="min-h-[100dvh] flex flex-col">
        {/* Header - Hide on mobile map page */}
        {!(isMobile && isMapPage) && (
          <Header 
            hideOnMobile={isMobile && isMapPage ? true : isScrolled}
            onTabletMenuClick={isTablet ? () => setIsTabletSidebarOpen(true) : undefined}
          />
        )}
        
        {/* Main content */}
        <main className={cn(
          "flex-1 md:pb-0",
          // Use CSS variable for mobile nav offset
          isMapPage ? 'pb-0' : (isScrolled ? 'pb-mobile-nav' : 'pb-0 md:pb-0')
        )}>
          <Outlet />
        </main>
        
        {/* Footer - Hide on map page */}
        {!isMapPage && <Footer />}
        
        {/* Tablet Sidebar */}
        <TabletSidebar 
          isOpen={isTabletSidebarOpen} 
          onClose={() => setIsTabletSidebarOpen(false)} 
        />
        
        {/* Install Prompt */}
        <InstallPrompt />
        
        {/* Mobile Bottom Navigation */}
        <MobileBottomNav visible={isMobile && isMapPage ? true : isScrolled} />
        
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
