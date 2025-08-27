import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Menu, X, Globe } from 'lucide-react'
import { cn } from '@/utils/cn'

const Header = () => {
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
      setIsScrolled(window.scrollY > 10)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    setIsMobileMenuOpen(false)
  }, [location.pathname])

  const toggleLanguageMenu = () => {
    setIsLanguageMenuOpen(!isLanguageMenuOpen)
    if (!isLanguageMenuOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
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
        "bg-white/90 backdrop-blur-md sticky top-0 z-50 shadow-sm border-b border-gray-100",
        isScrolled && "shadow-lg"
      )}>
        <div className="container mx-auto px-4 py-3">
          <div className="flex justify-between items-center">
            {/* Logo */}
            <div className="flex items-center space-x-3">
              <img 
                src="/assets/images/android-chrome-512x512.png" 
                alt="Logo Núi Bà Đen" 
                className="w-12 h-12 rounded-full object-cover border-2 border-primary-100"
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
            
            {/* Desktop Navigation */}
            <nav className="hidden md:block">
              <ul className="flex space-x-8 items-center">
                {navigation.map((item) => (
                  <li key={item.name}>
                    <Link
                      to={item.href}
                      onClick={(e) => handleNavigationClick(item, e)}
                      className={cn(
                        "nav-link px-2 py-2 font-medium transition duration-200",
                        location.pathname === item.href
                          ? "text-primary-500 border-b-2 border-primary-500"
                          : "text-gray-700 hover:text-primary-500"
                      )}
                    >
                      {item.name}
                    </Link>
                  </li>
                ))}
                <li>
                  <button 
                    className="language-selector ml-2"
                    onClick={toggleLanguageMenu}
                  >
                    <Globe className="w-5 h-5" />
                  </button>
                </li>
              </ul>
            </nav>
            
            {/* Mobile Language Selector & Menu Button */}
            <div className="flex items-center md:hidden">
              <button 
                className="language-selector mr-2"
                onClick={toggleLanguageMenu}
              >
                <Globe className="w-5 h-5" />
              </button>
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="text-gray-700 hover:text-primary-700 focus:outline-none"
                aria-label="Mở menu điều hướng"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </div>
          </div>
          
          {/* Mobile Navigation */}
          {isMobileMenuOpen && (
            <div className="md:hidden mt-3 border-t border-gray-100 pt-3">
              <ul className="space-y-2">
                {navigation.map((item) => (
                  <li key={item.name}>
                    <Link
                      to={item.href}
                      onClick={(e) => handleNavigationClick(item, e)}
                      className={cn(
                        "block px-2 py-2 font-medium transition duration-200",
                        location.pathname === item.href
                          ? "bg-gray-50 rounded-md text-primary-500"
                          : "text-gray-700 hover:text-primary-500"
                      )}
                    >
                      {item.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </header>

      {/* Language Popup */}
      {isLanguageMenuOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          onClick={toggleLanguageMenu}
        >
          <div 
            className="bg-white rounded-lg p-6 max-w-sm w-full mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-800">Chọn ngôn ngữ</h3>
              <button 
                onClick={toggleLanguageMenu}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-2">
              {languages.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => translatePage(lang.code)}
                  className="w-full text-left px-4 py-2 rounded hover:bg-gray-100 flex items-center"
                >
                  <span className="mr-2">
                    <img 
                      src={lang.flag} 
                      alt={lang.code.toUpperCase()} 
                      className="inline w-6 h-4 rounded-sm"
                    />
                  </span>
                  <span>{lang.name}</span>
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
