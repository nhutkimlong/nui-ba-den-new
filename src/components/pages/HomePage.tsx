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
          button: 'bg-accent-500 hover:bg-accent-600'
        }
      case 'orange':
        return {
          border: 'border-orange-500',
          bg: 'bg-orange-100',
          text: 'text-orange-500',
          title: 'text-orange-700',
          button: 'bg-orange-500 hover:bg-orange-600'
        }
      case 'primary':
        return {
          border: 'border-primary-500',
          bg: 'bg-primary-100',
          text: 'text-primary-500',
          title: 'text-primary-700',
          button: 'bg-primary-500 hover:bg-primary-600'
        }
      default:
        return {
          border: 'border-primary-500',
          bg: 'bg-primary-100',
          text: 'text-primary-500',
          title: 'text-primary-700',
          button: 'bg-primary-500 hover:bg-primary-600'
        }
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-blue-50">
      {/* Hero Section */}
      <section className="hero-bg min-h-[60vh] md:min-h-[70vh] flex flex-col items-center justify-center text-center text-white px-4 py-16 sm:py-24">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl md:text-4xl lg:text-6xl font-extrabold mb-4 leading-tight drop-shadow-lg">
            Khám phá vẻ đẹp hùng vĩ <br className="hidden md:block" /> Núi Bà Đen
          </h1>
          <p className="text-base md:text-xl text-gray-100 mb-8 max-w-2xl mx-auto drop-shadow-md">
            "Nóc nhà Nam Bộ" - điểm đến tâm linh và du lịch sinh thái hấp dẫn.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <a 
              href="#features" 
              className="bg-primary-500 hover:bg-primary-600 text-white font-bold py-3 px-6 rounded-full inline-flex items-center space-x-2 transition duration-300 md:transform md:hover:scale-105 shadow-lg tap-target"
            >
              <span>Khám phá ngay</span>
              <ArrowRight className="w-5 h-5" />
            </a>
            <a 
              href="https://booking.sunworld.vn/catalog?land=SunParadiseLandTayNinh" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="bg-accent-500 hover:bg-accent-600 text-white font-bold py-3 px-6 rounded-full inline-flex items-center space-x-2 transition duration-300 md:transform md:hover:scale-105 shadow-lg tap-target"
            >
              <span>Đặt vé trực tuyến</span>
              <Ticket className="w-5 h-5" />
            </a>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-8 px-4 sm:py-10 md:py-12 -mt-16 sm:-mt-20 md:-mt-24 relative z-20">
        <div className="container mx-auto max-w-5xl">
          <p className="text-center text-lg sm:text-xl font-semibold text-white mb-8">
            Xin kính chào quý du khách!
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
            {features.map((feature, index) => {
              const colors = getColorClasses(feature.color)
              return (
                <div key={index} className={`feature-card bg-white rounded-xl shadow-xl overflow-hidden border-t-4 ${colors.border} h-full flex flex-col`}>
                  <div className="p-6 sm:p-8 flex flex-col flex-grow">
                    <div className={`mx-auto w-16 h-16 ${colors.bg} rounded-full flex items-center justify-center ${colors.text} mb-6`}>
                      {feature.icon}
                    </div>
                    <h2 className={`text-xl sm:text-2xl font-bold ${colors.title} mb-3`}>
                      {feature.title}
                    </h2>
                    <p className="text-gray-600 mb-4 line-clamp-2 sm:line-clamp-none">{feature.description}</p>
                    <ul className="space-y-2 mb-8">
                      {feature.items.map((item, itemIndex) => (
                        <li key={itemIndex} className="flex items-start">
                          <span className={`${colors.text} mt-1 w-5`}>
                            {item.icon}
                          </span>
                          <span className="ml-2 text-gray-600 line-clamp-2 sm:line-clamp-none">{item.text}</span>
                        </li>
                      ))}
                    </ul>
                    <div className="mt-auto">
                      <Link
                        to={feature.link}
                        className={`inline-block ${colors.button} text-white font-bold py-3 px-6 rounded-full shadow-md transition duration-300 md:transform md:hover:scale-105 flex items-center justify-center space-x-2 tap-target`}
                      >
                        <span>{feature.buttonText}</span>
                        <ArrowRight className="w-4 h-4" />
                      </Link>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-5xl">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-8 text-gray-800">
            Về Núi Bà Đen
          </h2>
          <div className="bg-white p-6 md:p-8 rounded-xl shadow-lg">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
              <div>
                <p className="text-gray-600 mb-4 line-clamp-3 md:line-clamp-none">
                  Núi Bà Đen là ngọn núi cao nhất Nam Bộ với độ cao 986m, nằm tại tỉnh Tây Ninh, Việt Nam. 
                  Núi Bà được mệnh danh là "Đệ nhất thiên sơn" của vùng Đông Nam Bộ.
                </p>
                <p className="text-gray-600 mb-4 line-clamp-3 md:line-clamp-none">
                  Đây không chỉ là điểm du lịch sinh thái hấp dẫn mà còn là trung tâm tâm linh với nhiều 
                  di tích lịch sử văn hoá quan trọng như Điện Bà, chùa Linh Sơn Tiên Thạch.
                </p>
                <p className="text-gray-600 line-clamp-3 md:line-clamp-none">
                  Hệ thống cáp treo hiện đại và các tiện ích du lịch ngày càng được đầu tư đã giúp 
                  Núi Bà Đen trở thành điểm đến hấp dẫn cho du khách từ khắp nơi.
                </p>
              </div>
              <div className="bg-gray-100 p-6 rounded-lg">
                <h3 className="text-xl font-semibold text-primary-600 mb-4">
                  Thông tin cơ bản
                </h3>
                <ul className="space-y-3">
                  {mountainInfo.map((info, index) => (
                    <li key={index} className="flex items-start">
                      <span className="text-primary-500 mt-1 w-5">
                        {info.icon}
                      </span>
                      <span className="ml-2">{info.text}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Gallery Section */}
      <section className="py-16 px-4 bg-gray-50">
        <div className="container mx-auto max-w-5xl">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-2 text-gray-800">
            Khám phá hình ảnh
          </h2>
          <p className="text-center text-gray-600 mb-8">
            Một số hình ảnh đẹp về Núi Bà Đen
          </p>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {galleryImages.map((image, index) => (
              <div key={index} className="aspect-square rounded-lg overflow-hidden bg-gray-200 flex items-center justify-center">
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
