import { useState, useEffect, useRef } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { X, Globe, Menu, ChevronDown } from 'lucide-react'
import { cn } from '@/utils/cn'

type HeaderProps = {
  hideOnMobile?: boolean
  onTabletMenuClick?: () => void
}

const Header = ({ hideOnMobile = false, onTabletMenuClick }: HeaderProps) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const [isLanguageMenuOpen, setIsLanguageMenuOpen] = useState(false)
  const [isHeaderVisible, setIsHeaderVisible] = useState(true)
  const [scrollDirection, setScrollDirection] = useState<'up' | 'down'>('up')
  const lastScrollY = useRef(0)
  const location = useLocation()

  const navigation = [
    { name: 'Trang chủ', href: '/' },
    { name: 'Bản đồ số', href: '/map' },
    { name: 'Cẩm nang du lịch', href: '/guide' },
    { name: 'Đăng ký leo núi', href: '/climb' },
    { name: 'Liên hệ', href: '#footer', isContact: true },
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

  // Enhanced scroll handling with smooth hide/show animations
  useEffect(() => {
    let ticking = false
    
    const handleScroll = () => {
      if (ticking) return
      
      requestAnimationFrame(() => {
        const currentY = window.scrollY
        const scrollThreshold = 10
        const hideThreshold = 100
        
        // Update scrolled state for background effect
        setIsScrolled(currentY > scrollThreshold)
        
        // Determine scroll direction
        const direction = currentY > lastScrollY.current ? 'down' : 'up'
        setScrollDirection(direction)
        
        // Show/hide header based on scroll behavior
        if (currentY < hideThreshold) {
          // Always show header near top
          setIsHeaderVisible(true)
        } else if (direction === 'down' && currentY > lastScrollY.current + 5) {
          // Hide when scrolling down significantly
          setIsHeaderVisible(false)
        } else if (direction === 'up' && lastScrollY.current > currentY + 5) {
          // Show when scrolling up significantly
          setIsHeaderVisible(true)
        }
        
        lastScrollY.current = currentY
        ticking = false
      })
      
      ticking = true
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    setIsMobileMenuOpen(false)
  }, [location.pathname])

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen || isLanguageMenuOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }

    return () => {
      document.body.style.overflow = ''
    }
  }, [isMobileMenuOpen, isLanguageMenuOpen])

  const toggleLanguageMenu = () => {
    setIsLanguageMenuOpen(!isLanguageMenuOpen)
    // Haptic feedback for mobile devices
    if ('vibrate' in navigator) {
      navigator.vibrate(10)
    }
  }

  const translatePage = (langCode: string) => {
    // Set the cookie for Google Translate
    document.cookie = `googtrans=/${langCode}; path=/; domain=.${window.location.hostname}`
    document.cookie = `googtrans=/${langCode}; path=/; domain=${window.location.hostname}`
    
    // Reload the page to apply translation
    window.location.reload()
  }

  const handleContactClick = (e: React.MouseEvent) => {
    e.preventDefault()
    
    // Try to find the footer element with a small delay to ensure DOM is loaded
    const findAndScrollToFooter = () => {
      const footer = document.getElementById('footer')
      if (footer) {
        console.log('Footer found, scrolling to it...')
        footer.scrollIntoView({ behavior: 'smooth' })
      } else {
        console.log('Footer not found, scrolling to bottom of page...')
        // Fallback: scroll to bottom of page
        window.scrollTo({
          top: document.body.scrollHeight,
          behavior: 'smooth'
        })
      }
    }
    
    // Try immediately first
    findAndScrollToFooter()
    
    // If footer not found, try again after a short delay
    setTimeout(findAndScrollToFooter, 100)
  }

  const handleNavigationClick = (item: any, e: React.MouseEvent) => {
    if (item.isContact) {
      handleContactClick(e)
    }
  }

  return (
    <>
      <header className={cn(
        "sticky top-0 z-50 pt-safe transition-all duration-500 ease-out will-change-transform",
        // Solid background effects
        isScrolled 
          ? "bg-white shadow-lg border-b border-gray-200" 
          : "bg-white/95 border-b border-gray-100 shadow-sm",
        // Smooth hide/show animation
        isHeaderVisible ? "translate-y-0" : "-translate-y-full",
        // Mobile hide override
        hideOnMobile && !isHeaderVisible && "-translate-y-full md:translate-y-0"
      )}>
        <div className="container mx-auto px-4 py-3">
          <div className="flex justify-between items-center">
            {/* Enhanced Logo with modern styling */}
            <div className="flex items-center space-x-3">
              <div className="relative">
                <img 
                  src="/assets/images/android-chrome-512x512.png" 
                  alt="Logo Núi Bà Đen" 
                  className={cn(
                    "w-12 h-12 rounded-full object-cover border-2 shadow-sm transition-all duration-300",
                    isScrolled 
                      ? "border-gray-200 shadow-md" 
                      : "border-primary-100 shadow-sm"
                  )}
                />
                {/* Subtle glow effect when scrolled */}
                {isScrolled && (
                  <div className="absolute inset-0 rounded-full bg-primary-500/5 animate-pulse-soft" />
                )}
              </div>
              <div>
                <h1 className={cn(
                  "text-base sm:text-lg md:text-xl font-bold transition-colors duration-300",
                  isScrolled ? "text-gray-800" : "text-primary-600"
                )}>
                  Khu du lịch quốc gia Núi Bà Đen
                </h1>
                <p className={cn(
                  "text-xs hidden sm:block transition-colors duration-300",
                  isScrolled ? "text-gray-600" : "text-primary-700"
                )}>
                  Tây Ninh, Việt Nam
                </p>
              </div>
            </div>
            
            {/* Enhanced Desktop Navigation (xl and up) */}
            <nav className="hidden xl:block">
              <ul className="flex space-x-8 items-center">
                {navigation.map((item) => (
                  <li key={item.name}>
                    <Link
                      to={item.href}
                      onClick={(e) => handleNavigationClick(item, e)}
                      className={cn(
                        "nav-link px-3 py-2 font-medium transition-all duration-300 relative rounded-lg",
                        "hover:bg-gray-100",
                        location.pathname === item.href
                          ? isScrolled 
                            ? "text-gray-800 bg-white/90" 
                            : "text-primary-600 bg-primary-50"
                          : isScrolled
                            ? "text-gray-700 hover:text-gray-900"
                            : "text-gray-700 hover:text-primary-600"
                      )}
                    >
                      {item.name}
                      {location.pathname === item.href && (
                        <div className={cn(
                          "absolute bottom-0 left-1/2 transform -translate-x-1/2 h-0.5 rounded-full transition-all duration-300",
                          "w-8",
                          isScrolled ? "bg-primary-500" : "bg-primary-500"
                        )} />
                      )}
                    </Link>
                  </li>
                ))}
                <li>
                  <button 
                    className={cn(
                      "language-selector ml-2 p-2 rounded-full transition-all duration-300 flex items-center space-x-1",
                      "hover:bg-gray-100 active:scale-95",
                      isScrolled 
                        ? "text-gray-700 hover:text-gray-900 hover:bg-gray-100" 
                        : "text-gray-700 hover:text-primary-600 hover:bg-gray-100"
                    )}
                    onClick={toggleLanguageMenu}
                    aria-label="Chọn ngôn ngữ"
                  >
                    <Globe className="w-5 h-5" />
                    <ChevronDown className={cn(
                      "w-4 h-4 transition-transform duration-200",
                      isLanguageMenuOpen && "rotate-180"
                    )} />
                  </button>
                </li>
              </ul>
            </nav>
            
            {/* Enhanced Mobile & Tablet Controls (below xl) */}
            <div className="flex items-center xl:hidden space-x-2">
              <button 
                className={cn(
                  "language-selector p-2 rounded-full transition-all duration-300 flex items-center space-x-1",
                  "hover:bg-gray-100 active:scale-95",
                  isScrolled 
                    ? "text-gray-700 hover:text-gray-900 hover:bg-gray-100" 
                    : "text-gray-700 hover:text-primary-600 hover:bg-gray-100"
                )}
                onClick={toggleLanguageMenu}
                aria-label="Chọn ngôn ngữ"
              >
                <Globe className="w-5 h-5" />
                <ChevronDown className={cn(
                  "w-4 h-4 transition-transform duration-200",
                  isLanguageMenuOpen && "rotate-180"
                )} />
              </button>
              <button
                onClick={() => {
                  if (onTabletMenuClick) {
                    onTabletMenuClick()
                  } else {
                    setIsMobileMenuOpen(!isMobileMenuOpen)
                  }
                  // Haptic feedback
                  if ('vibrate' in navigator) {
                    navigator.vibrate(10)
                  }
                }}
                className={cn(
                  "p-2 rounded-full transition-all duration-300 focus:outline-none active:scale-95",
                  "hover:bg-gray-100",
                  isScrolled 
                    ? "text-gray-700 hover:text-gray-900 hover:bg-gray-100" 
                    : "text-gray-700 hover:text-primary-600 hover:bg-gray-100"
                )}
                aria-label="Mở menu điều hướng"
              >
                <Menu className={cn(
                  "h-6 w-6 transition-transform duration-300",
                  isMobileMenuOpen && "rotate-90"
                )} />
              </button>
            </div>
          </div>
          
          {/* Enhanced Mobile Navigation (below xl) */}
          <div className={cn(
            "xl:hidden overflow-hidden transition-all duration-500 ease-out",
            isMobileMenuOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
          )}>
            <div className={cn(
              "mt-3 pt-3 pb-4 transition-all duration-300",
              isScrolled 
                ? "border-t border-gray-200" 
                : "border-t border-gray-100"
            )}>
              <ul className="space-y-1">
                {navigation.map((item, index) => (
                  <li key={item.name}>
                    <Link
                      to={item.href}
                      onClick={(e) => handleNavigationClick(item, e)}
                      className={cn(
                        "block px-4 py-3 font-medium transition-all duration-300 rounded-lg",
                        "hover:bg-gray-50 active:scale-98",
                        location.pathname === item.href
                          ? isScrolled
                            ? "bg-gray-100 text-gray-800 border-l-4 border-primary-500"
                            : "bg-primary-50 text-primary-600 border-l-4 border-primary-500"
                          : isScrolled
                            ? "text-gray-700 hover:text-gray-900 hover:bg-gray-50"
                            : "text-gray-700 hover:text-primary-600 hover:bg-gray-50"
                      )}
                      style={{
                        animationDelay: `${index * 50}ms`
                      }}
                    >
                      {item.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </header>

      {/* Enhanced Language Popup with Modern Design */}
      {isLanguageMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-md flex items-center justify-center z-[1200] p-4 animate-fade-in"
          onClick={toggleLanguageMenu}
        >
          <div 
            className="bg-white rounded-3xl p-6 max-w-sm w-full mx-4 shadow-2xl animate-slide-up border border-gray-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-semibold text-gray-800">
                Chọn ngôn ngữ
              </h3>
              <button 
                onClick={toggleLanguageMenu}
                className="p-2 rounded-full hover:bg-gray-100 transition-all duration-200 active:scale-95 text-gray-500 hover:text-gray-700"
                aria-label="Đóng menu ngôn ngữ"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-2 max-h-64 overflow-y-auto custom-scrollbar">
              {languages.map((lang, index) => (
                <button
                  key={lang.code}
                  onClick={() => translatePage(lang.code)}
                  className={cn(
                    "w-full text-left px-4 py-3 rounded-xl transition-all duration-300 flex items-center",
                    "hover:bg-gray-50 active:bg-gray-100 active:scale-98",
                    "text-gray-700 hover:text-gray-900",
                    "border border-transparent hover:border-gray-200"
                  )}
                  style={{
                    animationDelay: `${index * 30}ms`
                  }}
                >
                  <span className="mr-3 flex-shrink-0">
                                    <img 
                  src={lang.flag} 
                  alt={lang.code.toUpperCase()} 
                  className="inline w-6 h-4 rounded-sm shadow-md border border-gray-200"
                />
                  </span>
                  <span className="font-medium">{lang.name}</span>
                </button>
              ))}
            </div>
            
            {/* Subtle gradient overlay at bottom */}
            <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-gray-100 to-transparent rounded-b-3xl pointer-events-none" />
          </div>
        </div>
      )}
    </>
  )
}

export default Header
