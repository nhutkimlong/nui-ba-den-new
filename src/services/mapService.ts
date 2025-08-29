// Map Service - Chuyển đổi từ map.js
import { POI, OperatingHoursData } from '@/types'

// Constants from original map.js
export const DEFAULT_ZOOM = 15
export const LABEL_VISIBILITY_ZOOM = 17
export const LOCAL_DATA_API_POI = '/.netlify/functions/data-blobs?file=POI.json'
export const LOCAL_DATA_API_GIO = '/.netlify/functions/data-blobs?file=GioHoatDong.json'
export const USER_LOCATION_ID = 'user_location'
export const WALKING_THRESHOLD_PATH = 50
export const MAX_DIST_AREAS = 150
export const CONTACT_HOTLINE = '02763823378'

// Cable station IDs
export const COASTER_START_ID = '24'
export const COASTER_END_ID = '18'
export const ROUNDABOUT_ID = '51'
export const CABLE_STATION_CHUA_HANG_ID = '23'
export const CABLE_STATION_HOA_DONG_ID = '33'
export const CABLE_STATION_BA_DEN_ID = '6'
export const CABLE_STATION_VAN_SON_ID = '41'
export const CABLE_STATION_TAM_AN_ID = '43'

// Cable route names
export const CABLE_ROUTE_NAME_TAM_AN = 'Tuyến Tâm An'
export const CABLE_ROUTE_NAME_VAN_SON = 'Tuyến Vân Sơn'
export const CABLE_ROUTE_NAME_CHUA_HANG = 'Tuyến Chùa Hang'

// Dijkstra cost configuration
export const COST_WALK_BASE = 10
export const COST_WALK_DISTANCE_FACTOR = 0.05
export const COST_CABLE_CAR_BASE = 20
export const COST_CABLE_CAR_PREFERRED_BONUS = -10
export const COST_CABLE_CAR_FALLBACK_PENALTY = 5
export const COST_TRANSFER_PENALTY_WALK_TO_CABLE = 5
export const COST_TRANSFER_PENALTY_CABLE_TO_WALK = 2
export const COST_TRANSFER_BETWEEN_CABLES = 10

// POI Categories
export const POI_CATEGORIES = {
  'attraction': { icon: 'fa-binoculars', nameKey: 'attraction' },
  'viewpoint': { icon: 'fa-mountain', nameKey: 'viewpoint' },
  'historical': { icon: 'fa-flag', nameKey: 'historical' },
  'religious': { icon: 'fa-dharmachakra', nameKey: 'religious' },
  'food': { icon: 'fa-utensils', nameKey: 'food' },
  'transport': { icon: 'fa-bus', nameKey: 'transport' },
  'parking': { icon: 'fa-parking', nameKey: 'parking' },
  'amenities': { icon: 'fa-concierge-bell', nameKey: 'amenities' }
}

