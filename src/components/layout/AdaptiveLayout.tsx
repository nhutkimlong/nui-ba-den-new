import { ReactNode, useState, useEffect } from 'react'
import { cn } from '@/utils/cn'

interface AdaptiveLayoutProps {
  children: ReactNode
  className?: string
  sidebar?: ReactNode
  sidebarWidth?: number
  showSidebarOnDesktop?: boolean
  showSidebarOnTablet?: boolean
  showSidebarOnMobile?: boolean
}

const AdaptiveLayout = ({
  children,
  className,
  sidebar,
  sidebarWidth = 280,
  showSidebarOnDesktop = true,
  showSidebarOnTablet = false,
  showSidebarOnMobile = false
}: AdaptiveLayoutProps) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [screenSize, setScreenSize] = useState<'mobile' | 'tablet' | 'desktop'>('desktop')

  useEffect(() => {
    const checkScreenSize = () => {
      const width = window.innerWidth
      if (width < 768) {
        setScreenSize('mobile')
      } else if (width < 1024) {
        setScreenSize('tablet')
      } else {
        setScreenSize('desktop')
      }
    }

    checkScreenSize()
    window.addEventListener('resize', checkScreenSize)
    return () => window.removeEventListener('resize', checkScreenSize)
  }, [])

  const shouldShowSidebar = 
    (screenSize === 'desktop' && showSidebarOnDesktop) ||
    (screenSize === 'tablet' && showSidebarOnTablet) ||
    (screenSize === 'mobile' && showSidebarOnMobile)

  const isSidebarVisible = shouldShowSidebar && (screenSize === 'desktop' || isSidebarOpen)

  return (
    <div className={cn("flex h-full", className)}>
      {/* Sidebar */}
      {sidebar && shouldShowSidebar && (
        <>
          {/* Desktop Sidebar */}
          {screenSize === 'desktop' && (
            <aside 
              className="hidden lg:block bg-white border-r border-gray-200 shadow-sm"
              style={{ width: sidebarWidth }}
            >
              {sidebar}
            </aside>
          )}
          
          {/* Mobile/Tablet Sidebar */}
          {(screenSize === 'mobile' || screenSize === 'tablet') && (
            <div
              className={cn(
                "fixed inset-y-0 left-0 z-[1300] transform transition-transform duration-300 ease-in-out",
                isSidebarOpen ? "translate-x-0" : "-translate-x-full"
              )}
              style={{ width: sidebarWidth }}
            >
              {/* Backdrop */}
              {isSidebarOpen && (
                <div 
                  className="fixed inset-0 bg-black/20 backdrop-blur-sm z-[1200]"
                  onClick={() => setIsSidebarOpen(false)}
                />
              )}
              
              {/* Sidebar Content */}
              <div className="relative h-full bg-white shadow-2xl z-[1300]">
                {sidebar}
              </div>
            </div>
          )}
        </>
      )}

      {/* Main Content */}
      <main 
        className={cn(
          "flex-1 flex flex-col",
          screenSize === 'desktop' && shouldShowSidebar && "lg:ml-0"
        )}
      >
        {/* Mobile/Tablet Sidebar Toggle */}
        {(screenSize === 'mobile' || screenSize === 'tablet') && shouldShowSidebar && (
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="lg:hidden fixed top-4 left-4 z-[1100] p-2 bg-white rounded-lg shadow-lg border border-gray-200"
            aria-label="Mở menu"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        )}

        {children}
      </main>
    </div>
  )
}

export default AdaptiveLayout
