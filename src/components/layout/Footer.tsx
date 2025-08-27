import { Link } from 'react-router-dom'
import { MapPin, Phone, Mail, Globe, Facebook, ExternalLink } from 'lucide-react'

const Footer = () => {
  const currentYear = new Date().getFullYear()

  return (
    <footer id="footer" className="bg-white pt-16 pb-8 px-4 border-t border-gray-100 pb-safe">
      <div className="container mx-auto max-w-5xl">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-8">
          {/* About Section */}
          <div>
            <div className="flex items-center space-x-3 mb-4">
              <img 
                src="/assets/images/android-chrome-512x512.png" 
                alt="Logo Núi Bà Đen" 
                className="w-10 h-10 rounded-full"
              />
              <h3 className="font-bold text-lg text-gray-800">
                KDL quốc gia Núi Bà Đen
              </h3>
            </div>
            <p className="text-gray-600 mb-4">
              "Nóc nhà Nam Bộ" - điểm đến tâm linh và du lịch sinh thái hấp dẫn hàng đầu Việt Nam.
            </p>
          </div>
          
          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Liên kết nhanh</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-gray-600 hover:text-primary-500 transition duration-200">
                  Trang chủ
                </Link>
              </li>
              <li>
                <Link to="/map" className="text-gray-600 hover:text-primary-500 transition duration-200">
                  Bản đồ số
                </Link>
              </li>
              <li>
                <Link to="/guide" className="text-gray-600 hover:text-primary-500 transition duration-200">
                  Cẩm nang du lịch
                </Link>
              </li>
              <li>
                <Link to="/climb" className="text-gray-600 hover:text-primary-500 transition duration-200">
                  Đăng ký leo núi
                </Link>
              </li>
            </ul>
          </div>
          
          {/* Contact Info */}
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Thông tin liên hệ</h3>
            <ul className="space-y-2">
              <li className="flex items-start">
                <Mail className="text-gray-400 mt-1.5 w-5 flex-shrink-0" />
                <a 
                  href="mailto:bqlnuiba@gmail.com" 
                  className="ml-2 text-gray-600 hover:text-primary-500 transition duration-200"
                >
                  bqlnuiba@gmail.com
                </a>
              </li>
              <li className="flex items-start">
                <Facebook className="text-gray-400 mt-1.5 w-5 flex-shrink-0" />
                <a 
                  href="https://www.facebook.com/bqlkdlquocgianuibaden" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="ml-2 text-gray-600 hover:text-primary-500 transition duration-200 flex items-center"
                >
                  Fanpage Facebook
                  <ExternalLink className="w-3 h-3 ml-1" />
                </a>
              </li>
              <li className="flex items-start">
                <Globe className="text-gray-400 mt-1.5 w-5 flex-shrink-0" />
                <a 
                  href="https://www.tiktok.com/@nuibadenbql" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="ml-2 text-gray-600 hover:text-primary-500 transition duration-200 flex items-center"
                >
                  nuibadenbql (TikTok)
                  <ExternalLink className="w-3 h-3 ml-1" />
                </a>
              </li>
              <li className="flex items-start">
                <Globe className="text-gray-400 mt-1.5 w-5 flex-shrink-0" />
                <a 
                  href="http://khudulichnuibaden.tayninh.gov.vn" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="ml-2 text-gray-600 hover:text-primary-500 transition duration-200 flex items-center"
                >
                  khudulichnuibaden.tayninh.gov.vn
                  <ExternalLink className="w-3 h-3 ml-1" />
                </a>
              </li>
              <li className="flex items-start">
                <Phone className="text-gray-400 mt-1.5 w-5 flex-shrink-0" />
                <a 
                  href="tel:02763823378" 
                  className="ml-2 text-gray-600 hover:text-primary-500 transition duration-200"
                >
                  0276 3823378
                </a>
              </li>
            </ul>
          </div>
        </div>
        
        {/* Bottom Bar */}
        <div className="border-t border-gray-100 pt-6 text-center">
          <p className="text-gray-500 text-sm">
            © {currentYear} Ban Quản lý Khu du lịch quốc gia Núi Bà Đen
          </p>
        </div>
      </div>
    </footer>
  )
}

export default Footer