// Translations
export const translations = {
  vi: {
    mapTitle: "Bản đồ số du lịch Núi Bà Đen",
    searchPlaceholder: "Tìm địa điểm...",
    allCategories: 'Tất cả',
    loading: "Đang tải...",
    locating: "Đang định vị...",
    loadingError: "Lỗi tải dữ liệu.",
    yourLocation: "Vị trí của bạn",
    nearLocation: (name: string) => `Gần ${name}`,
    routeStartPlaceholder: "Điểm bắt đầu",
    routeEndPlaceholder: "Điểm kết thúc",
    findRouteButton: "Tìm đường",
    directions: "Chỉ đường",
    mapLayers: "Lớp bản đồ",
    locateMe: "Vị trí của tôi",
    close: "Đóng",
    operationalPrefix: "Hoạt động",
    closedPrefix: "Đóng cửa",
    statusOperational: (time: string) => `Hoạt động (đến ${time})`,
    statusNotOpenYet: (time: string) => `Mở lúc ${time}`,
    statusAlreadyClosed: (time: string) => `Đã đóng cửa (lúc ${time})`,
    statusClosedToday: "Đóng cửa hôm nay",
    statusClosedUntil: (date: string) => `Đóng đến hết ${date}`,
    statusMissingData: "Thiếu dữ liệu giờ",
    statusErrorFormat: "Lỗi định dạng giờ",
    statusErrorData: "Lỗi dữ liệu giờ",
    statusNoSchedule: "Không có lịch hôm nay",
    poiInfoArea: "Khu vực",
    audioNarrate: "Thuyết minh",
    routeFromHere: "Từ đây",
    routeToHere: "Đến đây",
    routeNotFound: "Không tìm thấy đường đi.",
    routeErrorStartNotFound: (name: string) => `Không tìm thấy điểm bắt đầu "${name}".`,
    routeErrorEndNotFound: (name: string) => `Không tìm thấy điểm kết thúc "${name}".`,
    routeErrorSelectStart: "Chọn điểm bắt đầu.",
    routeErrorSelectEnd: "Chọn điểm kết thúc.",
    routeErrorSamePoint: "Điểm đầu và cuối trùng nhau.",
    routeErrorPathTimeout: "Hết thời gian tìm đường.",
    routeErrorGeneric: "Lỗi tìm đường.",
    routeErrorBothClosed: "Không tìm thấy đường đi phù hợp do cả Cáp treo và Máng trượt xuống núi đều không hoạt động.",
    routeInstructionTitle: (start: string, end: string, choice?: string) => `${start} → ${end}${choice === 'alpine_coaster' ? ' (ưu tiên Máng trượt)' : ''}`,
    routeInstructionWalk: (start: string, end: string) => `🚶 Đi bộ từ ${start} đến ${end}`,
    routeInstructionCable: (route: string, start: string, end: string) => `🚠 Đi ${route} từ ${start} đến ${end}`,
    routeInstructionCoaster: (start: string, end: string) => `🎢 Đi Máng trượt từ ${start} xuống ${end}`,
    noPOIFoundForSearch: (term: string) => `Không có kết quả cho "${term}".`,
    googleMapsFallbackPrompt: "Thử tìm đường bằng Google Maps?",
    errorLoadingPOIInfo: "Lỗi tải thông tin.",
    calculatingRoute: "Đang tìm đường...",
    tutorialTitle: "Hướng dẫn Bản đồ",
    tutorialSearch: "Dùng ô tìm kiếm để tìm địa điểm.",
    tutorialDirections: "Nhấn biểu tượng chỉ đường để nhập điểm và tìm lộ trình.",
    tutorialLocation: "Nhấn để xem vị trí hiện tại.",
    tutorialAudio: "Nhấn nút 'Thuyết minh' (nếu có) để nghe.",
    languageSwitcherLabel: "Ngôn ngữ:",
    contactTitle: "Thông tin liên hệ",
    callHotline: "Gọi Hotline",
    chooseDescentTitle: "Chọn phương tiện xuống núi",
    cableCar: "Cáp treo",
    alpineCoaster: "Máng trượt",
    attraction: "Tham quan", 
    viewpoint: "Ngắm cảnh", 
    historical: "Di tích",
    religious: "Tâm linh", 
    food: "Ẩm thực", 
    transport: "Di chuyển",
    parking: "Bãi xe", 
    amenities: "Tiện ích", 
    service: "Dịch vụ",
  },
  en: {
    mapTitle: "Ba Den Mountain Digital Map",
    searchPlaceholder: "Search places...",
    allCategories: 'All',
    loading: "Loading...",
    locating: "Locating...",
    loadingError: "Error loading data.",
    yourLocation: "Your Location",
    nearLocation: (name: string) => `Near ${name}`,
    routeStartPlaceholder: "Starting point",
    routeEndPlaceholder: "Destination",
    findRouteButton: "Find Route",
    directions: "Directions",
    mapLayers: "Map Layers",
    locateMe: "My Location",
    close: "Close",
    operationalPrefix: "Operational",
    closedPrefix: "Closed",
    statusOperational: (time: string) => `Operational (until ${time})`,
    statusNotOpenYet: (time: string) => `Opens at ${time}`,
    statusAlreadyClosed: (time: string) => `Closed (at ${time})`,
    statusClosedToday: "Closed today",
    statusClosedUntil: (date: string) => `Closed until ${date}`,
    statusMissingData: "Hours unavailable",
    statusErrorFormat: "Time format error",
    statusErrorData: "Hours data error",
    statusNoSchedule: "No schedule today",
    poiInfoArea: "Area",
    audioNarrate: "Audio Guide",
    routeFromHere: "From here",
    routeToHere: "To here",
    routeNotFound: "Route not found.",
    routeErrorStartNotFound: (name: string) => `Start point "${name}" not found.`,
    routeErrorEndNotFound: (name: string) => `End point "${name}" not found.`,
    routeErrorSelectStart: "Select start point.",
    routeErrorSelectEnd: "Select end point.",
    routeErrorSamePoint: "Start and end are same.",
    routeErrorPathTimeout: "Routing timed out.",
    routeErrorGeneric: "Routing error.",
    routeErrorBothClosed: "Cannot find a suitable route as both the Cable Car and Alpine Coaster for descent are closed.",
    routeInstructionTitle: (start: string, end: string, choice?: string) => `${start} → ${end}${choice === 'alpine_coaster' ? ' (prioritizing Alpine Coaster)' : ''}`,
    routeInstructionWalk: (start: string, end: string) => `🚶 Walk from ${start} to ${end}`,
    routeInstructionCable: (route: string, start: string, end: string) => `🚠 Take ${route} from ${start} to ${end}`,
    routeInstructionCoaster: (start: string, end: string) => `🎢 Ride Coaster from ${start} to ${end}`,
    noPOIFoundForSearch: (term: string) => `No results for "${term}".`,
    googleMapsFallbackPrompt: "Try Google Maps for directions?",
    errorLoadingPOIInfo: "Error loading info.",
    calculatingRoute: "Calculating route...",
    tutorialTitle: "Map Guide",
    tutorialSearch: "Use search bar to find places.",
    tutorialDirections: "Tap directions icon to input points and find route.",
    tutorialLocation: "Tap to see your current location.",
    tutorialAudio: "Tap 'Audio Guide' (if available) to listen.",
    languageSwitcherLabel: "Language:",
    contactTitle: "Contact Information",
    callHotline: "Call Hotline",
    chooseDescentTitle: "Choose descent vehicle",
    cableCar: "Cable Car",
    alpineCoaster: "Alpine Coaster",
    attraction: "Attractions", 
    viewpoint: "Viewpoints", 
    historical: "Historical",
    religious: "Religious", 
    food: "Food", 
    transport: "Transport",
    parking: "Parking", 
    amenities: "Amenities", 
    service: "Services",
  }
}

