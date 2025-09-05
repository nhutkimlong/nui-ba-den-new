import { useState, useEffect, useRef } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { X, Menu, Home, Map, BookOpen, Mountain, Phone, Settings, ChevronLeft, ChevronRight, Globe, UserCircle2, LogIn, LogOut } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { cn } from '@/utils/cn'

interface TabletSidebarProps {
  isOpen: boolean
  onClose: () => void
}

const TabletSidebar = ({ isOpen, onClose }: TabletSidebarProps) => {
  const location = useLocation()
  const [isTablet, setIsTablet] = useState(false)
  const isCollapsed = false
  const [isLanguageOpen, setIsLanguageOpen] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const { isAuthenticated, user, logout } = useAuth()
  const [dragStartX, setDragStartX] = useState(0)
  const [dragCurrentX, setDragCurrentX] = useState(0)
  const sidebarRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const checkTablet = () => {
      const mql = window.matchMedia('(min-width: 768px) and (max-width: 1024px)')
      setIsTablet(mql.matches)
      
      // No collapsed mode
    }
    
    checkTablet()
    window.addEventListener('resize', checkTablet)
    return () => window.removeEventListener('resize', checkTablet)
  }, [])

  // Gestures disabled
  const handleTouchStart = (_e: React.TouchEvent) => {}
  const handleTouchMove = (_e: React.TouchEvent) => {}
  const handleTouchEnd = () => {}

  const toggleCollapse = () => {}

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

  const personalHref = isAuthenticated ? '/profile' : '/personal'
  const navigation = [
    { name: 'Trang chủ', href: '/', icon: Home },
    { name: 'Bản đồ số', href: '/map', icon: Map },
    { name: 'Cẩm nang du lịch', href: '/guide', icon: BookOpen },
    { name: 'Đăng ký leo núi', href: '/climb', icon: Mountain },
    { name: 'Cá nhân', href: personalHref, icon: Settings },
  ]

  const languages = [
    { code: 'vi', name: 'Tiếng Việt', flag: 'https://flagcdn.com/24x18/vn.png' },
    { code: 'en', name: 'English', flag: 'https://flagcdn.com/24x18/gb.png' },
    { code: 'fr', name: 'Français', flag: 'https://flagcdn.com/24x18/fr.png' },
    { code: 'de', name: 'Deutsch', flag: 'https://flagcdn.com/24x18/de.png' },
    { code: 'ja', name: '日本語', flag: 'https://flagcdn.com/24x18/jp.png' },
    { code: 'ko', name: '한국어', flag: 'https://flagcdn.com/24x18/kr.png' },
    { code: 'zh-CN', name: '中文', flag: 'https://flagcdn.com/24x18/cn.png' },
    { code: 'ru', name: 'Русский', flag: 'https://flagcdn.com/24x18/ru.png' },
  ]

  const handleContactClick = (_e: React.MouseEvent) => {}

  const handleNavClick = () => {
    onClose()
    // Light haptic feedback
    if ('vibrate' in navigator) {
      navigator.vibrate(10)
    }
  }

  const translatePage = (langCode: string) => {
    document.cookie = `googtrans=/${langCode}; path=/; domain=.${window.location.hostname}`
    document.cookie = `googtrans=/${langCode}; path=/; domain=${window.location.hostname}`
    window.location.reload()
  }

  if (!isTablet) return null

  return (
    <>
      {/* Enhanced Backdrop with glassmorphism */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/30 backdrop-blur-md z-[1200] lg:hidden animate-fade-in"
          onClick={onClose}
        />
      )}
      
      {/* Modern Sidebar with glassmorphism */}
      <div 
        ref={sidebarRef}
        className={cn(
          "fixed top-0 right-0 h-full z-[1300] lg:hidden transform transition-all duration-500 ease-out will-change-transform",
          "bg-white/95 border-r border-gray-200 shadow-2xl",
          isOpen ? "translate-x-0" : "translate-x-full",
          "w-80"
        )}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Enhanced Header */}
        <div className={cn(
          "flex items-center p-6 border-b border-white/20 relative",
          isCollapsed ? "justify-center" : "justify-between"
        )}>
          {!isCollapsed && (
            <div className="flex items-center space-x-3">
              <div className="relative">
                <img 
                  src="/assets/images/android-chrome-512x512.png" 
                  alt="Logo Núi Bà Đen" 
                  className="w-8 h-8 rounded-full border border-white/20 shadow-md"
                />
                <div className="absolute inset-0 rounded-full bg-primary-500/10 animate-pulse-soft" />
              </div>
              <h2 className="font-bold text-lg text-primary-600 drop-shadow-sm">
                Núi Bà Đen
              </h2>
            </div>
          )}
          
          {/* no collapsed mode */}
          
          <div className="flex items-center space-x-2">
            {/* Collapse control removed */}
            
            {/* Close Button */}
            {!isCollapsed && (
              <button
                onClick={onClose}
                className="p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-all duration-200 active:scale-95"
                aria-label="Đóng menu"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>

        {/* Enhanced Navigation */
        }
        <nav className="flex-1 p-4 overflow-y-auto custom-scrollbar">
          <ul className={cn(
            "space-y-2 transition-all duration-300",
            isCollapsed && "space-y-4"
          )}>
            {navigation.map((item, index) => {
              const Icon = item.icon
              const isActive = location.pathname === item.href
              
              return (
                <li key={item.href}>
                  <Link
                    to={item.href}
                    onClick={handleNavClick}
                    className={cn(
                      "flex items-center rounded-xl transition-all duration-300 group relative overflow-hidden",
                      "hover:bg-gray-50 active:scale-98",
                      isCollapsed ? "px-3 py-4 justify-center" : "px-4 py-3 space-x-3",
                      isActive 
                        ? "bg-primary-50 text-primary-600 border border-primary-200 shadow-lg" 
                        : "text-gray-700 hover:text-gray-900 border border-transparent hover:border-gray-200"
                    )}
                    style={{
                      animationDelay: `${index * 50}ms`
                    }}
                    title={isCollapsed ? item.name : undefined}
                  >
                    {/* Icon with enhanced styling */}
                    <div className={cn(
                      "relative flex items-center justify-center transition-all duration-300",
                      isActive && "scale-110"
                    )}>
                      <Icon className={cn(
                        "w-5 h-5 transition-all duration-300",
                        isActive && "drop-shadow-sm filter brightness-110"
                      )} />
                      
                      {/* Active indicator glow */}
                      {isActive && (
                        <div className="absolute inset-0 bg-white/20 rounded-full scale-150 animate-pulse-soft" />
                      )}
                    </div>
                    
                    {/* Label with smooth transitions */}
                    {!isCollapsed && (
                      <>
                        <span className={cn(
                          "font-medium transition-all duration-300 flex-1",
                          isActive && "drop-shadow-sm"
                        )}>
                          {item.name}
                        </span>
                        
                        {/* Active indicator dot */}
                        {isActive && (
                          <div className="w-2 h-2 bg-white rounded-full shadow-sm animate-pulse-soft" />
                        )}
                      </>
                    )}
                    
                    {/* Hover effect overlay */}
                    <div className="absolute inset-0 bg-gradient-to-r from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                  </Link>
                  
                  {/* Tooltip for collapsed state */}
                  {isCollapsed && (
                    <div className="absolute left-full ml-2 px-3 py-2 bg-black/80 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-10">
                      {item.name}
                      <div className="absolute left-0 top-1/2 transform -translate-x-1 -translate-y-1/2 w-2 h-2 bg-black/80 rotate-45" />
                    </div>
                  )}
                </li>
              )
            })}
          </ul>
          {/* Account & Language sections for tablet */}
          {!isCollapsed && (
            <div className="mt-4 space-y-3">
              {/* Account block */}
              <div className="rounded-xl border border-gray-200 bg-white p-3">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-700">
                    {isAuthenticated ? (
                      <>Xin chào, <span className="font-semibold text-gray-900">{(user?.name || 'bạn').split(' ').slice(-1)[0]}</span></>
                    ) : (
                      <>Tài khoản</>
                    )}
                  </div>
                </div>
                <div className="mt-3 flex gap-2">
                  {isAuthenticated ? (
                    <>
                      <Link to="/profile" onClick={handleNavClick} className="flex-1 inline-flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-gray-100 text-gray-800 font-medium">
                        <UserCircle2 className="w-4 h-4" /> Hồ sơ
                      </Link>
                      <button onClick={() => { logout(); onClose() }} className="flex-1 inline-flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-red-50 text-red-700 font-medium">
                        <LogOut className="w-4 h-4" /> Đăng xuất
                      </button>
                    </>
                  ) : (
                    <>
                      <Link to="/login" onClick={handleNavClick} className="flex-1 inline-flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-gray-100 text-gray-800 font-medium">
                        <LogIn className="w-4 h-4" /> Đăng nhập
                      </Link>
                      <Link to="/register" onClick={handleNavClick} className="flex-1 inline-flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-primary-600 text-white font-medium">
                        <UserCircle2 className="w-4 h-4" /> Đăng ký
                      </Link>
                    </>
                  )}
                </div>
              </div>

              {/* Language selector */}
              <div className="rounded-xl border border-gray-200 bg-white">
                <button
                  className="w-full flex items-center justify-between px-4 py-3 rounded-xl hover:bg-gray-50"
                  onClick={() => setIsLanguageOpen(!isLanguageOpen)}
                >
                  <span className="inline-flex items-center gap-2 text-gray-800 font-medium"><Globe className="w-5 h-5" /> Chọn ngôn ngữ</span>
                  <span className="text-sm text-gray-500">{isLanguageOpen ? 'Ẩn' : 'Hiện'}</span>
                </button>
                {isLanguageOpen && (
                  <div className="px-2 pb-2 grid grid-cols-2 gap-2">
                    {languages.map((lang) => (
                      <button
                        key={lang.code}
                        onClick={() => translatePage(lang.code)}
                        className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-50 border border-gray-200 text-gray-700"
                      >
                        <img src={lang.flag} alt={lang.code.toUpperCase()} className="w-5 h-4 rounded-sm border" />
                        <span className="text-sm font-medium">{lang.name}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </nav>

        {/* Enhanced Footer */}
        <div className={cn(
          "p-4 border-t border-gray-200 relative",
          isCollapsed && "px-2"
        )}>
          {!isCollapsed ? (
            <div className="text-xs text-gray-600 text-center font-medium">
              © {new Date().getFullYear()} KDL Quốc gia Núi Bà Đen
            </div>
          ) : (
            <div className="flex justify-center">
              <div className="w-8 h-0.5 bg-gray-300 rounded-full" />
            </div>
          )}
          
          {/* Subtle gradient overlay */}
          <div className="absolute top-0 left-0 right-0 h-4 bg-gradient-to-b from-transparent to-black/10 pointer-events-none" />
        </div>
        
        {/* Drag indicator for gesture hint */}
        <div className="absolute top-4 right-2 flex flex-col space-y-1 opacity-30">
          <div className="w-1 h-6 bg-gray-400 rounded-full" />
          <div className="w-1 h-6 bg-gray-300 rounded-full" />
          <div className="w-1 h-6 bg-gray-200 rounded-full" />
        </div>
      </div>
    </>
  )
}

export default TabletSidebar
