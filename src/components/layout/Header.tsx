import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { X, Globe, Menu } from 'lucide-react'
import { cn } from '@/utils/cn'

type HeaderProps = {
  hideOnMobile?: boolean
  onTabletMenuClick?: () => void
}

const Header = ({ hideOnMobile = false, onTabletMenuClick }: HeaderProps) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const [isLanguageMenuOpen, setIsLanguageMenuOpen] = useState(false)
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

  useEffect(() => {
    const handleScroll = () => {
      const currentY = window.scrollY
      setIsScrolled(currentY > 10)
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
        "bg-white/90 backdrop-blur-md sticky top-0 z-50 shadow-sm border-b border-gray-100 pt-safe transition-all duration-300 will-change-transform",
        isScrolled && "shadow-lg",
        hideOnMobile && "-translate-y-full md:translate-y-0"
      )}>
        <div className="container mx-auto px-4 py-3">
          <div className="flex justify-between items-center">
            {/* Logo */}
            <div className="flex items-center space-x-3">
              <img 
                src="/assets/images/android-chrome-512x512.png" 
                alt="Logo Núi Bà Đen" 
                className="w-12 h-12 rounded-full object-cover border-2 border-primary-100 shadow-sm"
              />
              <div>
                <h1 className="text-base sm:text-lg md:text-xl font-bold text-primary-600">
                  Khu du lịch quốc gia Núi Bà Đen
                </h1>
                <p className="text-xs text-primary-700 hidden sm:block">
                  Tây Ninh, Việt Nam
                </p>
              </div>
            </div>
            
            {/* Desktop Navigation (xl and up) */}
            <nav className="hidden xl:block">
              <ul className="flex space-x-8 items-center">
                {navigation.map((item) => (
                  <li key={item.name}>
                    <Link
                      to={item.href}
                      onClick={(e) => handleNavigationClick(item, e)}
                      className={cn(
                        "nav-link px-2 py-2 font-medium transition-all duration-200 relative",
                        location.pathname === item.href
                          ? "text-primary-500"
                          : "text-gray-700 hover:text-primary-500"
                      )}
                    >
                      {item.name}
                      {location.pathname === item.href && (
                        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-500 rounded-full" />
                      )}
                    </Link>
                  </li>
                ))}
                <li>
                  <button 
                    className="language-selector ml-2 p-2 rounded-full hover:bg-gray-100 transition-colors duration-200"
                    onClick={toggleLanguageMenu}
                  >
                    <Globe className="w-5 h-5" />
                  </button>
                </li>
              </ul>
            </nav>
            
            {/* Mobile & Tablet Language Selector & Menu Button (below xl) */}
            <div className="flex items-center xl:hidden space-x-2">
              <button 
                className="language-selector p-2 rounded-full hover:bg-gray-100 transition-colors duration-200"
                onClick={toggleLanguageMenu}
              >
                <Globe className="w-5 h-5" />
              </button>
              <button
                onClick={() => {
                  if (onTabletMenuClick) {
                    onTabletMenuClick()
                  } else {
                    setIsMobileMenuOpen(!isMobileMenuOpen)
                  }
                }}
                className="p-2 rounded-full hover:bg-gray-100 transition-colors duration-200 focus:outline-none"
                aria-label="Mở menu điều hướng"
              >
                <Menu className="h-6 w-6 text-gray-700" />
              </button>
            </div>
          </div>
          
          {/* Mobile Navigation (below xl) */}
          <div className={cn(
            "xl:hidden overflow-hidden transition-all duration-300 ease-in-out",
            isMobileMenuOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
          )}>
            <div className="mt-3 border-t border-gray-100 pt-3 pb-4">
              <ul className="space-y-1">
                {navigation.map((item, index) => (
                  <li key={item.name}>
                    <Link
                      to={item.href}
                      onClick={(e) => handleNavigationClick(item, e)}
                      className={cn(
                        "block px-4 py-3 font-medium transition-all duration-200 rounded-lg",
                        "hover:bg-gray-50 active:bg-gray-100",
                        location.pathname === item.href
                          ? "bg-primary-50 text-primary-600 border-l-4 border-primary-500"
                          : "text-gray-700 hover:text-primary-600"
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

      {/* Language Popup */}
      {isLanguageMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={toggleLanguageMenu}
        >
          <div 
            className="bg-white rounded-2xl p-6 max-w-sm w-full mx-4 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-semibold text-gray-800">Chọn ngôn ngữ</h3>
              <button 
                onClick={toggleLanguageMenu}
                className="p-2 rounded-full hover:bg-gray-100 transition-colors duration-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {languages.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => translatePage(lang.code)}
                  className="w-full text-left px-4 py-3 rounded-xl hover:bg-gray-50 active:bg-gray-100 transition-colors duration-200 flex items-center"
                >
                  <span className="mr-3">
                    <img 
                      src={lang.flag} 
                      alt={lang.code.toUpperCase()} 
                      className="inline w-6 h-4 rounded-sm shadow-sm"
                    />
                  </span>
                  <span className="font-medium">{lang.name}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default Header