// Helper functions
export const getUIText = (key: string, lang: string = 'vi', ...args: any[]) => {
  const translationSet = translations[lang as keyof typeof translations] || translations.vi
  const textOrFn = translationSet[key as keyof typeof translationSet]
  if (typeof textOrFn === 'function') {
    return (textOrFn as any)(...args)
  }
  return textOrFn || key
}

export const calculateDistance = (pos1: [number, number], pos2: [number, number]): number => {
  if (!pos1 || !pos2 || !Array.isArray(pos1) || !Array.isArray(pos2)) {
    return Infinity
  }
  
  const R = 6371e3 // Earth's radius in meters
  const φ1 = pos1[0] * Math.PI / 180
  const φ2 = pos2[0] * Math.PI / 180
  const Δφ = (pos2[0] - pos1[0]) * Math.PI / 180
  const Δλ = (pos2[1] - pos1[1]) * Math.PI / 180

  const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ/2) * Math.sin(Δλ/2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))

  return R * c
}

export const areInSameArea = (poi1: POI, poi2: POI): boolean => {
  if (!poi1?.latitude || !poi1?.longitude || !poi2?.latitude || !poi2?.longitude) return false
  
  // Check if both POIs have a defined area and they are the same
  if (poi1.area && poi2.area && poi1.area === poi2.area && String(poi1.area).trim() !== '') return true

  // If one POI is user location and the other has an area, check distance
  const dist = calculateDistance([poi1.latitude, poi1.longitude], [poi2.latitude, poi2.longitude])
  if (String(poi1.id) === USER_LOCATION_ID && poi2.area && String(poi2.area).trim() !== '' && dist < MAX_DIST_AREAS) return true
  if (String(poi2.id) === USER_LOCATION_ID && poi1.area && String(poi1.area).trim() !== '' && dist < MAX_DIST_AREAS) return true

  // Fallback: if areas are not defined but they are very close, consider them in the same "implicit" area for walking
  if (!poi1.area && !poi2.area && dist < MAX_DIST_AREAS / 2) return true

  return false
}

export const areOnSameCableRoute = (station1: POI, station2: POI): boolean => {
  if (!station1?.cable_route || !station2?.cable_route || station1.category !== 'transport' || station2.category !== 'transport') return false
  const routes1 = String(station1.cable_route).split(',').map(r => r.trim()).filter(r => r)
  const routes2 = String(station2.cable_route).split(',').map(r => r.trim()).filter(r => r)
  return routes1.length > 0 && routes2.length > 0 && routes1.some(route => routes2.includes(route))
}

export const isStationOnSpecificRoute = (station1: POI, station2: POI, targetRouteName: string): boolean => {
  if (!station1 || !station2 || !targetRouteName) return false
  if (station1.category !== 'transport' || station2.category !== 'transport') return false

  const routes1 = String(station1.cable_route || '').split(',').map(r => r.trim()).filter(r => r)
  const routes2 = String(station2.cable_route || '').split(',').map(r => r.trim()).filter(r => r)

  return routes1.includes(targetRouteName) && routes2.includes(targetRouteName)
}

export const getPoiName = (poi: POI, lang: string = 'vi'): string => {
  if (!poi) return ''

  if (String(poi.id) === USER_LOCATION_ID) {
    return getUIText('yourLocation', lang)
  }

  const name = lang === 'en' && poi.name_en
    ? poi.name_en
    : poi.name

  return name || `POI ${poi.id}`
}

export const getPoiDescription = (poi: POI, lang: string = 'vi'): string => {
  if (!poi) return ''

  const description = lang === 'en' && poi.description_en
    ? poi.description_en
    : poi.description

  return description || ''
}

export const getDefaultIconUrl = (poiType: string): string => {
  const basePath = '/assets/icons/'
  const icons: Record<string, string> = {
    attraction: `${basePath}attraction.png`,
    viewpoint: `${basePath}viewpoint.png`,
    historical: `${basePath}historical.png`,
    religious: `${basePath}religious.png`,
    food: `${basePath}food.png`,
    transport: `${basePath}transport.png`,
    parking: `${basePath}parking.png`,
    amenities: `${basePath}amenities.png`,
  }
  return icons[poiType] || 'https://maps.google.com/mapfiles/ms/icons/red-dot.png'
}

