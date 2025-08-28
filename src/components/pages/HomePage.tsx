import { Link } from 'react-router-dom'
import { 
  MapPin, 
  Mountain, 
  BookOpen, 
  ArrowRight,
  Search,
  Navigation,
  Map,
  Info,
  Clock,
  Globe,
  Route,
  Hotel,
  Utensils,
  Flame,
  ClipboardList,
  CheckCircle,
  Award,
  Headphones,
  Ticket,
  Mountain as MountainIcon,
  Route as RouteIcon,
  Clock as ClockIcon
} from 'lucide-react'
import { ResponsiveContainer } from '../layout'

const HomePage = () => {
  const features = [
    {
      icon: <MapPin className="w-8 h-8" />,
      title: 'Bản đồ Du lịch Số',
      description: 'Khám phá Núi Bà Đen trực quan và tiện lợi:',
      color: 'accent',
      items: [
        { icon: <Search className="w-5 h-5" />, text: 'Tìm kiếm địa điểm theo tên, loại hình.' },
        { icon: <Navigation className="w-5 h-5" />, text: 'Chỉ dẫn đường đi bộ, cáp treo, máng trượt.' },
        { icon: <Map className="w-5 h-5" />, text: 'Xác định vị trí hiện tại của bạn.' },
        { icon: <Info className="w-5 h-5" />, text: 'Xem thông tin chi tiết điểm đến.' },
        { icon: <Clock className="w-5 h-5" />, text: 'Kiểm tra giờ hoạt động (cáp treo, dịch vụ).' },
        { icon: <Globe className="w-5 h-5" />, text: 'Hỗ trợ ngôn ngữ Việt/Anh.' }
      ],
      link: '/map',
      buttonText: 'Truy cập Bản đồ'
    },
    {
      icon: <BookOpen className="w-8 h-8" />,
      title: 'Cẩm nang Du lịch',
      description: 'Thông tin hữu ích cho chuyến đi của bạn:',
      color: 'orange',
      items: [
        { icon: <Route className="w-5 h-5" />, text: 'Các chương trình tour gợi ý.' },
        { icon: <Hotel className="w-5 h-5" />, text: 'Khách sạn, nhà nghỉ, homestay.' },
        { icon: <Utensils className="w-5 h-5" />, text: 'Nhà hàng, quán ăn ngon.' },
        { icon: <Flame className="w-5 h-5" />, text: 'Đặc sản địa phương hấp dẫn.' }
      ],
      link: '/guide',
      buttonText: 'Xem cẩm nang'
    },
    {
      icon: <Mountain className="w-8 h-8" />,
      title: 'Đăng ký leo núi',
      description: 'Chuẩn bị chinh phục "Nóc nhà Nam Bộ":',
      color: 'primary',
      items: [
        { icon: <ClipboardList className="w-5 h-5" />, text: 'Đăng ký thông tin leo núi.' },
        { icon: <CheckCircle className="w-5 h-5" />, text: 'Cam kết tuân thủ quy định an toàn.' },
        { icon: <CheckCircle className="w-5 h-5" />, text: 'Nhận xác nhận trước chuyến đi.' },
        { icon: <Award className="w-5 h-5" />, text: 'Nhận chứng nhận điện tử khi hoàn thành.' },
        { icon: <Headphones className="w-5 h-5" />, text: 'Hỗ trợ thông tin cần thiết cho trekker.' }
      ],
      link: '/climb',
      buttonText: 'Đăng ký ngay'
    }
  ]

  const galleryImages = [
    {
      src: '/assets/images/gallery/placeholder-1-800.webp',
      srcSet: '/assets/images/gallery/placeholder-1-400.webp 400w, /assets/images/gallery/placeholder-1-800.webp 800w, /assets/images/gallery/placeholder-1-1200.webp 1200w',
      alt: 'Chùa Bà tại Núi Bà Đen'
    },
    {
      src: '/assets/images/gallery/placeholder-2-800.webp',
      srcSet: '/assets/images/gallery/placeholder-2-400.webp 400w, /assets/images/gallery/placeholder-2-800.webp 800w, /assets/images/gallery/placeholder-2-1200.webp 1200w',
      alt: 'Tượng Phật trên đỉnh núi'
    },
    {
      src: '/assets/images/gallery/placeholder-3-800.webp',
      srcSet: '/assets/images/gallery/placeholder-3-400.webp 400w, /assets/images/gallery/placeholder-3-800.webp 800w, /assets/images/gallery/placeholder-3-1200.webp 1200w',
      alt: 'Cột mốc 986m'
    },
    {
      src: '/assets/images/gallery/placeholder-4-800.webp',
      srcSet: '/assets/images/gallery/placeholder-4-400.webp 400w, /assets/images/gallery/placeholder-4-800.webp 800w, /assets/images/gallery/placeholder-4-1200.webp 1200w',
      alt: 'Toàn cảnh Núi Bà Đen từ trên cao'
    }
  ]

  const mountainInfo = [
    { icon: <MountainIcon className="w-5 h-5" />, text: 'Độ cao: 986m (so với mực nước biển)' },
    { icon: <MapPin className="w-5 h-5" />, text: 'Vị trí: Phường Bình Minh, tỉnh Tây Ninh' },
    { icon: <RouteIcon className="w-5 h-5" />, text: 'Cách TP. Hồ Chí Minh khoảng 100km' },
    { icon: <ClockIcon className="w-5 h-5" />, text: 'Giờ mở cửa: 7:00 - 18:00 (có thể thay đổi theo mùa)' }
  ]

  const getColorClasses = (color: string) => {
    switch (color) {
      case 'accent':
        return {
          border: 'border-accent-500',
          bg: 'bg-accent-100',
          text: 'text-accent-500',
          title: 'text-accent-700',
          button: 'bg-accent-500 hover:bg-accent-600 active:bg-accent-700'
        }
      case 'orange':
        return {
          border: 'border-orange-500',
          bg: 'bg-orange-100',
          text: 'text-orange-500',
          title: 'text-orange-700',
          button: 'bg-orange-500 hover:bg-orange-600 active:bg-orange-700'
        }
      case 'primary':
        return {
          border: 'border-primary-500',
          bg: 'bg-primary-100',
          text: 'text-primary-500',
          title: 'text-primary-700',
          button: 'bg-primary-500 hover:bg-primary-600 active:bg-primary-700'
        }
      default:
        return {
          border: 'border-primary-500',
          bg: 'bg-primary-100',
          text: 'text-primary-500',
          title: 'text-primary-700',
          button: 'bg-primary-500 hover:bg-primary-600 active:bg-primary-700'
        }
    }
  }

  // Removed pull-to-refresh to avoid interfering with native scrolling on home page

  //

  return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-blue-50">
        {/* Hero Section */}
        <section className="hero-bg min-h-[68vh] md:min-h-[78vh] flex flex-col items-center justify-center text-center text-white px-4 py-12 sm:py-20">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold mb-6 leading-tight drop-shadow-lg">
              Khám phá vẻ đẹp hùng vĩ <br className="hidden md:block" /> Núi Bà Đen
            </h1>
            <p className="text-lg md:text-xl text-gray-100 mb-10 max-w-2xl mx-auto drop-shadow-md leading-relaxed">
              "Nóc nhà Nam Bộ" - điểm đến tâm linh và du lịch sinh thái hấp dẫn.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-3 sm:gap-4">
              <a 
                href="#features" 
                className="bg-primary-500 hover:bg-primary-600 active:bg-primary-700 text-white font-bold py-4 px-8 rounded-full inline-flex items-center justify-center space-x-2 transition-all duration-300 transform hover:scale-105 active:scale-95 shadow-lg tap-target"
              >
                <span>Khám phá ngay</span>
                <ArrowRight className="w-5 h-5" />
              </a>
              <a 
                href="https://booking.sunworld.vn/catalog?land=SunParadiseLandTayNinh" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="bg-accent-500 hover:bg-accent-600 active:bg-accent-700 text-white font-bold py-4 px-8 rounded-full inline-flex items-center justify-center space-x-2 transition-all duration-300 transform hover:scale-105 active:scale-95 shadow-lg tap-target"
              >
                <span>Đặt vé trực tuyến</span>
                <Ticket className="w-5 h-5" />
              </a>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-10 px-4 sm:py-14 md:py-18 -mt-14 sm:-mt-18 md:-mt-22 relative z-20">
          <ResponsiveContainer maxWidth="6xl">
            <p className="text-center text-xl sm:text-2xl font-semibold text-white mb-12">
              Xin kính chào quý du khách!
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-8">
              {features.map((feature, index) => {
                const colors = getColorClasses(feature.color)
                return (
                  <div key={index} className={`feature-card bg-white rounded-2xl shadow-xl overflow-hidden border-t-4 ${colors.border} h-full flex flex-col transform transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl`}>
                    <div className="p-6 sm:p-8 flex flex-col flex-grow">
                      <div className={`mx-auto w-20 h-20 ${colors.bg} rounded-full flex items-center justify-center ${colors.text} mb-6 shadow-lg`}>
                        {feature.icon}
                      </div>
                      <h2 className={`text-2xl sm:text-3xl font-bold ${colors.title} mb-4 text-center`}>
                        {feature.title}
                      </h2>
                      <p className="text-gray-600 mb-6 line-clamp-2 sm:line-clamp-none text-center leading-relaxed">{feature.description}</p>
                      <ul className="space-y-3 mb-8 flex-grow">
                        {feature.items.map((item, itemIndex) => (
                          <li key={itemIndex} className="flex items-start">
                            <span className={`${colors.text} mt-1 w-6 flex-shrink-0`}>
                              {item.icon}
                            </span>
                            <span className="ml-3 text-gray-600 line-clamp-2 sm:line-clamp-none leading-relaxed">{item.text}</span>
                          </li>
                        ))}
                      </ul>
                      <div className="mt-auto">
                        <Link
                          to={feature.link}
                          className={`inline-block w-full ${colors.button} text-white font-bold py-4 px-6 rounded-xl shadow-lg transition-all duration-300 transform hover:scale-105 active:scale-95 flex items-center justify-center space-x-2 tap-target`}
                        >
                          <span>{feature.buttonText}</span>
                          <ArrowRight className="w-5 h-5" />
                        </Link>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </ResponsiveContainer>
        </section>

        {/* About Section */}
        <section className="py-14 px-4 sm:py-18">
          <div className="container mx-auto max-w-6xl">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-gray-800">
              Về Núi Bà Đen
            </h2>
            <div className="bg-white p-8 md:p-12 rounded-2xl shadow-xl">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
                <div className="space-y-6">
                  <p className="text-gray-600 leading-relaxed text-lg">
                    Núi Bà Đen là ngọn núi cao nhất Nam Bộ với độ cao 986m, nằm tại tỉnh Tây Ninh, Việt Nam. 
                    Núi Bà được mệnh danh là "Đệ nhất thiên sơn" của vùng Đông Nam Bộ.
                  </p>
                  <p className="text-gray-600 leading-relaxed text-lg">
                    Đây không chỉ là điểm du lịch sinh thái hấp dẫn mà còn là trung tâm tâm linh với nhiều 
                    di tích lịch sử văn hoá quan trọng như Điện Bà, chùa Linh Sơn Tiên Thạch.
                  </p>
                  <p className="text-gray-600 leading-relaxed text-lg">
                    Hệ thống cáp treo hiện đại và các tiện ích du lịch ngày càng được đầu tư đã giúp 
                    Núi Bà Đen trở thành điểm đến hấp dẫn cho du khách từ khắp nơi.
                  </p>
                </div>
                <div className="bg-gradient-to-br from-primary-50 to-accent-50 p-8 rounded-2xl border border-primary-100">
                  <h3 className="text-2xl font-semibold text-primary-600 mb-6">
                    Thông tin cơ bản
                  </h3>
                  <ul className="space-y-4">
                    {mountainInfo.map((info, index) => (
                      <li key={index} className="flex items-start">
                        <span className="text-primary-500 mt-1 w-6 flex-shrink-0">
                          {info.icon}
                        </span>
                        <span className="ml-3 text-gray-700 leading-relaxed">{info.text}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Gallery Section */}
        <section className="py-14 px-4 sm:py-18 bg-gray-50">
          <div className="container mx-auto max-w-6xl">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-4 text-gray-800">
              Khám phá hình ảnh
            </h2>
            <p className="text-center text-gray-600 mb-12 text-lg">
              Một số hình ảnh đẹp về Núi Bà Đen
            </p>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
              {galleryImages.map((image, index) => (
                <div key={index} className="aspect-square rounded-2xl overflow-hidden bg-gray-200 flex items-center justify-center shadow-lg transform transition-all duration-300 hover:scale-105 hover:shadow-xl">
                  <img 
                    src={image.src}
                    srcSet={image.srcSet}
                    sizes="(max-width: 600px) 400px, (max-width: 1024px) 800px, 1200px"
                    alt={image.alt}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
  )
}

export default HomePage
