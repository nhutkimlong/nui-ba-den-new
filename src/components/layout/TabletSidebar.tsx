import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { X, Menu, Home, Map, BookOpen, Mountain, Phone, Settings } from 'lucide-react'
import { cn } from '@/utils/cn'

interface TabletSidebarProps {
  isOpen: boolean
  onClose: () => void
}

const TabletSidebar = ({ isOpen, onClose }: TabletSidebarProps) => {
  const location = useLocation()
  const [isTablet, setIsTablet] = useState(false)

  useEffect(() => {
    const checkTablet = () => {
      const mql = window.matchMedia('(min-width: 768px) and (max-width: 1024px)')
      setIsTablet(mql.matches)
    }
    
    checkTablet()
    window.addEventListener('resize', checkTablet)
    return () => window.removeEventListener('resize', checkTablet)
  }, [])

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }

    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  const navigation = [
    { name: 'Trang chủ', href: '/', icon: Home },
    { name: 'Bản đồ số', href: '/map', icon: Map },
    { name: 'Cẩm nang du lịch', href: '/guide', icon: BookOpen },
    { name: 'Đăng ký leo núi', href: '/climb', icon: Mountain },
    { name: 'Liên hệ', href: '#footer', icon: Phone, isContact: true },
  ]

  const handleContactClick = (e: React.MouseEvent) => {
    e.preventDefault()
    onClose()
    
    setTimeout(() => {
      const footer = document.getElementById('footer')
      if (footer) {
        footer.scrollIntoView({ behavior: 'smooth' })
      } else {
        window.scrollTo({
          top: document.body.scrollHeight,
          behavior: 'smooth'
        })
      }
    }, 300)
  }

  if (!isTablet) return null

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-[1200] lg:hidden"
          onClick={onClose}
        />
      )}
      
      {/* Sidebar */}
      <div className={cn(
        "fixed top-0 left-0 h-full w-80 bg-white shadow-2xl z-[1300] lg:hidden transform transition-transform duration-300 ease-in-out",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <img 
              src="/assets/images/android-chrome-512x512.png" 
              alt="Logo Núi Bà Đen" 
              className="w-8 h-8 rounded-full"
            />
            <h2 className="font-bold text-lg text-gray-800">
              Núi Bà Đen
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="Đóng menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4">
          <ul className="space-y-2">
            {navigation.map((item) => {
              const Icon = item.icon
              const isActive = location.pathname === item.href
              
              return (
                <li key={item.href}>
                  <Link
                    to={item.href}
                    onClick={item.isContact ? handleContactClick : onClose}
                    className={cn(
                      "flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200",
                      "hover:bg-gray-50 hover:text-primary-600",
                      isActive 
                        ? "bg-primary-50 text-primary-600 border-r-2 border-primary-500" 
                        : "text-gray-700"
                    )}
                  >
                    <Icon className={cn(
                      "w-5 h-5",
                      isActive && "text-primary-600"
                    )} />
                    <span className="font-medium">{item.name}</span>
                    {isActive && (
                      <div className="ml-auto w-2 h-2 bg-primary-500 rounded-full" />
                    )}
                  </Link>
                </li>
              )
            })}
          </ul>
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200">
          <div className="text-xs text-gray-500 text-center">
            © {new Date().getFullYear()} KDL Quốc gia Núi Bà Đen
          </div>
        </div>
      </div>
    </>
  )
}

export default TabletSidebar