// Operational status check
export const checkOperationalStatus = (
  poiId: string, 
  gioHoatDongData: OperatingHoursData[], 
  currentTime: Date = new Date()
): { operational: boolean; message: string } => {
  const t = (key: string, ...args: any[]) => getUIText(key, 'vi', ...args)

  // Find operating hours from gioHoatDongData
  let hoursData = null
  if (gioHoatDongData && gioHoatDongData.length > 0) {
    const gio = gioHoatDongData.find(g => String(g.id) === String(poiId))
    
    if (gio && gio.operating_hours) {
      try {
        hoursData = typeof gio.operating_hours === 'string' 
          ? JSON.parse(gio.operating_hours) 
          : gio.operating_hours
      } catch (e) {
        console.error('Error parsing operating_hours:', e)
        hoursData = null
      }
    }
  }

  if (!hoursData) {
    // Default to allow routing through POIs without operating hours data
    return { operational: true, message: '' }
  }

  const currentYear = currentTime.getFullYear()
  const currentMonth = currentTime.getMonth()
  const currentDate = currentTime.getDate()
  const currentDayOfWeek = currentTime.getDay()
  const currentHour = currentTime.getHours()
  const currentMinute = currentTime.getMinutes()

  const dayKeys = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"]
  let timeString = hoursData[dayKeys[currentDayOfWeek]] ?? hoursData['default'] ?? hoursData['monfri']
  
  if (timeString === undefined) return { operational: false, message: t('statusNoSchedule') }
  
  if (String(timeString).toLowerCase() === "closed") {
    return { operational: false, message: t('statusClosedToday') }
  }
  
  const timeParts = String(timeString).match(/^(\d{1,2}):(\d{2})-(\d{1,2}):(\d{2})$/)
  if (!timeParts) return { operational: false, message: t('statusErrorFormat') }
  
  const openHour = parseInt(timeParts[1])
  const openMinute = parseInt(timeParts[2])
  const closeHour = parseInt(timeParts[3])
  const closeMinute = parseInt(timeParts[4])
  
  const nowMinutes = currentHour * 60 + currentMinute
  const openMinutes = openHour * 60 + openMinute
  const closeMinutes = closeHour * 60 + closeMinute
  
  if (nowMinutes < openMinutes) {
    return { 
      operational: false, 
      message: t('statusNotOpenYet', `${openHour}:${openMinute.toString().padStart(2, '0')}`) 
    }
  }
  
  if (nowMinutes >= closeMinutes) {
    return { 
      operational: false, 
      message: t('statusAlreadyClosed', `${closeHour}:${closeMinute.toString().padStart(2, '0')}`) 
    }
  }
  
  return { 
    operational: true, 
    message: t('statusOperational', `${closeHour}:${closeMinute.toString().padStart(2, '0')}`) 
  }
}

// API functions
export const fetchPOIData = async (): Promise<POI[]> => {
  try {
    const response = await fetch(LOCAL_DATA_API_POI)
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    const data = await response.json()
    return data.map((poi: any) => {
      let t = poi.category?.toLowerCase().trim()
      if (t === 'religion') t = 'religious'
      return {
        ...poi,
        id: String(poi.id),
        position: (poi as any).position || [parseFloat(poi.latitude), parseFloat(poi.longitude)],
        type: POI_CATEGORIES[t as keyof typeof POI_CATEGORIES] ? t : 'attraction'
      }
    }).filter((poi: POI) => (poi as any).position && !isNaN((poi as any).position[0]) && !isNaN((poi as any).position[1]))
  } catch (error) {
    console.error("Error loading POI data:", error)
    throw error
  }
}

export const fetchOperatingHours = async (): Promise<OperatingHoursData[]> => {
  try {
    const response = await fetch(LOCAL_DATA_API_GIO)
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    return await response.json()
  } catch (error) {
    console.error("Error loading operating hours:", error)
    return []
  }
}

// Local storage utilities
export const saveToLocalStorage = (key: string, data: any): void => {
  try {
    localStorage.setItem(key, JSON.stringify(data))
  } catch (error) {
    console.warn(`Error saving to localStorage (${key}):`, error)
  }
}

export const getFromLocalStorage = (key: string): any => {
  try {
    const data = localStorage.getItem(key)
    return data ? JSON.parse(data) : null
  } catch (error) {
    console.warn(`Error reading from localStorage (${key}):`, error)
    return null
  }
}

export const clearLocalStorage = (key: string): void => {
  try {
    localStorage.removeItem(key)
  } catch (error) {
    console.warn(`Error clearing localStorage (${key}):`, error)
  }
}

// Search history management
export const addToSearchHistory = (searchTerm: string): void => {
  if (!searchTerm) return

  const history = getFromLocalStorage('ba_den_search_history') || []
  const newHistory = [searchTerm, ...history.filter((term: string) => term !== searchTerm)].slice(0, 10)
  saveToLocalStorage('ba_den_search_history', newHistory)
}

export const getSearchHistory = (): string[] => {
  return getFromLocalStorage('ba_den_search_history') || []
}

// MinPriorityQueue class for Dijkstra algorithm
export class MinPriorityQueue {
  private elements: Array<{ element: string; priority: number }> = []

  enqueue(element: string, priority: number): void {
    this.elements.push({ element, priority })
    this.elements.sort((a, b) => a.priority - b.priority)
  }

  dequeue(): { element: string; priority: number } | null {
    return this.elements.shift() || null
  }

  isEmpty(): boolean {
    return this.elements.length === 0
  }
}

// Cost function for Dijkstra's algorithm
export const getSegmentCost = (
  poi1: POI, 
  poi2: POI, 
  segmentType: string, 
  pathSoFar: string[], 
  options: any = {}
): number => {
  let cost = 0
  const previousPoiId = pathSoFar.length > 1 ? pathSoFar[pathSoFar.length - 2] : null
  const previousPoi = previousPoiId ? poi1 : null // This should be looked up from POI data

  switch (segmentType) {
    case 'walk_explicit':
    case 'walk_implicit':
      cost = COST_WALK_BASE
      const dist = calculateDistance((poi1 as any).position, (poi2 as any).position)
      if (isFinite(dist)) {
        cost += dist * COST_WALK_DISTANCE_FACTOR
      }
      if (previousPoi && (previousPoi as any).type === 'transport' && (poi1 as any).type !== 'transport') {
        cost += COST_TRANSFER_PENALTY_CABLE_TO_WALK
      } else if (previousPoi && (previousPoi as any).type === 'transport' && (poi1 as any).type === 'transport' && !areOnSameCableRoute(previousPoi, poi1)) {
        cost += COST_TRANSFER_BETWEEN_CABLES
      }
      break
    case 'transport_preferred':
      cost = COST_CABLE_CAR_BASE + COST_CABLE_CAR_PREFERRED_BONUS
      if (previousPoi && (previousPoi as any).type !== 'transport') {
        cost += COST_TRANSFER_PENALTY_WALK_TO_CABLE
      }
      break
    case 'transport_fallback':
      cost = COST_CABLE_CAR_BASE + COST_CABLE_CAR_FALLBACK_PENALTY
      if (previousPoi && (previousPoi as any).type !== 'transport') {
        cost += COST_TRANSFER_PENALTY_WALK_TO_CABLE
      }
      break
    case 'transport_standard':
    default:
      cost = COST_CABLE_CAR_BASE
      if (previousPoi && (previousPoi as any).type !== 'transport') {
        cost += COST_TRANSFER_PENALTY_WALK_TO_CABLE
      }
      break
  }
  return Math.max(0.1, cost)
}

