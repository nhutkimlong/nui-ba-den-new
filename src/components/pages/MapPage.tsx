import React, { useState, useEffect, useRef, useCallback, Suspense } from 'react'
import { MapContainer, TileLayer, Marker, Polyline, useMap } from 'react-leaflet'
// @ts-ignore - types may be missing from package
const MarkerClusterGroup = React.lazy(() => import('react-leaflet-cluster'))
import 'leaflet/dist/leaflet.css'
import { Search, MapPin, Route, Navigation, X, Globe, Phone, Mail, Facebook, ExternalLink } from 'lucide-react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faOm, faSearch, faLandmark, faUtensils, faBus, faParking, faBell, faClipboardList, faCableCar, faPersonWalking } from '@fortawesome/free-solid-svg-icons'
import { cn } from '@/utils/cn'
import { useMap as useMapData, useMapControls, useRouteFinding, useGeolocation } from '@/hooks/useMap'
import { 
  checkDescentOptionsFromChuaBa,
  getPoiName, 
  getPoiDescription, 
  getUIText,
  COASTER_START_ID,
  COASTER_END_ID
} from '@/services/mapService'
import L from 'leaflet'
import { ResponsiveContainer, useDevice } from '../layout'
import CategoryChips from '@/components/map/CategoryChips'
//
import POIInfoSheet from '@/components/map/POIInfoSheet'
import RouteInstructionsSheet from '@/components/map/RouteInstructionsSheet'
import SearchBarWithActions from '@/components/map/SearchBarWithActions'
import MobileActionsBar from '@/components/map/MobileActionsBar'

// Fix for default markers
delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
})

// POI Markers Component
const POIMarkers = React.memo(({ pois, currentLang, onMarkerClick }: {
  pois: any[]
  currentLang: string
  onMarkerClick: (poi: any) => void
}) => {
  return pois.map((poi) => {
    const name = getPoiName(poi, currentLang)
    
    // Create custom icon using POI's iconurl
    const customIcon = poi.iconurl ? L.divIcon({
      html: `<img src="${poi.iconurl}" alt="${name}" style="width: 32px; height: 32px; object-fit: contain;" />`,
      className: 'custom-poi-icon',
      iconSize: [32, 32],
      iconAnchor: [16, 32],
      popupAnchor: [0, -32]
    }) : undefined
    
    return (
      <Marker
        key={poi.id}
        position={[poi.latitude, poi.longitude]}
        icon={customIcon}
        eventHandlers={{
          click: () => onMarkerClick(poi)
        }}
      />
    )
  })
})

// Map Zoom Controller Component
const MapZoomController = ({ currentRoute, poiData, onMapReady }: { currentRoute: any, poiData: any[], onMapReady: (map: any) => void }) => {
  const map = useMap()

  useEffect(() => {
    // Store map reference when component mounts
    onMapReady(map)
  }, [map, onMapReady])

  useEffect(() => {
    if (currentRoute?.path && currentRoute.path.length > 1) {
      // Get all coordinates from the route
      const routeCoordinates = currentRoute.path
        .map((nodeId: string) => {
          const poi = poiData.find((p: any) => String(p.id) === String(nodeId))
          return poi ? [poi.latitude, poi.longitude] : null
        })
        .filter(Boolean)

      if (routeCoordinates.length > 0) {
        // Create bounds from route coordinates
        const bounds = L.latLngBounds(routeCoordinates)
        
        // Fit map to route bounds with padding
        map.fitBounds(bounds, {
          padding: [20, 20], // Add padding around the route
          maxZoom: 20, // Don't zoom too close
          animate: true,
          duration: 1 // Animation duration in seconds
        })
      }
    }
  }, [currentRoute, poiData, map])

  return null // This component doesn't render anything
}

// Map Toolbar Component removed in favor of inline desktop actions and MobileActionsBar

// Tutorial Popup Component
const TutorialPopup = ({ isOpen, onClose }: {
  isOpen: boolean
  onClose: () => void
}) => {
  if (!isOpen) return null

  return (
    <>
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 z-[1050]"
        onClick={onClose}
      />
      <div className="custom-popup fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white p-4 sm:p-6 rounded-lg shadow-xl z-[1050] w-[90vw] max-w-md max-h-[85vh] overflow-y-auto">
        <button 
          onClick={onClose}
          className="absolute top-2 right-2 text-gray-400 hover:text-gray-600 p-2" 
          aria-label="Đóng hướng dẫn"
        >
          <X className="w-5 h-5" />
        </button>
        <h4 className="text-md sm:text-lg font-semibold mb-3 text-primary-600 text-center">
          Hướng dẫn sử dụng bản đồ
        </h4>
        <div className="tutorial-content space-y-2.5 text-xs sm:text-sm text-gray-700">
          <p className="flex items-center">
            <span className="icon-example mr-2 bg-gray-200 p-1 rounded">
              <Search className="w-4 h-4 text-primary-500" />
            </span>
            Sử dụng ô tìm kiếm để tìm địa điểm.
          </p>
          <p className="flex items-center">
            <span className="icon-example mr-2 bg-gray-200 p-1 rounded">
              <Route className="w-4 h-4 text-primary-500" />
            </span>
            Nhấn biểu tượng chỉ đường để nhập điểm và tìm lộ trình.
          </p>
          <p className="flex items-center">
            <span className="icon-example mr-2 bg-gray-200 p-1 rounded">
              <Navigation className="w-4 h-4 text-primary-500" />
            </span>
            Nhấn để xem vị trí hiện tại của bạn.
          </p>
          <p className="flex items-center">
            <span className="icon-example mr-2 bg-gray-200 p-1 rounded">
              <MapPin className="w-4 h-4 text-yellow-500" />
            </span>
            Nhấn nút "Thuyết minh" (nếu có) để nghe giới thiệu.
          </p>
        </div>
        <div className="language-switcher mt-4 pt-3 border-t border-gray-200 text-center">
          <span className="text-xs text-gray-600 mr-2">Ngôn ngữ:</span>
          <button className="lang-btn text-xs px-2 py-1 rounded border border-gray-300 hover:bg-gray-100 bg-primary-500 text-white">
            Tiếng Việt
          </button>
          <button className="lang-btn text-xs px-2 py-1 rounded border border-gray-300 hover:bg-gray-100 ml-1">
            English
          </button>
        </div>
      </div>
    </>
  )
}

// Contact Popup Component
const ContactPopup = ({ isOpen, onClose }: {
  isOpen: boolean
  onClose: () => void
}) => {
  if (!isOpen) return null

  return (
    <>
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 z-[1050]"
        onClick={onClose}
      />
      <div className="custom-popup fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white p-4 sm:p-6 rounded-lg shadow-xl z-[1050] w-[90vw] max-w-md max-h-[85vh] overflow-y-auto">
        <button 
          onClick={onClose}
          className="absolute top-2 right-2 text-gray-400 hover:text-gray-600 p-2" 
          aria-label="Đóng liên hệ"
        >
          <X className="w-5 h-5" />
        </button>
        <h4 className="text-md sm:text-lg font-semibold mb-3 text-primary-600 text-center">
          Thông tin liên hệ
        </h4>
        <div className="contact-details space-y-2 text-sm text-gray-700">
          <div className="flex items-start">
            <Mail className="text-gray-400 mt-1.5 w-5 flex-shrink-0" />
            <a 
              href="mailto:bqlnuiba@gmail.com" 
              className="ml-2 text-gray-600 hover:text-primary-500 transition duration-200"
            >
              bqlnuiba@gmail.com
            </a>
          </div>
          <div className="flex items-start">
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
          </div>
          <div className="flex items-start">
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
          </div>
          <div className="flex items-start">
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
          </div>
          <div className="flex items-start">
            <Phone className="text-gray-400 mt-1.5 w-5 flex-shrink-0" />
            <a 
              href="tel:02763823378" 
              className="ml-2 text-gray-600 hover:text-primary-500 transition duration-200"
            >
              0276 3823378
            </a>
          </div>
        </div>
        <div className="mt-4 pt-3 border-t border-gray-200 text-center">
          <a 
            href="tel:02763823378"
            className="inline-flex items-center gap-2 bg-primary-500 hover:bg-primary-600 text-white font-semibold py-2 px-4 rounded-md transition duration-150"
          >
            <Phone className="w-4 h-4" />
            Gọi Hotline
          </a>
        </div>
      </div>
    </>
  )
}

