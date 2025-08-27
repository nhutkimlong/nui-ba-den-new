import { Outlet, useLocation } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { cn } from '@/utils/cn'
import Header from './Header'
import Footer from './Footer'
import ScrollToTop from '../common/ScrollToTop'
import InstallPrompt from './InstallPrompt'
import MobileBottomNav from './MobileBottomNav'

const Layout = () => {
  const location = useLocation()
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10)
    }
    handleScroll()
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    const mql = window.matchMedia('(max-width: 768px)')
    const update = () => setIsMobile(mql.matches)
    update()
    mql.addEventListener?.('change', update)
    return () => mql.removeEventListener?.('change', update)
  }, [])
  const isMapPage = location.pathname.startsWith('/map')
  return (
    <div className="min-h-[100dvh] flex flex-col">
      {!(isMobile && isMapPage) && (
        <Header hideOnMobile={isMobile && isMapPage ? true : isScrolled} />
      )}
      <main className={cn(
        "flex-1 md:pb-0",
        isMapPage ? 'pb-0' : (isScrolled ? 'pb-[56px]' : 'pb-0 md:pb-0')
      )}>
        <Outlet />
      </main>
      {!isMapPage && <Footer />}
      <InstallPrompt />
      <MobileBottomNav visible={isMobile && isMapPage ? true : isScrolled} />
      <ScrollToTop />
    </div>
  )
}

export default Layout