// Main Dijkstra pathfinding implementation
export const findPathDijkstraInternal = (
  startId: string, 
  endId: string, 
  allPoiData: POI[], 
  options: any = {},
  operatingHours: OperatingHoursData[] = []
): any => {
  const distances: Record<string, number> = {}
  const previousNodes: Record<string, string | null> = {}
  const pq = new MinPriorityQueue()

  allPoiData.forEach(poi => {
    distances[String(poi.id)] = Infinity
    previousNodes[String(poi.id)] = null
  })
  distances[String(startId)] = 0
  pq.enqueue(String(startId), 0)

  const startTime = performance.now()
  const now = new Date()

  const getPoi = (id: string): POI | null => {
    return allPoiData.find(poi => String(poi.id) === String(id)) || null
  }

  const findAreaForLocation = (position: [number, number]): string | null => {
    // Find the closest POI with an area
    let closestPoi: POI | null = null
    let minDistance = Infinity

    for (const poi of allPoiData) {
      if (poi.area && (poi as any).position) {
        const dist = calculateDistance(position, (poi as any).position)
        if (dist < minDistance) {
          minDistance = dist
          closestPoi = poi
        }
      }
    }

    return closestPoi?.area || null
  }

  while (!pq.isEmpty()) {
    const dequeued = pq.dequeue()
    if (!dequeued) continue

    const { element: currentIdStr, priority: currentDistance } = dequeued

    if (currentDistance > distances[currentIdStr]) {
      continue
    }

    let currentPOIObject = getPoi(currentIdStr)
    if (!(currentPOIObject as any)?.position) continue

    if (currentIdStr === USER_LOCATION_ID && !currentPOIObject.area && (currentPOIObject as any).position) {
      currentPOIObject = { 
        ...currentPOIObject, 
        area: findAreaForLocation((currentPOIObject as any).position) || `${USER_LOCATION_ID}_area_internal` 
      }
    }

    let pathSoFarToCurrent: string[] = []
    let tempPrev = currentIdStr
    while (tempPrev && previousNodes[tempPrev]) {
      pathSoFarToCurrent.unshift(tempPrev)
      tempPrev = previousNodes[tempPrev]
    }
    if (tempPrev || currentIdStr === String(startId)) {
      pathSoFarToCurrent.unshift(tempPrev || currentIdStr)
    }

    // Check preferred route constraint
    let hasUsedPreferredRoute = !options.strictPreferredRoute
    if (options.strictPreferredRoute) {
      for (let i = 0; i < pathSoFarToCurrent.length - 1; i++) {
        const currentPoi = getPoi(pathSoFarToCurrent[i])
        const nextPoi = getPoi(pathSoFarToCurrent[i + 1])
        if ((currentPoi as any)?.type === 'transport' && (nextPoi as any)?.type === 'transport' &&
            isStationOnSpecificRoute(currentPoi, nextPoi, options.strictPreferredRoute)) {
          hasUsedPreferredRoute = true
          break
        }
      }
    }

    if (currentIdStr === String(endId)) {
      if (!hasUsedPreferredRoute) {
        continue
      }
      const path: string[] = []
      let curr = String(endId)
      while (curr) {
        path.unshift(curr)
        curr = previousNodes[curr]
        if (path.length > allPoiData.length + 5) {
          console.error("Error reconstructing path for Dijkstra, possible cycle or error in previousNodes.")
          return null
        }
      }
      const finalCableRoutes = calculateCableRoutesForPath(path, allPoiData)
      return { path: path, cableRoutes: finalCableRoutes, cost: distances[String(endId)] }
    }

    let potentialNeighborsWithType: Array<{
      id: string
      type: string
      fromPoi: POI
      toPoi: POI
      route?: string
    }> = []

    // Handle walkable connections
    const walkableToString = String(currentPOIObject.walkable_to || '').trim()
    const forceWalkableToString = String(currentPOIObject.force_walkable_to || '').trim()
    let hasExplicitWalkLinks = false

    if (walkableToString || forceWalkableToString) {
      hasExplicitWalkLinks = true
      ;(walkableToString + "," + forceWalkableToString).split(',').map(id => String(id).trim()).filter(id => id)
        .forEach(neighborId => {
          const nPoi = getPoi(neighborId)
          if ((nPoi as any)?.position) {
            if (options.mode === 'stay_in_area' && nPoi.area !== options.areaConstraint) return
            potentialNeighborsWithType.push({ 
              id: neighborId, 
              type: 'walk_explicit', 
              fromPoi: currentPOIObject, 
              toPoi: nPoi 
            })
          }
        })
    }

    if (!hasExplicitWalkLinks) {
      for (const p of allPoiData) {
        const pId = String((p as any).id)
        if (pId !== currentIdStr && (p as any).position) {
          const dist = calculateDistance((currentPOIObject as any).position, (p as any).position)
          if (dist < WALKING_THRESHOLD_PATH && areInSameArea(currentPOIObject, p)) {
            let pActualArea = p.area || (String((p as any).id) === USER_LOCATION_ID && (p as any).position ? findAreaForLocation((p as any).position) : null)
            if (options.mode === 'stay_in_area' && pActualArea !== options.areaConstraint) continue
            potentialNeighborsWithType.push({ 
              id: pId, 
              type: 'walk_implicit', 
              fromPoi: currentPOIObject, 
              toPoi: p 
            })
          }
        }
      }
    }

    // Handle cable car connections
    if ((currentPOIObject as any).type === 'transport') {
      for (const otherTransportPOI of allPoiData) {
        const otherTransportId = String(otherTransportPOI.id)
        if ((otherTransportPOI as any).type === 'transport' && otherTransportId !== currentIdStr) {
          const routes1 = String(currentPOIObject.cable_route || '').split(',').map(r => r.trim()).filter(r => r)
          const routes2 = String(otherTransportPOI.cable_route || '').split(',').map(r => r.trim()).filter(r => r)
          const commonRoutes = routes1.filter(r => routes2.includes(r))

          // Check operational status only when using cable car (not same area)
          const isCableCar = !areInSameArea(currentPOIObject, otherTransportPOI)
          let currentStatus = { operational: true }
          let otherStatus = { operational: true }
          if (isCableCar) {
            currentStatus = checkOperationalStatus(currentIdStr, operatingHours, now)
            otherStatus = checkOperationalStatus(otherTransportId, operatingHours, now)
            if (!currentStatus.operational || !otherStatus.operational) {
              continue // Skip if either station is not operational when using cable car
            }
          }

          // Check preferred route for cable car
          if (options.strictPreferredRoute && !hasUsedPreferredRoute) {
            if (commonRoutes.includes(options.strictPreferredRoute) &&
                (!isCableCar || (currentStatus.operational && otherStatus.operational))) {
              potentialNeighborsWithType.push({
                id: otherTransportId,
                type: 'transport_preferred',
                fromPoi: currentPOIObject,
                toPoi: otherTransportPOI,
                route: options.strictPreferredRoute
              })
            }
          } else {
            for (const route of commonRoutes) {
              if (!isCableCar || (currentStatus.operational && otherStatus.operational)) {
                let segmentType = 'transport_standard'
                if (route === options.strictPreferredRoute) {
                  segmentType = 'transport_preferred'
                }
                potentialNeighborsWithType.push({
                  id: otherTransportId,
                  type: segmentType,
                  fromPoi: currentPOIObject,
                  toPoi: otherTransportPOI,
                  route: route
                })
              }
            }
          }
        }
      }
    }

    // Sort neighbors by priority
    potentialNeighborsWithType.sort((a, b) => {
      const priority: Record<string, number> = {
        'transport_preferred': 1,
        'walk_explicit': 2,
        'transport_standard': 3,
        'walk_implicit': 4
      }
      return (priority[a.type] || 99) - (priority[b.type] || 99)
    })

    // Check cost - only consider cost after satisfying conditions above
    for (const neighborDetail of potentialNeighborsWithType) {
      const neighborId = neighborDetail.id
      const segmentCost = getSegmentCost(neighborDetail.fromPoi, neighborDetail.toPoi, neighborDetail.type, pathSoFarToCurrent, options)
      const newDistToNeighbor = distances[currentIdStr] + segmentCost

      if (newDistToNeighbor < distances[neighborId]) {
        distances[neighborId] = newDistToNeighbor
        previousNodes[neighborId] = currentIdStr
        pq.enqueue(neighborId, newDistToNeighbor)
      }
    }

    if (performance.now() - startTime > 15000) {
      console.error(`Dijkstra timeout (mode: ${options.mode}, start: ${startId}, end: ${endId}, current: ${currentIdStr})`)
      return { timedOut: true }
    }
  }
  return null
}