// Descent Choice Popup Component
const DescentChoicePopup = ({ isOpen, onClose, onCableCar, onAlpineCoaster, descentOptions }: {
  isOpen: boolean
  onClose: () => void
  onCableCar: () => void
  onAlpineCoaster: () => void
  descentOptions?: any
}) => {
  if (!isOpen) return null

  const cableCarActive = descentOptions?.chuaHangActive || descentOptions?.hoaDongActive
  const coasterActive = descentOptions?.coasterActive

  return (
    <>
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 z-[1050]"
        onClick={onClose}
      />
      <div className="custom-popup fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white p-4 sm:p-6 rounded-lg shadow-xl z-[1050] w-[90vw] max-w-sm">
        <h4 className="text-md sm:text-lg font-semibold mb-3 text-primary-600 text-center">
          Chọn phương tiện xuống núi
        </h4>
        
        {/* Status information */}
        {descentOptions && (
          <div className="mb-4 p-3 bg-gray-50 rounded-lg text-xs">
            <div className="mb-2">
              <span className="font-semibold">Trạng thái hoạt động:</span>
            </div>
            <div className="space-y-1">
              <div className={`flex items-center gap-2 ${cableCarActive ? 'text-green-600' : 'text-red-600'}`}>
                <span>🚠 Cáp treo:</span>
                <span>{cableCarActive ? 'Hoạt động' : 'Không hoạt động'}</span>
              </div>
              <div className={`flex items-center gap-2 ${coasterActive ? 'text-green-600' : 'text-red-600'}`}>
                <span>🎢 Máng trượt:</span>
                <span>{coasterActive ? 'Hoạt động' : 'Không hoạt động'}</span>
              </div>
            </div>
          </div>
        )}
        
        <div className="flex flex-col gap-3">
          <button 
            onClick={onCableCar}
            disabled={!cableCarActive}
            className={`w-full font-semibold py-2 px-4 rounded-md text-center transition duration-150 text-sm flex items-center justify-center gap-2 ${
              cableCarActive 
                ? 'bg-blue-500 hover:bg-blue-600 text-white' 
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            <FontAwesomeIcon icon={faCableCar} />
            <span>Cáp treo</span>
          </button>
          <button 
            onClick={onAlpineCoaster}
            disabled={!coasterActive}
            className={`w-full font-semibold py-2 px-4 rounded-md text-center transition duration-150 text-sm flex items-center justify-center gap-2 ${
              coasterActive 
                ? 'bg-green-500 hover:bg-green-600 text-white' 
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            <FontAwesomeIcon icon={faPersonWalking} />
            <span>Máng trượt</span>
          </button>
        </div>
      </div>
    </>
  )
}


const MapPage = () => {
  // Use the custom hooks for data and state management
  const {
    poiData,
    operatingHours,
    filteredPOIs,
    loading,
    error,
    searchTerm,
    activeCategory,
    currentLang,
    setSearchTerm,
    setActiveCategory,
    setUserLocation,
    addToHistory
  } = useMapData()

  const {
    isTopBarVisible,
    isRouteInputsVisible,
    isTutorialOpen,
    isContactOpen,
    isDescentChoiceOpen,
    toggleTopBar,
    toggleRouteInputs,
    openTutorial,
    closeTutorial,
    closeContact,
    openDescentChoice,
    closeDescentChoice
  } = useMapControls()

  const {
    currentRoute,
    routeLoading,
    routeError,
    setCurrentRoute,
    findRoute,
    clearRoute,
    setLanguage: setRouteLanguage
  } = useRouteFinding(poiData, operatingHours)

  const {
    location,
    getCurrentLocation
  } = useGeolocation()

  // Device detection hook - must be called before any conditional logic
  const { isMobile } = useDevice();

  // Route state
  const [startPoint, setStartPoint] = useState<any>(null)
  const [endPoint, setEndPoint] = useState<any>(null)
  const [startPointText, setStartPointText] = useState('')
  const [endPointText, setEndPointText] = useState('')
  const searchInputRef = useRef<HTMLInputElement>(null)
  const topBarRef = useRef<HTMLDivElement>(null)
  const routeInputsRef = useRef<HTMLDivElement>(null)
  const mapAreaRef = useRef<HTMLDivElement>(null)
  const [tileProvider, setTileProvider] = useState<'google' | 'osm'>('google')
  const mapRef = useRef<any>(null)

  // POI Info Panel state
  const [selectedPOI, setSelectedPOI] = useState<any>(null)
  const [isPOIPanelVisible, setIsPOIPanelVisible] = useState(false)
  const [isRoutePanelVisible, setIsRoutePanelVisible] = useState(false)
  const [isPoiExpanded, setIsPoiExpanded] = useState(false)
  const [isRouteExpanded, setIsRouteExpanded] = useState(false)

  // Autocomplete states
  const [searchSuggestions, setSearchSuggestions] = useState<any[]>([])
  const [showSearchSuggestions, setShowSearchSuggestions] = useState(false)
  const [startSuggestions, setStartSuggestions] = useState<any[]>([])
  const [showStartSuggestions, setShowStartSuggestions] = useState(false)
  const [endSuggestions, setEndSuggestions] = useState<any[]>([])
  const [showEndSuggestions, setShowEndSuggestions] = useState(false)

  // Categories from original map.js - using FontAwesome icons
  const categories = [
    { key: 'religious', name: 'Tâm linh', icon: faOm },
    { key: 'attraction', name: 'Tham quan', icon: faSearch },
    { key: 'historical', name: 'Di tích', icon: faLandmark },
    { key: 'viewpoint', name: 'Ngắm cảnh', icon: faSearch },
    { key: 'food', name: 'Ẩm thực', icon: faUtensils },
    { key: 'transport', name: 'Di chuyển', icon: faBus },
    { key: 'parking', name: 'Bãi xe', icon: faParking },
    { key: 'amenities', name: 'Tiện ích', icon: faBell }
  ]

  // Helper function to get FontAwesome icon for category
  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'attraction': return faSearch
      case 'viewpoint': return faSearch
      case 'historical': return faLandmark
      case 'religious': return faOm
      case 'food': return faUtensils
      case 'transport': return faBus
      case 'parking': return faParking
      case 'amenities': return faBell
      default: return faSearch
    }
  }

  // Update user location when geolocation changes
  useEffect(() => {
    if (location) {
      setUserLocation(location)
    }
  }, [location, setUserLocation])

  // Update route language when current language changes
  useEffect(() => {
    setRouteLanguage(currentLang)
  }, [currentLang, setRouteLanguage])

  // Removed desktop toolbar offset logic

  // Operating status helper for a POI using operatingHours data
  const getOperatingStatusForPoi = useCallback((poi: any) => {
    if (!poi) return null
    try {
      const entry = (operatingHours as any[]).find((e: any) => String(e.id) === String(poi.id))
      if (!entry) return null
      const schedule: Record<string, string> = JSON.parse(entry.operating_hours || '{}')
      const dayKeys = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat']
      const key = dayKeys[new Date().getDay()]
      const range = schedule?.[key] ?? schedule?.default
      if (!range) return null
      if (String(range).toLowerCase() === 'closed') {
        const msg = currentLang === 'en' ? 'Closed today' : 'Hôm nay đóng cửa'
        return { operational: false, message: entry.status_message_en && currentLang === 'en' ? entry.status_message_en : (entry.status_message || msg) }
      }
      const [start, end] = String(range).split('-')
      const toMinutes = (hhmm: string) => {
        const [hh, mm] = hhmm.split(':').map((n: string) => parseInt(n, 10) || 0)
        return hh * 60 + mm
      }
      const now = new Date()
      const nowMin = now.getHours() * 60 + now.getMinutes()
      const open = nowMin >= toMinutes(start) && nowMin <= toMinutes(end)
      const label = `${start}–${end}`
      const msg = open ? (currentLang === 'en' ? `Open • ${label}` : `Đang mở • ${label}`) : (currentLang === 'en' ? `Closed • ${label}` : `Đang đóng cửa • ${label}`)
      const override = currentLang === 'en' ? (entry.status_message_en || null) : (entry.status_message || null)
      return { operational: open, message: override || msg }
    } catch {
      return null
    }
  }, [operatingHours, currentLang])

  const handleDirections = () => {
    // Toggle route inputs; ensure exclusivity with Top bar
    // Hide panels
    setIsPOIPanelVisible(false)
    setSelectedPOI(null)
    setIsRoutePanelVisible(false)
    if (isRouteInputsVisible) {
      toggleRouteInputs()
      return
    }
    if (isTopBarVisible) {
      toggleTopBar()
    }
    toggleRouteInputs()
  }

  const handleLocate = () => {
    getCurrentLocation()
  }

  const handleTutorial = () => {
    openTutorial()
  }


  const handleToggleTiles = useCallback(() => {
    setTileProvider((prev: 'google' | 'osm') => prev === 'google' ? 'osm' : 'google')
  }, [])

  const handleCableCar = () => {
    closeDescentChoice()
    findRouteWithDescentChoice('cable_car')
  }

  const handleAlpineCoaster = () => {
    closeDescentChoice()
    findRouteWithDescentChoice('alpine_coaster')
  }

  // Handle find route with operating hours check
  const handleFindRoute = async () => {
    if (!startPoint || !endPoint) {
      // Show user-friendly error message
      alert('Vui lòng chọn điểm bắt đầu và điểm kết thúc')
      return
    }

    try {
      // Check if this is a descent route from Chùa Bà to Chân núi
      if (startPoint.area === 'Chùa Bà' && endPoint.area === 'Chân núi') {
        console.log('DEBUG: Found descent route from Chua Ba to Chan Nui')
        console.log('DEBUG: Operating hours data:', operatingHours)
        const descentOptions = checkDescentOptionsFromChuaBa(operatingHours)
        console.log('DEBUG: Descent options:', descentOptions)

        // Auto-select when only one option is available; show popup only if both available
        if (descentOptions.onlyCoaster) {
          console.log('DEBUG: Auto-select Alpine Coaster (only option available)')
          handleAlpineCoaster()
          return
        }
        if (descentOptions.onlyCable) {
          console.log('DEBUG: Auto-select Cable Car (only option available)')
          handleCableCar()
          return
        }
        if (descentOptions.bothCableAndCoaster || descentOptions.popupAvailable) {
          console.log('DEBUG: Showing descent choice popup (both options available)')
          openDescentChoice()
          return
        }
        if (descentOptions.allClosed) {
          alert('Hiện tại cả Cáp treo và Máng trượt đều không hoạt động. Vui lòng thử lại sau.')
          return
        }
      }

      // Use the findRoute function from the hook for normal routes
      const startId = String(startPoint.id).trim()
      const endId = String(endPoint.id).trim()
      const routeResult = await findRoute(startId, endId)
      
      if (routeResult) {
        // Add start and end names to the route result
        const enhancedRoute = {
          ...routeResult,
          startName: getPoiName(startPoint, currentLang),
          endName: getPoiName(endPoint, currentLang)
        }

        // Update the current route in the hook
        setCurrentRoute(enhancedRoute)
        setIsPOIPanelVisible(false)
        setSelectedPOI(null)
        setIsRoutePanelVisible(true)
        toggleRouteInputs() // Hide route inputs after finding route
      } else {
        // Show user-friendly error message when no route found
        alert('Không tìm thấy đường đi giữa hai điểm này. Vui lòng thử lại với các điểm khác.')
      }

    } catch (error) {
      console.error('Error finding route:', error)
      // Show user-friendly error message
      alert('Có lỗi xảy ra khi tìm đường. Vui lòng thử lại sau.')
    }
  }

  // Helper function to find route with specific descent choice
  const findRouteWithDescentChoice = async (choice: 'cable_car' | 'alpine_coaster') => {
    try {
      // Resolve the freshest start/end from state and validate
      const s = startPoint ? resolvePOI(startPoint) : null
      const e = endPoint ? resolvePOI(endPoint) : null
      if (!s || !e) {
        alert('Vui lòng chọn đầy đủ điểm bắt đầu và điểm kết thúc')
        return
      }
      const sId = String(s.id).trim()
      const eId = String(e.id).trim()

      if (choice === 'alpine_coaster') {
        // Force route to include Alpine Coaster segment 24 -> 18 by composing two legs
        // 1) From start to Coaster start (24)
        const firstLeg = await findRoute(sId, COASTER_START_ID)
        // 2) From Coaster end (18) to destination
        const secondLeg = await findRoute(COASTER_END_ID, eId)

        if (firstLeg && secondLeg) {
          const combinedPath = [
            ...firstLeg.path,
            ...secondLeg.path
          ]

          const enhancedRoute = {
            path: combinedPath,
            cableRoutes: [...new Set([...(firstLeg.cableRoutes || []), ...(secondLeg.cableRoutes || [])])],
            cost: (firstLeg.cost || 0) + (secondLeg.cost || 0),
            startName: getPoiName(s, currentLang),
            endName: getPoiName(e, currentLang),
            descentChoice: choice
          }

          setCurrentRoute(enhancedRoute)
          setIsPOIPanelVisible(false)
          setSelectedPOI(null)
          setIsRoutePanelVisible(true)
          toggleRouteInputs()
          return
        }
        // If either leg failed, fall back to normal routing
      }

      // Default: normal route
      const routeResult = await findRoute(sId, eId)
      if (routeResult) {
        const enhancedRoute = {
          ...routeResult,
          startName: getPoiName(s, currentLang),
          endName: getPoiName(e, currentLang),
          descentChoice: choice
        }
        setCurrentRoute(enhancedRoute)
        setIsPOIPanelVisible(false)
        setSelectedPOI(null)
        setIsRoutePanelVisible(true)
        toggleRouteInputs()
      }
    } catch (error) {
      console.error('Error finding route with descent choice:', error)
    }
  }

  // Use imported checkDescentOptionsFromChuaBa from mapService for accurate status


  // Handle POI click to show info panel
  const handlePOIClick = useCallback((poi: any) => {
    // Close route panel if open to avoid overlap on mobile
    setIsRoutePanelVisible(false)
    setSelectedPOI(poi)
    setIsPOIPanelVisible(true)
    setIsPoiExpanded(true)
  }, [])

  // Resolve a POI coming from UI into canonical POI from data (ensures stable id)
  const resolvePOI = useCallback((p: any) => {
    if (!p) return p
    const idStr = String(p.id ?? '').trim()
    if (idStr) {
      const byId = filteredPOIs.find(po => String((po as any).id) === idStr) || poiData.find(po => String((po as any).id) === idStr)
      if (byId) return byId
    }
    const name = getPoiName(p, currentLang)
    if (name) {
      const byName = poiData.find(po => getPoiName(po as any, currentLang) === name)
      if (byName) return byName
    }
    return { ...p, id: idStr || String(p.id ?? '') }
  }, [poiData, filteredPOIs, currentLang])

  // Handle get directions
  const handleGetDirections = useCallback((poi: any, direction: 'from' | 'to') => {
    // Clear existing route when starting new directions
    let didReset = false
    if (currentRoute) {
      clearRoute()
      setIsRoutePanelVisible(false)
      // Fully reset previous start/end so we don't keep any old point
      setStartPoint(null)
      setEndPoint(null)
      setStartPointText('')
      setEndPointText('')
      didReset = true
    }

    if (direction === 'from') {
      // Set start point for "Từ đây"
      const resolvedStart = resolvePOI(poi)
      const sanitizedStart = { ...resolvedStart, id: String(resolvedStart.id).trim() }
      setStartPoint(sanitizedStart)
      setStartPointText(getPoiName(sanitizedStart, currentLang))
      // Close POI panel when setting start point
      setIsPOIPanelVisible(false)
      setSelectedPOI(null)
      setIsPoiExpanded(false)
      // If we just reset from an existing route, open inputs and stop here
      if (didReset) {
        toggleRouteInputs()
        return
      }
      
      // Automatically find route if we have both start and end points
      if (endPoint) {
        // Use setTimeout to ensure state updates are processed first
        setTimeout(() => {
          // Check if this is a descent route from Chùa Bà to Chân núi
          const resolvedEndLocal = resolvePOI(endPoint)
          if (sanitizedStart.area === 'Chùa Bà' && resolvedEndLocal.area === 'Chân núi') {
            console.log('DEBUG: Found descent route from Chua Ba to Chan Nui')
            const descentOptions = checkDescentOptionsFromChuaBa(operatingHours)
            console.log('DEBUG: Descent options:', descentOptions)

            // Auto-select when only one option is available; show popup only if both available
            if (descentOptions.onlyCoaster) {
              console.log('DEBUG: Auto-select Alpine Coaster (only option available)')
              handleAlpineCoaster()
              return
            }
            if (descentOptions.onlyCable) {
              console.log('DEBUG: Auto-select Cable Car (only option available)')
              handleCableCar()
              return
            }
            if (descentOptions.bothCableAndCoaster || descentOptions.popupAvailable) {
              console.log('DEBUG: Showing descent choice popup (both options available)')
              openDescentChoice()
              return
            }
            if (descentOptions.allClosed) {
              alert('Hiện tại cả Cáp treo và Máng trượt đều không hoạt động. Vui lòng thử lại sau.')
              return
            }
          }

          // Use the findRoute function from the hook for normal routes
          const startId = String(sanitizedStart.id).trim()
          const endId = String(resolvedEndLocal.id).trim()
          findRoute(startId, endId).then(routeResult => {
            if (routeResult) {
              // Add start and end names to the route result
              const enhancedRoute = {
                ...routeResult,
                startName: getPoiName(poi, currentLang),
                endName: getPoiName(endPoint, currentLang)
              }

              // Update the current route in the hook
              setCurrentRoute(enhancedRoute)
              setIsPOIPanelVisible(false)
              setSelectedPOI(null)
              setIsRoutePanelVisible(true)
              toggleRouteInputs() // Hide route inputs after finding route
            } else {
              // Show user-friendly error message when no route found
              alert('Không tìm thấy đường đi giữa hai điểm này. Vui lòng thử lại với các điểm khác.')
            }
          }).catch(error => {
            console.error('Error finding route:', error)
            // Show user-friendly error message
            alert('Có lỗi xảy ra khi tìm đường. Vui lòng thử lại sau.')
          })
        }, 100)
      } else {
        // If no end point, show route inputs to let user choose end point
        toggleRouteInputs()
      }
    } else {
      // Set end point for "Đến đây" and automatically find route
      const resolvedEnd = resolvePOI(poi)
      const sanitizedEnd = { ...resolvedEnd, id: String(resolvedEnd.id).trim() }
      setEndPoint(sanitizedEnd)
      setEndPointText(getPoiName(sanitizedEnd, currentLang))
      // Close POI panel when setting end point
      setIsPOIPanelVisible(false)
      setSelectedPOI(null)
      setIsPoiExpanded(false)
      // If we just reset from an existing route, open inputs and stop here
      if (didReset) {
        toggleRouteInputs()
        return
      }
      
      // Automatically find route if we have both start and end points
      if (startPoint) {
        // Use setTimeout to ensure state updates are processed first
        setTimeout(() => {
          // Check if this is a descent route from Chùa Bà to Chân núi
          const resolvedStartLocal = resolvePOI(startPoint)
          if (resolvedStartLocal.area === 'Chùa Bà' && sanitizedEnd.area === 'Chân núi') {
            console.log('DEBUG: Found descent route from Chua Ba to Chan Nui')
            const descentOptions = checkDescentOptionsFromChuaBa(operatingHours)
            console.log('DEBUG: Descent options:', descentOptions)

            // Auto-select when only one option is available; show popup only if both available
            if (descentOptions.onlyCoaster) {
              console.log('DEBUG: Auto-select Alpine Coaster (only option available)')
              handleAlpineCoaster()
              return
            }
            if (descentOptions.onlyCable) {
              console.log('DEBUG: Auto-select Cable Car (only option available)')
              handleCableCar()
              return
            }
            if (descentOptions.bothCableAndCoaster || descentOptions.popupAvailable) {
              console.log('DEBUG: Showing descent choice popup (both options available)')
              openDescentChoice()
              return
            }
            if (descentOptions.allClosed) {
              alert('Hiện tại cả Cáp treo và Máng trượt đều không hoạt động. Vui lòng thử lại sau.')
              return
            }
          }

          // Use the findRoute function from the hook for normal routes
          findRoute(startPoint.id, poi.id).then(routeResult => {
            if (routeResult) {
              // Add start and end names to the route result
              const enhancedRoute = {
                ...routeResult,
                startName: getPoiName(startPoint, currentLang),
                endName: getPoiName(poi, currentLang)
              }

              // Update the current route in the hook
              setCurrentRoute(enhancedRoute)
              setIsPOIPanelVisible(false)
              setSelectedPOI(null)
              setIsRoutePanelVisible(true)
              toggleRouteInputs() // Hide route inputs after finding route
            } else {
              // Show user-friendly error message when no route found
              alert('Không tìm thấy đường đi giữa hai điểm này. Vui lòng thử lại với các điểm khác.')
            }
          }).catch(error => {
            console.error('Error finding route:', error)
            // Show user-friendly error message
            alert('Có lỗi xảy ra khi tìm đường. Vui lòng thử lại sau.')
          })
        }, 100)
      } else {
        // If no start point, show route inputs to let user choose start point
        toggleRouteInputs()
      }
    }
  }, [currentLang, toggleRouteInputs, startPoint, endPoint, findRoute, setCurrentRoute, operatingHours, openDescentChoice, currentRoute, clearRoute])

  const handleClosePOIPanel = useCallback(() => {
    setIsPOIPanelVisible(false)
    setSelectedPOI(null)
    setIsPoiExpanded(false)
  }, [])

  const handleCloseRoutePanel = useCallback(() => {
    setIsRoutePanelVisible(false)
    // Don't clear the route - keep it visible on the map
    // clearRoute()
    setIsRouteExpanded(false)
  }, [])

  // Autocomplete functions
  const generateSuggestions = useCallback((input: string, maxResults: number = 8) => {
    if (!input.trim() || input.length < 2) return []
    
    const searchTerm = input.toLowerCase().trim()
    const suggestions = poiData
      .filter(poi => {
        const nameVi = (poi.name || '').toLowerCase()
        const nameEn = (poi.name_en || '').toLowerCase()
        return nameVi.includes(searchTerm) || nameEn.includes(searchTerm)
      })
      .slice(0, maxResults)
      .map(poi => ({
        ...poi,
        displayName: getPoiName(poi, currentLang),
        category: poi.category
      }))
    
    return suggestions
  }, [poiData, currentLang])

  const handleSearchInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setSearchTerm(value)
  }, [setSearchTerm])

  // Debounce suggestions generation based on searchTerm
  useEffect(() => {
    const trimmed = searchTerm.trim()
    const timer = window.setTimeout(() => {
      if (trimmed.length >= 2) {
        const suggestions = generateSuggestions(trimmed)
        setSearchSuggestions(suggestions)
        setShowSearchSuggestions(suggestions.length > 0)
      } else {
        setSearchSuggestions([])
        setShowSearchSuggestions(false)
      }
    }, 180)

    return () => {
      window.clearTimeout(timer)
    }
  }, [searchTerm, generateSuggestions])

  const handleStartPointChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setStartPointText(value)
    setStartPoint(null) // Clear POI object when user types
    
    if (value.trim().length >= 2) {
      const suggestions = generateSuggestions(value)
      setStartSuggestions(suggestions)
      setShowStartSuggestions(suggestions.length > 0)
    } else {
      setStartSuggestions([])
      setShowStartSuggestions(false)
    }
  }, [generateSuggestions])

  const handleEndPointChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setEndPointText(value)
    setEndPoint(null) // Clear POI object when user types
    
    if (value.trim().length >= 2) {
      const suggestions = generateSuggestions(value)
      setEndSuggestions(suggestions)
      setShowEndSuggestions(suggestions.length > 0)
    } else {
      setEndSuggestions([])
      setShowEndSuggestions(false)
    }
  }, [generateSuggestions])

  const handleSearchSuggestionClick = useCallback((poi: any) => {
    setSearchTerm(poi.displayName)
    setShowSearchSuggestions(false)
    setSearchSuggestions([])
    addToHistory(poi.displayName)
    // Show POI info panel immediately when selecting a suggestion
    setSelectedPOI(poi)
    setIsPOIPanelVisible(true)
    setIsPoiExpanded(true)
    setIsRoutePanelVisible(false)
  }, [addToHistory])

  const handleStartSuggestionClick = useCallback((poi: any) => {
    setStartPoint(poi) // Store POI object
    setStartPointText(poi.displayName) // Update text input
    setShowStartSuggestions(false)
    setStartSuggestions([])
  }, [])

  const handleEndSuggestionClick = useCallback((poi: any) => {
    setEndPoint(poi) // Store POI object
    setEndPointText(poi.displayName) // Update text input
    setShowEndSuggestions(false)
    setEndSuggestions([])
  }, [])

  const hideAllSuggestions = useCallback(() => {
    setShowSearchSuggestions(false)
    setShowStartSuggestions(false)
    setShowEndSuggestions(false)
  }, [])

  // Translation helper function
  const t = useCallback((key: string, ...args: any[]) => getUIText(key, currentLang, ...args), [currentLang])

  // Debug logging - only log when data changes significantly
  useEffect(() => {
    console.log('MapPage render:', { loading, error, poiDataLength: poiData.length, filteredPOIsLength: filteredPOIs.length })
  }, [loading, error, poiData.length, filteredPOIs.length])

  // Test descent options logic - only run when operating hours change
  useEffect(() => {
    if (operatingHours.length > 0) {
      const testDescentOptions = checkDescentOptionsFromChuaBa(operatingHours)
      console.log('Test descent options result:', testDescentOptions)
    }
  }, [operatingHours])

  // Generate route instructions for RouteInstructionsSheet
  const generateRouteInstructionsForPath = useCallback((path: string[]) => {
    const instructions: any[] = []
    let walkingStart: any = null
    let walkingEnd: any = null

    const calculateDistance = (pos1: [number, number], pos2: [number, number]) => {
      if (!pos1 || !pos2 || !Array.isArray(pos1) || !Array.isArray(pos2)) return 0
      const R = 6371e3
      const φ1 = pos1[0] * Math.PI / 180
      const φ2 = pos2[0] * Math.PI / 180
      const Δφ = (pos2[0] - pos1[0]) * Math.PI / 180
      const Δλ = (pos2[1] - pos1[1]) * Math.PI / 180
      const a = Math.sin(Δφ / 2) ** 2 + Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) ** 2
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
      return R * c
    }

    const getPos = (poi: any): [number, number] | null => {
      if (typeof poi?.latitude === 'number' && typeof poi?.longitude === 'number') {
        return [poi.latitude, poi.longitude]
      }
      return null
    }

    const areInSameArea = (poi1: any, poi2: any) => {
      const p1 = getPos(poi1)
      const p2 = getPos(poi2)
      if (!p1 || !p2) return false
      if (poi1.area && poi2.area && poi1.area === poi2.area && String(poi1.area).trim() !== '') return true
      const dist = calculateDistance(p1, p2)
      if (String(poi1.id) === 'user_location' && poi2.area && String(poi2.area).trim() !== '' && dist < 150) return true
      if (String(poi2.id) === 'user_location' && poi1.area && String(poi1.area).trim() !== '' && dist < 150) return true
      if (!poi1.area && !poi2.area && dist < 75) return true
      return false
    }

    for (let i = 0; i < path.length - 1; i++) {
      const currentPOI = poiData.find((p: any) => String(p.id) === String(path[i]))
      const nextPOI = poiData.find((p: any) => String(p.id) === String(path[i + 1]))
      if (!currentPOI || !nextPOI) continue

      const isTransferWalk = currentPOI.category === 'transport' && nextPOI.category === 'transport' && areInSameArea(currentPOI, nextPOI)
      const isCableCar = currentPOI.category === 'transport' && nextPOI.category === 'transport' && !areInSameArea(currentPOI, nextPOI)
      const isCoaster = String(currentPOI.id) === '24' && String(nextPOI.id) === '18'

      if (walkingStart && (isCableCar || isCoaster || isTransferWalk)) {
        if (walkingStart.id !== currentPOI.id) {
          const pStart = getPos(walkingStart)
          const pCur = getPos(currentPOI)
          const distance = pStart && pCur ? calculateDistance(pStart, pCur) : 0
          const duration = Math.ceil(distance / 80)
          instructions.push({ type: 'walk', text: `Đi bộ từ ${getPoiName(walkingStart, currentLang)} đến ${getPoiName(currentPOI, currentLang)}`, distance, duration })
        }
        walkingStart = null
        walkingEnd = null
      }

      if (isTransferWalk) {
        const pCur = getPos(currentPOI)
        const pNext = getPos(nextPOI)
        const distance = pCur && pNext ? calculateDistance(pCur, pNext) : 0
        const duration = Math.ceil(distance / 80)
        instructions.push({ type: 'walk', text: `Đi bộ từ ${getPoiName(currentPOI, currentLang)} đến ${getPoiName(nextPOI, currentLang)}`, distance, duration })
        walkingStart = nextPOI
        continue
      }

      if (isCoaster) {
        instructions.push({ type: 'coaster', text: `Đi Máng trượt từ ${getPoiName(currentPOI, currentLang)} xuống ${getPoiName(nextPOI, currentLang)}`, distance: 0, duration: 15, routeName: 'Máng trượt' })
        walkingStart = nextPOI
        continue
      }

      if (isCableCar) {
        const routes1 = String(currentPOI.cable_route || '').split(',').map((r: string) => r.trim()).filter(Boolean)
        const routes2 = String(nextPOI.cable_route || '').split(',').map((r: string) => r.trim()).filter(Boolean)
        const commonRoutes = routes1.filter((r: string) => routes2.includes(r))
        if (commonRoutes.length === 0) {
          if (walkingStart && walkingStart.id !== currentPOI.id) {
            const pStart = getPos(walkingStart)
            const pCur = getPos(currentPOI)
            const distance = pStart && pCur ? calculateDistance(pStart, pCur) : 0
            const duration = Math.ceil(distance / 80)
            instructions.push({ type: 'walk', text: `Đi bộ từ ${getPoiName(walkingStart, currentLang)} đến ${getPoiName(currentPOI, currentLang)}`, distance, duration })
          }
          const pCur2 = getPos(currentPOI)
          const pNext2 = getPos(nextPOI)
          const distance = pCur2 && pNext2 ? calculateDistance(pCur2, pNext2) : 0
          const duration = Math.ceil(distance / 80)
          instructions.push({ type: 'walk', text: `Đi bộ từ ${getPoiName(currentPOI, currentLang)} đến ${getPoiName(nextPOI, currentLang)}`, distance, duration })
          walkingStart = nextPOI
          continue
        }
        const routeName = commonRoutes[0]
        instructions.push({ type: 'cable', text: `Đi ${routeName} từ ${getPoiName(currentPOI, currentLang)} đến ${getPoiName(nextPOI, currentLang)}`, distance: 0, duration: 10, routeName })
        walkingStart = nextPOI
      } else if (!isCoaster) {
        if (!walkingStart) {
          walkingStart = currentPOI
        }
        walkingEnd = nextPOI
      }
    }

    if (walkingStart && walkingEnd && walkingStart.id !== walkingEnd.id) {
      const pStart = getPos(walkingStart)
      const pEnd = getPos(walkingEnd)
      const distance = pStart && pEnd ? calculateDistance(pStart, pEnd) : 0
      const duration = Math.ceil(distance / 80)
      instructions.push({ type: 'walk', text: `Đi bộ từ ${getPoiName(walkingStart, currentLang)} đến ${getPoiName(walkingEnd, currentLang)}`, distance, duration })
    }

    return { instructions }
  }, [poiData, currentLang])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
        <div className="text-center bg-white rounded-2xl p-8 shadow-lg max-w-sm w-full">
          <div className="w-16 h-16 mx-auto mb-6 relative">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-gray-200 border-t-primary-500"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-8 h-8 bg-primary-500 rounded-full animate-pulse"></div>
            </div>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Đang tải bản đồ</h3>
          <p className="text-gray-600 text-sm">Vui lòng đợi trong giây lát...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
        <div className="text-center bg-white rounded-2xl p-8 shadow-lg max-w-sm w-full">
          <div className="w-16 h-16 mx-auto mb-6 bg-red-100 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Không thể tải dữ liệu</h3>
          <p className="text-gray-600 text-sm mb-6">
            {error.includes('Service unavailable') || error.includes('HTML instead of JSON')
              ? 'Dịch vụ tạm thời không khả dụng. Đang sử dụng dữ liệu cục bộ.'
              : `Lỗi: ${error}`
            }
          </p>
          <button
            onClick={() => window.location.reload()}
            className="w-full bg-primary-500 hover:bg-primary-600 text-white font-semibold py-3 px-6 rounded-2xl transition duration-200 shadow-md touch-manipulation"
          >
            Thử lại
          </button>
        </div>
      </div>
    )
  }

  return (
    <ResponsiveContainer maxWidth="7xl" padding="none" fluid>
      <div className="h-[100dvh] bg-gray-50 flex flex-col overflow-hidden" onClick={hideAllSuggestions}>
      {/* Top bar removed here; rendered as map overlay below for consistency */}
      {/* (previous hidden desktop top bar markup deleted to avoid duplication and accidental overlap) */}
      {false && (
      <div className={cn(
        "hidden top-bar bg-white border-b border-gray-200 p-2 sm:p-3 md:p-4 shadow-sm transition-opacity duration-200",
        !isTopBarVisible && "opacity-0 pointer-events-none"
      )}>
        {/* Search Bar */}
        <div className="search-bar relative flex items-center bg-gray-100 rounded-full px-3 sm:px-4 py-1.5 sm:py-2 mb-2 sm:mb-3" onClick={(e) => e.stopPropagation()}>
          <input 
            ref={searchInputRef}
            type="text" 
            placeholder="Tìm kiếm địa điểm..." 
            value={searchTerm}
            onChange={handleSearchInputChange}
            onFocus={() => {
              if (searchSuggestions.length > 0) {
                setShowSearchSuggestions(true)
              }
            }}
            onBlur={() => {
              // Delay hiding to allow clicking on suggestions
              setTimeout(() => setShowSearchSuggestions(false), 200)
            }}
            className="flex-grow border-none outline-none bg-transparent text-sm sm:text-base text-gray-700 placeholder-gray-500"
          />
          <Search className="text-gray-400 pl-2 cursor-pointer w-5 h-5" />
          <button 
            type="button" 
            className="icon text-primary-500 hover:text-primary-600 pl-2 hidden md:inline-flex items-center justify-center" 
            aria-label="Tìm đường"
            onClick={handleDirections}
          >
            <Route className="w-5 h-5" />
          </button>
          
          {/* Search Suggestions Dropdown */}
          {showSearchSuggestions && searchSuggestions.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto z-50">
              {searchSuggestions.map((poi) => (
                <div
                  key={poi.id}
                  className="p-3 cursor-pointer hover:bg-gray-50 border-b border-gray-100 last:border-b-0"
                  onClick={() => handleSearchSuggestionClick(poi)}
                >
                  <div className="flex items-center gap-3">
                    <div className="flex-shrink-0 w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                                             <FontAwesomeIcon icon={getCategoryIcon(poi.category)} className="text-primary-600 text-sm" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-gray-900 truncate">
                        {poi.displayName}
                      </div>
                      <div className="text-sm text-gray-500">
                        {poi.area && `${poi.area} • `}{t(poi.category || 'attraction')}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Filter Categories */}
        <div className="filter-categories-wrapper relative flex items-center">
          <button className="hidden md:flex absolute left-0 z-10 h-full items-center justify-center px-2 bg-white/80 hover:bg-white rounded-l-lg shadow transition-all">
            <span className="text-gray-600">‹</span>
          </button>
          <div className="filter-categories flex gap-1.5 sm:gap-2 overflow-x-auto pb-1 w-full scrollbar-hide">
            <button 
              onClick={() => setActiveCategory(null)}
              className={cn(
                "flex items-center px-2.5 py-1.5 text-xs sm:text-sm rounded-full transition-colors duration-200 whitespace-nowrap",
                !activeCategory 
                  ? "bg-primary-500 text-white" 
                  : "bg-gray-200 hover:bg-gray-300"
              )}
            >
               <FontAwesomeIcon icon={faClipboardList} className="mr-1.5" />
              Tất cả
            </button>
            {categories.map((category) => (
              <button
                key={category.key}
                onClick={() => setActiveCategory(category.key)}
                className={cn(
                  "flex items-center px-2.5 py-1.5 text-xs sm:text-sm rounded-full transition-colors duration-200 whitespace-nowrap",
                  activeCategory === category.key 
                    ? "bg-primary-500 text-white" 
                    : "bg-gray-200 hover:bg-gray-300"
                )}
              >
                <FontAwesomeIcon icon={category.icon} className="mr-1.5" />
                {category.name}
              </button>
            ))}
          </div>
          <button className="hidden md:flex absolute right-0 z-10 h-full items-center justify-center px-2 bg-white/80 hover:bg-white rounded-r-lg shadow transition-all">
            <span className="text-gray-600">›</span>
          </button>
        </div>
      </div>
      )}

      {/* Route Inputs (hidden here; rendered inside map overlay) */}
      <div className={cn(
        "hidden",
        !isRouteInputsVisible && "hidden"
      )} onClick={(e) => e.stopPropagation()}>
        <div className="space-y-3">
          <div className="relative">
            <input
              type="text"
              placeholder="Điểm bắt đầu"
              value={startPointText}
              onChange={handleStartPointChange}
              onFocus={() => {
                if (startSuggestions.length > 0) {
                  setShowStartSuggestions(true)
                }
              }}
              onBlur={() => {
                setTimeout(() => setShowStartSuggestions(false), 200)
              }}
              className="w-full p-4 border border-gray-300 rounded-2xl text-base bg-white text-gray-700 placeholder-gray-400 min-h-[48px] touch-manipulation"
            />
            {showStartSuggestions && startSuggestions.length > 0 && (
              <div className="absolute z-10 w-full bg-white border border-gray-300 rounded-2xl shadow-lg max-h-60 overflow-y-auto mt-2">
                {startSuggestions.map((poi) => (
                  <div
                    key={poi.id}
                    className="p-4 cursor-pointer hover:bg-gray-100 border-b border-gray-100 last:border-b-0 first:rounded-t-2xl last:rounded-b-2xl touch-manipulation"
                    onClick={() => handleStartSuggestionClick(poi)}
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex-shrink-0 w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                        <FontAwesomeIcon icon={getCategoryIcon(poi.category)} className="text-primary-600 text-sm" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-gray-900 text-sm truncate">
                          {poi.displayName}
                        </div>
                        <div className="text-xs text-gray-500">
                          {poi.area && `${poi.area} • `}{t(poi.category || 'attraction')}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
            {showStartSuggestions && startSuggestions.length === 0 && (
              <div className="absolute z-10 w-full bg-white border border-gray-300 rounded-2xl shadow-lg mt-2">
                <div className="p-4 text-sm text-gray-500">
                  {startPointText.trim().length < 2
                    ? 'Gõ ít nhất 2 ký tự'
                    : 'Không tìm thấy. Thử từ khóa khác hoặc chọn theo danh mục.'}
                </div>
              </div>
            )}
          </div>
          <div className="relative">
            <input
              type="text"
              placeholder="Điểm kết thúc"
              value={endPointText}
              onChange={handleEndPointChange}
              onFocus={() => {
                if (endSuggestions.length > 0) {
                  setShowEndSuggestions(true)
                }
              }}
              onBlur={() => {
                setTimeout(() => setShowEndSuggestions(false), 200)
              }}
              className="w-full p-4 border border-gray-300 rounded-2xl text-base bg-white text-gray-700 placeholder-gray-400 min-h-[48px] touch-manipulation"
            />
            {showEndSuggestions && endSuggestions.length > 0 && (
              <div className="absolute z-10 w-full bg-white border border-gray-300 rounded-2xl shadow-lg max-h-60 overflow-y-auto mt-2">
                {endSuggestions.map((poi) => (
                  <div
                    key={poi.id}
                    className="p-4 cursor-pointer hover:bg-gray-100 border-b border-gray-100 last:border-b-0 first:rounded-t-2xl last:rounded-b-2xl touch-manipulation"
                    onClick={() => handleEndSuggestionClick(poi)}
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex-shrink-0 w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                        <FontAwesomeIcon icon={getCategoryIcon(poi.category)} className="text-primary-600 text-sm" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-gray-900 text-sm truncate">
                          {poi.displayName}
                        </div>
                        <div className="text-xs text-gray-500">
                          {poi.area && `${poi.area} • `}{t(poi.category || 'attraction')}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
            {showEndSuggestions && endSuggestions.length === 0 && (
              <div className="absolute z-10 w-full bg-white border border-gray-300 rounded-2xl shadow-lg mt-2">
                <div className="p-4 text-sm text-gray-500">
                  {endPointText.trim().length < 2
                    ? 'Gõ ít nhất 2 ký tự'
                    : 'Không tìm thấy. Thử từ khóa khác hoặc chọn theo danh mục.'}
                </div>
              </div>
            )}
          </div>
        </div>
        <div className="flex items-center gap-3 mt-4">
          <button
            onClick={handleFindRoute}
            disabled={routeLoading}
            className="flex-1 bg-primary-500 hover:bg-primary-600 disabled:bg-gray-400 text-white font-semibold py-4 px-6 rounded-2xl text-base transition duration-150 flex items-center justify-center min-h-[48px] touch-manipulation shadow-md"
          >
            {routeLoading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                Đang tìm...
              </>
            ) : (
              <>
                <Route className="w-5 h-5 mr-2" />
                Tìm đường
              </>
            )}
          </button>
          <button 
            onClick={handleDirections}
            aria-label="Đóng tìm đường" 
            className="ml-2 w-8 h-8 flex items-center justify-center rounded-md border border-gray-300 bg-white text-gray-500 hover:bg-gray-100 hover:text-red-500 transition-all"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        
        {/* Route Error Display */}
        {routeError && (
          <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded-md">
            <p className="text-red-600 text-sm">{routeError}</p>
          </div>
        )}
      </div>

      {/* Map Container */}
      <div ref={mapAreaRef} className="map-area relative bg-gray-200 flex-1 overflow-hidden">
        {/* Map Top Bar overlay (inside map area) */}
        <div ref={topBarRef} className={cn(
          "absolute top-0 left-0 right-0 z-[1001] p-2 sm:p-3 md:p-4",
          isTopBarVisible ? "opacity-100" : "opacity-0 pointer-events-none",
          "transition-opacity duration-200"
        )}>
          <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-2 sm:p-3 md:max-w-5xl md:mx-auto" onClick={(e) => e.stopPropagation()}>
                         <SearchBarWithActions
               searchTerm={searchTerm}
               onChange={handleSearchInputChange}
               onFocus={() => { if (searchSuggestions.length > 0) setShowSearchSuggestions(true) }}
               onBlur={() => setTimeout(() => setShowSearchSuggestions(false), 200)}
               suggestions={searchSuggestions}
               showSuggestions={showSearchSuggestions}
               onSuggestionClick={handleSearchSuggestionClick}
               onDirections={handleDirections}
               onLocate={handleLocate}
               onTutorial={handleTutorial}
               onToggleTiles={handleToggleTiles}
               inputRef={searchInputRef}
               onClear={() => { setSearchTerm(''); setSearchSuggestions([]); setShowSearchSuggestions(false); }}
             />

            <CategoryChips
              categories={categories.map(c => ({ key: c.key, name: c.name, icon: <FontAwesomeIcon icon={c.icon} /> }))}
              activeKey={activeCategory}
              onChange={(k) => setActiveCategory(k)}
              className="mt-2 pb-1"
            />
          </div>
        </div>
        {loading ? (
          <div className="w-full h-full flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto mb-4"></div>
              <p className="text-gray-600">Đang tải bản đồ...</p>
            </div>
          </div>
        ) : error ? (
          <div className="w-full h-full flex items-center justify-center">
            <div className="text-center">
              <p className="text-red-600 mb-4">Lỗi tải bản đồ: {error}</p>
              <button 
                onClick={() => window.location.reload()}
                className="bg-primary-500 hover:bg-primary-600 text-white px-4 py-2 rounded-md"
              >
                Thử lại
              </button>
            </div>
          </div>
        ) : poiData.length === 0 ? (
          <div className="w-full h-full flex items-center justify-center">
            <div className="text-center">
              <p className="text-gray-600 mb-4">Không có dữ liệu điểm tham quan</p>
              <button 
                onClick={() => window.location.reload()}
                className="bg-primary-500 hover:bg-primary-600 text-white px-4 py-2 rounded-md"
              >
                Thử lại
              </button>
            </div>
          </div>
        ) : (
          <MapContainer
            center={[11.370994909356133, 106.17721663114253]}
            zoom={15}
            className="w-full h-full"
            zoomControl={false}
            maxZoom={20}
            preferCanvas
            
            
            wheelPxPerZoomLevel={120}
            zoomAnimation
            fadeAnimation
            style={{ height: '100%', width: '100%' }}
          >
          {/* Map Zoom Controller */}
          <MapZoomController 
            currentRoute={currentRoute} 
            poiData={poiData} 
            onMapReady={(map) => { mapRef.current = map }}
          />
          
          {/* Reserve space top for overlay so map controls are not hidden */}
          <div className="absolute top-0 left-0 right-0 h-0 pointer-events-none" />
          {tileProvider === 'google' ? (
            <TileLayer
              url="https://mt{s}.google.com/vt/lyrs=s&x={x}&y={y}&z={z}"
              subdomains={["0","1","2","3"]}
              attribution="© Google"
              maxZoom={20}
              keepBuffer={2}
              crossOrigin
              detectRetina
            />
          ) : (
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              subdomains={["a","b","c"]}
              attribution="© OpenStreetMap contributors"
              maxZoom={20}
              keepBuffer={2}
              crossOrigin
              detectRetina
            />
          )}
          

          {/* POI Markers with clustering */}
          <Suspense fallback={null}>
          <MarkerClusterGroup
            showCoverageOnHover={false}
            spiderfyOnEveryZoom={false}
            maxClusterRadius={48}
            disableClusteringAtZoom={20}
            iconCreateFunction={(cluster: any) => {
              const count = cluster.getChildCount()
              return L.divIcon({
                html: `<div style="background:#2563eb;color:#fff;border-radius:9999px;width:36px;height:36px;display:flex;align-items:center;justify-content:center;font-weight:700;box-shadow:0 2px 6px rgba(0,0,0,0.25);font-size:13px;">${count}</div>`,
                className: 'custom-cluster-icon',
                iconSize: [36, 36],
                iconAnchor: [18, 18]
              })
            }}
            spiderfyOnClick={false}
            spiderfyOnMaxZoom
            removeOutsideVisibleBounds
            animate
            animateAddingMarkers
            zoomToBoundsOnClick
            polygonOptions={{ opacity: 0, fillOpacity: 0 }}
            spiderLegPolylineOptions={{ weight: 2, color: '#2563eb', opacity: 0.7 }}
            spiderfyDistanceMultiplier={1.2}
          >
            <POIMarkers 
              pois={filteredPOIs} 
              currentLang={currentLang} 
              onMarkerClick={handlePOIClick}
            />
          </MarkerClusterGroup>
          </Suspense>

                     {/* Route polyline */}
           {currentRoute?.path && currentRoute.path.length > 1 && (
             <Polyline
               positions={currentRoute.path
                 .map((nodeId: string) => {
                   const poi = poiData.find((p: any) => String(p.id) === String(nodeId))
                   return poi ? [poi.latitude, poi.longitude] : null
                 })
                 .filter(Boolean) as any}
               color="#22C55E"
               weight={4}
               opacity={0.8}
             />
           )}
          
          {/* Desktop actions are embedded in the top search bar; mobile uses MobileActionsBar */}
          {/* Debug Info (dev only) */}
          {false && (
            <div className="absolute top-2 left-2 bg-white/90 p-2 rounded shadow z-[900] text-xs pointer-events-none">
              POIs: {filteredPOIs.length} | Loading: {loading ? 'Yes' : 'No'} | Error: {error || 'None'}
            </div>
          )}
        </MapContainer>
        )}

        {/* Route Inputs overlay inside map area */}
        <div
          ref={routeInputsRef}
          className={cn(
            "absolute left-0 right-0 z-[1001] p-2 sm:p-3",
            isRouteInputsVisible ? "top-0" : "hidden"
          )}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="mx-2 md:mx-auto md:max-w-3xl bg-white/95 backdrop-blur-lg border border-gray-200 rounded-2xl shadow-xl p-4 ring-1 ring-gray-200">
            <div className="space-y-3">
                             <div className="relative">
                 <input
                   type="text"
                   placeholder="Điểm bắt đầu"
                   value={startPointText}
                   onChange={handleStartPointChange}
                   onFocus={() => {
                     if (startSuggestions.length > 0) {
                       setShowStartSuggestions(true)
                     }
                   }}
                   onBlur={() => {
                     setTimeout(() => setShowStartSuggestions(false), 200)
                   }}
                   className="w-full p-3.5 sm:p-4 pr-12 border border-gray-300 rounded-xl sm:rounded-2xl text-base bg-white text-gray-700 placeholder-gray-400 min-h-[48px] touch-manipulation shadow-sm focus:ring-2 focus:ring-primary-300 focus:border-primary-400"
                 />
                 {startPointText && (
                   <button
                     onClick={() => {
                       setStartPointText('')
                       setStartPoint(null)
                       setStartSuggestions([])
                       setShowStartSuggestions(false)
                     }}
                     className="absolute right-3 top-1/2 transform -translate-y-1/2 w-6 h-6 bg-gray-200 hover:bg-gray-300 rounded-full flex items-center justify-center transition-colors"
                     aria-label="Xóa điểm bắt đầu"
                   >
                     <X className="w-3 h-3 text-gray-600" />
                   </button>
                 )}
                {showStartSuggestions && startSuggestions.length > 0 && (
                  <div className="absolute z-10 w-full bg-white border border-gray-300 rounded-2xl shadow-lg max-h-60 overflow-y-auto mt-2">
                    {startSuggestions.map((poi) => (
                      <div
                        key={poi.id}
                        className="p-4 cursor-pointer hover:bg-gray-100 border-b border-gray-100 last:border-b-0 first:rounded-t-2xl last:rounded-b-2xl touch-manipulation"
                        onClick={() => handleStartSuggestionClick(poi)}
                      >
                        <div className="flex items-center gap-3">
                          <div className="flex-shrink-0 w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                            <FontAwesomeIcon icon={getCategoryIcon(poi.category)} className="text-primary-600 text-sm" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="font-medium text-gray-900 text-sm truncate">
                              {poi.displayName}
                            </div>
                            <div className="text-xs text-gray-500">
                              {poi.area && `${poi.area} • `}{t(poi.category || 'attraction')}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                {showStartSuggestions && startSuggestions.length === 0 && (
                  <div className="absolute z-10 w-full bg-white border border-gray-300 rounded-2xl shadow-lg mt-2">
                    <div className="p-4 text-sm text-gray-500">
                      {startPointText.trim().length < 2
                        ? 'Gõ ít nhất 2 ký tự'
                        : 'Không tìm thấy. Thử từ khóa khác hoặc chọn theo danh mục.'}
                    </div>
                  </div>
                )}
              </div>
                             <div className="relative">
                 <input
                   type="text"
                   placeholder="Điểm kết thúc"
                   value={endPointText}
                   onChange={handleEndPointChange}
                   onFocus={() => {
                     if (endSuggestions.length > 0) {
                       setShowEndSuggestions(true)
                     }
                   }}
                   onBlur={() => {
                     setTimeout(() => setShowEndSuggestions(false), 200)
                   }}
                   className="w-full p-3.5 sm:p-4 pr-12 border border-gray-300 rounded-xl sm:rounded-2xl text-base bg-white text-gray-700 placeholder-gray-400 min-h-[48px] touch-manipulation shadow-sm focus:ring-2 focus:ring-primary-300 focus:border-primary-400"
                 />
                 {endPointText && (
                   <button
                     onClick={() => {
                       setEndPointText('')
                       setEndPoint(null)
                       setEndSuggestions([])
                       setShowEndSuggestions(false)
                     }}
                     className="absolute right-3 top-1/2 transform -translate-y-1/2 w-6 h-6 bg-gray-200 hover:bg-gray-300 rounded-full flex items-center justify-center transition-colors"
                     aria-label="Xóa điểm kết thúc"
                   >
                     <X className="w-3 h-3 text-gray-600" />
                   </button>
                 )}
                {showEndSuggestions && endSuggestions.length > 0 && (
                  <div className="absolute z-10 w-full bg-white border border-gray-300 rounded-2xl shadow-lg max-h-60 overflow-y-auto mt-2">
                    {endSuggestions.map((poi) => (
                      <div
                        key={poi.id}
                        className="p-4 cursor-pointer hover:bg-gray-100 border-b border-gray-100 last:border-b-0 first:rounded-t-2xl last:rounded-b-2xl touch-manipulation"
                        onClick={() => handleEndSuggestionClick(poi)}
                      >
                        <div className="flex items-center gap-3">
                          <div className="flex-shrink-0 w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                            <FontAwesomeIcon icon={getCategoryIcon(poi.category)} className="text-primary-600 text-sm" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="font-medium text-gray-900 text-sm truncate">
                              {poi.displayName}
                            </div>
                            <div className="text-xs text-gray-500">
                              {poi.area && `${poi.area} • `}{t(poi.category || 'attraction')}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                {showEndSuggestions && endSuggestions.length === 0 && (
                  <div className="absolute z-10 w-full bg-white border border-gray-300 rounded-2xl shadow-lg mt-2">
                    <div className="p-4 text-sm text-gray-500">
                      {endPointText.trim().length < 2
                        ? 'Gõ ít nhất 2 ký tự'
                        : 'Không tìm thấy. Thử từ khóa khác hoặc chọn theo danh mục.'}
                    </div>
                  </div>
                )}
              </div>
            </div>
            <div className="flex items-center gap-3 mt-3">
              <button
                onClick={handleFindRoute}
                disabled={routeLoading}
                className="flex-1 bg-primary-500 hover:bg-primary-600 disabled:bg-gray-400 text-white font-semibold py-3.5 sm:py-4 px-6 rounded-xl sm:rounded-2xl text-base transition duration-150 flex items-center justify-center min-h-[48px] touch-manipulation shadow-md"
              >
                {routeLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Đang tìm...
                  </>
                ) : (
                  <>
                    <Route className="w-5 h-5 mr-2" />
                    Tìm đường
                  </>
                )}
              </button>
              <button 
                onClick={handleDirections}
                aria-label="Đóng tìm đường" 
                className="ml-2 w-9 h-9 sm:w-8 sm:h-8 flex items-center justify-center rounded-md border border-gray-300 bg-white text-gray-500 hover:bg-gray-100 hover:text-red-500 transition-all"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            {routeError && (
              <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded-md">
                <p className="text-red-600 text-sm">{routeError}</p>
              </div>
            )}
          </div>
        </div>
        {/* POI Info Sheet (map overlay) */}
        <POIInfoSheet
          poi={selectedPOI}
          visible={isPOIPanelVisible}
          expanded={isPoiExpanded}
          setExpanded={setIsPoiExpanded}
          onClose={handleClosePOIPanel}
          onGetDirections={handleGetDirections}
          t={(key: string, ...args: any[]) => getUIText(key, currentLang, ...args)}
          getPoiName={(p: any) => getPoiName(p, currentLang)}
          getPoiDesc={(p: any) => getPoiDescription(p, currentLang)}
          operatingStatus={selectedPOI ? getOperatingStatusForPoi(selectedPOI) : null}
          isDescentRoute={selectedPOI?.area === 'Chùa Bà' && selectedPOI?.area === 'Chân núi' ? true : false}
          currentLang={currentLang}
        />

                 {/* Route Instructions Sheet (map overlay) */}
         <RouteInstructionsSheet
           visible={isRoutePanelVisible}
           onClose={handleCloseRoutePanel}
           route={currentRoute}
           instructions={currentRoute?.path ? generateRouteInstructionsForPath(currentRoute.path).instructions : []}
           currentLang={currentLang}
           expanded={isRouteExpanded}
           setExpanded={setIsRouteExpanded}
           onZoomToRoute={() => {
             if (mapRef.current && currentRoute?.path && currentRoute.path.length > 1) {
               const routeCoordinates = currentRoute.path
                 .map((nodeId: string) => {
                   const poi = poiData.find((p: any) => String(p.id) === String(nodeId))
                   return poi ? [poi.latitude, poi.longitude] : null
                 })
                 .filter(Boolean)

               if (routeCoordinates.length > 0) {
                 const bounds = L.latLngBounds(routeCoordinates)
                 mapRef.current.fitBounds(bounds, {
                   padding: [20, 20],
                   maxZoom: 20,
                   animate: true,
                   duration: 1
                 })
               }
             }
           }}
         />
      </div>

      {/* Mobile bottom actions bar */}
      <MobileActionsBar
        onLocate={handleLocate}
        onDirections={handleDirections}
        onFocusSearch={() => {
          if (!isTopBarVisible) toggleTopBar()
          if (isRouteInputsVisible) toggleRouteInputs()
          setTimeout(() => searchInputRef.current?.focus(), 0)
        }}
        onTutorial={handleTutorial}
        onToggleTiles={handleToggleTiles}
      />

      {/* Popups (global fixed overlays) */}
      <TutorialPopup 
        isOpen={isTutorialOpen} 
        onClose={closeTutorial} 
      />
      
      <ContactPopup 
        isOpen={isContactOpen} 
        onClose={closeContact} 
      />
      
      <DescentChoicePopup 
        isOpen={isDescentChoiceOpen} 
        onClose={closeDescentChoice}
        onCableCar={handleCableCar}
        onAlpineCoaster={handleAlpineCoaster}
        descentOptions={startPoint?.area === 'Chùa Bà' && endPoint?.area === 'Chân núi' ? checkDescentOptionsFromChuaBa(operatingHours) : undefined}
      />
      </div>
    </ResponsiveContainer>
  )
}

export default MapPage