// Main pathfinding wrapper function
export const findPath = (startId: string, endId: string, allPoiData: POI[], currentLang: string = 'vi', operatingHours: OperatingHoursData[] = []): any => {
  const t = (key: string, ...args: any[]) => getUIText(key, currentLang, ...args)
  
  const getPoi = (id: string): POI | null => {
    return allPoiData.find(poi => String(poi.id) === String(id)) || null
  }

  const getPoiName = (poi: POI | null): string => {
    if (!poi) return ''
    if (String(poi.id) === USER_LOCATION_ID) {
      return t('yourLocation')
    }
    return poi.name || `POI ${poi.id}`
  }

  const startNodeObject = getPoi(startId)
  const endNodeObject = getPoi(endId)

  if (!startNodeObject || !(startNodeObject as any).position) {
    console.error(`Start POI ${startId} not found or has no position.`)
    alert(t('routeErrorStartNotFound', getPoiName(startNodeObject)))
    return null
  }
  if (!endNodeObject || !(endNodeObject as any).position) {
    console.error(`End POI ${endId} not found or has no position.`)
    alert(t('routeErrorEndNotFound', getPoiName(endNodeObject)))
    return null
  }

  const startArea = startNodeObject.area
  const endArea = endNodeObject.area

  // If same area, find route within that area
  if (startArea && endArea && startArea === endArea && String(startArea).trim() !== '') {
    let resultStayInArea = findPathDijkstraInternal(startId, endId, allPoiData, {
      mode: 'stay_in_area',
      areaConstraint: startArea
    }, operatingHours)
    if (resultStayInArea) {
      if (resultStayInArea.timedOut) {
        alert(t('routeErrorPathTimeout'))
        return null
      }
      return resultStayInArea
    }
  }

  // Handle inter-area movement
  let preferredRoute = null
  let fallbackRoute = null
  let alternativeRoute = null

  // Determine routes based on start and end areas
  if (startArea === 'Chùa Bà' && endArea === 'Đỉnh núi') {
    preferredRoute = CABLE_ROUTE_NAME_TAM_AN
    fallbackRoute = CABLE_ROUTE_NAME_CHUA_HANG
    alternativeRoute = CABLE_ROUTE_NAME_VAN_SON
  } else if (startArea === 'Chùa Bà' && endArea === 'Chân núi') {
    preferredRoute = CABLE_ROUTE_NAME_CHUA_HANG
    fallbackRoute = CABLE_ROUTE_NAME_TAM_AN
    alternativeRoute = CABLE_ROUTE_NAME_VAN_SON
  } else if (startArea === 'Chân núi' && endArea === 'Chùa Bà') {
    preferredRoute = CABLE_ROUTE_NAME_CHUA_HANG
    fallbackRoute = CABLE_ROUTE_NAME_VAN_SON
    alternativeRoute = CABLE_ROUTE_NAME_TAM_AN
  } else if (startArea === 'Chân núi' && endArea === 'Đỉnh núi') {
    preferredRoute = CABLE_ROUTE_NAME_VAN_SON
    fallbackRoute = CABLE_ROUTE_NAME_CHUA_HANG
    alternativeRoute = CABLE_ROUTE_NAME_TAM_AN
  } else if (startArea === 'Đỉnh núi' && endArea === 'Chân núi') {
    preferredRoute = CABLE_ROUTE_NAME_VAN_SON
    fallbackRoute = CABLE_ROUTE_NAME_TAM_AN
    alternativeRoute = CABLE_ROUTE_NAME_CHUA_HANG
  } else if (startArea === 'Đỉnh núi' && endArea === 'Chùa Bà') {
    preferredRoute = CABLE_ROUTE_NAME_TAM_AN
    fallbackRoute = CABLE_ROUTE_NAME_CHUA_HANG
    alternativeRoute = CABLE_ROUTE_NAME_VAN_SON
  }

  // Try to find route in priority order
  if (preferredRoute) {
    // 1. Try with preferred route
    const resultWithPreferred = findPathDijkstraInternal(startId, endId, allPoiData, {
      mode: 'standard',
      strictPreferredRoute: preferredRoute
    }, operatingHours)

    if (resultWithPreferred && !resultWithPreferred.timedOut) {
      return resultWithPreferred
    }

    // 2. Try with fallback route
    if (fallbackRoute) {
          const resultWithFallback = findPathDijkstraInternal(startId, endId, allPoiData, {
      mode: 'standard',
      strictPreferredRoute: fallbackRoute
    }, operatingHours)

      if (resultWithFallback && !resultWithFallback.timedOut) {
        return resultWithFallback
      }
    }

    // 3. Try with alternative route (via 2 routes)
    if (alternativeRoute) {
      // Find intermediate point based on alternative route
      let intermediateArea = null
      if (alternativeRoute === CABLE_ROUTE_NAME_TAM_AN) {
        intermediateArea = 'Chùa Bà'
      } else if (alternativeRoute === CABLE_ROUTE_NAME_VAN_SON) {
        intermediateArea = 'Đỉnh núi'
      } else if (alternativeRoute === CABLE_ROUTE_NAME_CHUA_HANG) {
        intermediateArea = 'Chân núi'
      }

      if (intermediateArea) {
        // Find intermediate points in that area
        const intermediatePOIs = allPoiData.filter(poi =>
          poi.area === intermediateArea &&
          (poi as any).type === 'transport' &&
          String(poi.cable_route || '').split(',').map(r => r.trim()).includes(alternativeRoute)
        )

        // Try to find route via each intermediate point
        for (const intermediatePOI of intermediatePOIs) {
          // Check if intermediate point is operational
          const intermediateStatus = checkOperationalStatus((intermediatePOI as any).id, operatingHours)
          if (!intermediateStatus.operational) continue

          // Find route from start to intermediate point
          const firstLeg = findPathDijkstraInternal(startId, (intermediatePOI as any).id, allPoiData, {
            mode: 'standard',
            strictPreferredRoute: alternativeRoute
          }, operatingHours)

          if (firstLeg && !firstLeg.timedOut) {
            // Find route from intermediate point to destination
            const secondLeg = findPathDijkstraInternal((intermediatePOI as any).id, endId, allPoiData, {
              mode: 'standard'
            }, operatingHours)

            if (secondLeg && !secondLeg.timedOut) {
              // Combine two route segments
              const combinedPath = [
                ...firstLeg.path,
                ...secondLeg.path.slice(1) // Skip duplicate intermediate point
              ]
              const combinedRoutes = [...new Set([...firstLeg.cableRoutes, ...secondLeg.cableRoutes])]
              return {
                path: combinedPath,
                cableRoutes: combinedRoutes,
                cost: firstLeg.cost + secondLeg.cost
              }
            }
          }
        }
      }
    }
  }

  // If no route found with preferred routes, find normal route
  return findPathDijkstraInternal(startId, endId, allPoiData, {
    mode: 'standard'
  }, operatingHours)
}

// Function to calculate cable routes used in a path
export const calculateCableRoutesForPath = (path: string[], allPoiData: POI[]): string[] => {
  const cableRoutesUsed = new Set<string>()
  if (!path || path.length < 2) return []

  const getPoi = (id: string): POI | null => {
    return allPoiData.find(poi => String(poi.id) === String(id)) || null
  }

  for (let i = 0; i < path.length - 1; i++) {
    const startP = getPoi(String(path[i]))
    const endP = getPoi(String(path[i + 1]))
    if ((startP as any)?.type === 'transport' && (endP as any)?.type === 'transport' && areOnSameCableRoute(startP, endP)) {
      const startRoutes = String(startP.cable_route || '').split(',').map(r => r.trim()).filter(r => r)
      const endRoutes = String(endP.cable_route || '').split(',').map(r => r.trim()).filter(r => r)
      const commonRoute = startRoutes.find(r => endRoutes.includes(r))
      if (commonRoute) cableRoutesUsed.add(commonRoute)
    }
  }
  return Array.from(cableRoutesUsed)
}

// Function to check cable stations operational status
export const checkCableStationsOperational = (operatingHours: OperatingHoursData[]): {
  chuaHangOperational: boolean
  hoaDongOperational: boolean
  coasterOperational: boolean
  chuaHangMessage: string
  hoaDongMessage: string
  coasterMessage: string
} => {
  const now = new Date()
  const chuaHangStatus = checkOperationalStatus(CABLE_STATION_CHUA_HANG_ID, operatingHours, now)
  const hoaDongStatus = checkOperationalStatus(CABLE_STATION_HOA_DONG_ID, operatingHours, now)
  const coasterStatus = checkOperationalStatus(COASTER_START_ID, operatingHours, now)

  return {
    chuaHangOperational: chuaHangStatus.operational,
    hoaDongOperational: hoaDongStatus.operational,
    coasterOperational: coasterStatus.operational,
    chuaHangMessage: chuaHangStatus.message,
    hoaDongMessage: hoaDongStatus.message,
    coasterMessage: coasterStatus.message
  }
}

// Function to check descent options from Chua Ba area
export const checkDescentOptionsFromChuaBa = (operatingHours: OperatingHoursData[] = []): {
  allClosed: boolean
  bothCableAndCoaster: boolean
  onlyCoaster: boolean
  onlyCable: boolean
  popupAvailable: boolean
  chuaHangActive: boolean
  hoaDongActive: boolean
  coasterActive: boolean
  chuaHangMessage: string
  hoaDongMessage: string
  coasterMessage: string
} => {
  const now = new Date()
  console.log('DEBUG: checkDescentOptionsFromChuaBa - Current time:', now.toLocaleString())
  
  const chuaHangStatus = checkOperationalStatus('23', operatingHours, now) // Ga Chùa Hang
  const hoaDongStatus = checkOperationalStatus('33', operatingHours, now)   // Ga Hòa Đồng  
  const coasterStatus = checkOperationalStatus('24', operatingHours, now)   // Ga Máng trượt

  console.log('DEBUG: Chua Hang status:', chuaHangStatus)
  console.log('DEBUG: Hoa Dong status:', hoaDongStatus)
  console.log('DEBUG: Coaster status:', coasterStatus)

  const chuaHangActive = chuaHangStatus.operational
  const hoaDongActive = hoaDongStatus.operational
  const coasterActive = coasterStatus.operational
  const anyCableOperational = chuaHangActive || hoaDongActive

  console.log('DEBUG: chuaHangActive:', chuaHangActive)
  console.log('DEBUG: hoaDongActive:', hoaDongActive)
  console.log('DEBUG: coasterActive:', coasterActive)
  console.log('DEBUG: anyCableOperational:', anyCableOperational)

  const result = {
    allClosed: !chuaHangActive && !hoaDongActive && !coasterActive,
    bothCableAndCoaster: anyCableOperational && coasterActive,
    onlyCoaster: !anyCableOperational && coasterActive,
    onlyCable: anyCableOperational && !coasterActive,
    popupAvailable: anyCableOperational && coasterActive,
    chuaHangActive,
    hoaDongActive,
    coasterActive,
    chuaHangMessage: chuaHangStatus.message,
    hoaDongMessage: hoaDongStatus.message,
    coasterMessage: coasterStatus.message
  }
  
  console.log('DEBUG: Final result:', result)
  return result
}

// Function to handle descent choice selection
export const handleDescentChoice = (
  choice: 'cable_car' | 'alpine_coaster', 
  routeResult: any, 
  source: string
): any => {
  if (choice === 'cable_car') {
    // Handle cable car descent logic
    console.log('Cable car descent selected')
    return routeResult
  } else if (choice === 'alpine_coaster') {
    // Handle alpine coaster descent logic
    console.log('Alpine coaster descent selected')
    return routeResult
  }
  return routeResult
}
