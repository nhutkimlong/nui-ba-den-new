import { useState, useEffect, useCallback, useMemo } from 'react'
import { POI, OperatingHoursData } from '@/types'
import { 
  fetchPOIData, 
  fetchOperatingHours, 
  getUIText, 
  getPoiName,
  getPoiDescription,
  checkOperationalStatus,
  addToSearchHistory,
  getSearchHistory,
  USER_LOCATION_ID,
  POI_CATEGORIES,
  findPath
} from '@/services/mapService'

interface UseMapReturn {
  // Data
  poiData: POI[]
  operatingHours: OperatingHoursData[]
  filteredPOIs: POI[]
  
  // State
  loading: boolean
  error: string | null
  searchTerm: string
  activeCategory: string | null
  currentLang: string
  userLocation: [number, number] | null
  
  // Actions
  setSearchTerm: (term: string) => void
  setActiveCategory: (category: string | null) => void
  setCurrentLang: (lang: string) => void
  setUserLocation: (location: [number, number] | null) => void
  searchPOIs: (term: string) => POI[]
  getPOIById: (id: string) => POI | null
  getPOIStatus: (poiId: string) => { operational: boolean; message: string }
  addToHistory: (term: string) => void
  getHistory: () => string[]
}

export const useMap = (): UseMapReturn => {
  // Data state
  const [poiData, setPoiData] = useState<POI[]>([])
  const [operatingHours, setOperatingHours] = useState<OperatingHoursData[]>([])
  
  // UI state
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [activeCategory, setActiveCategory] = useState<string | null>(null)
  const [currentLang, setCurrentLang] = useState('vi')
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null)
  
  // Add a flag to track if data has been loaded at least once
  const [hasLoadedOnce, setHasLoadedOnce] = useState(false)

  // Load data on mount
  useEffect(() => {
    const loadData = async () => {
      try {
        // Only show loading if this is the first load
        if (!hasLoadedOnce) {
          setLoading(true)
        }
        setError(null)
        
        // Load POI data and operating hours in parallel
        const [poiDataResult, operatingHoursResult] = await Promise.all([
          fetchPOIData(),
          fetchOperatingHours()
        ])
        
        setPoiData(poiDataResult)
        setOperatingHours(operatingHoursResult)
        setHasLoadedOnce(true)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load data')
        console.error('Error loading map data:', err)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [hasLoadedOnce])

  // Filter POIs based on search term and category
  const filteredPOIs = useMemo(() => {
    let filtered = poiData

    // Filter by category
    if (activeCategory) {
      filtered = filtered.filter(poi => poi.category === activeCategory)
    }

    // Filter by search term
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase().trim()
      filtered = filtered.filter(poi => {
        const nameVi = (poi.name || '').toLowerCase()
        const nameEn = (poi.name_en || '').toLowerCase()
        return nameVi.includes(term) || nameEn.includes(term)
      })
    }

    return filtered
  }, [poiData, activeCategory, searchTerm])

  // Search POIs
  const searchPOIs = useCallback((term: string): POI[] => {
    if (!term.trim()) return []
    
    const searchTerm = term.toLowerCase().trim()
    return poiData.filter(poi => {
      const nameVi = (poi.name || '').toLowerCase()
      const nameEn = (poi.name_en || '').toLowerCase()
      return nameVi.includes(searchTerm) || nameEn.includes(searchTerm)
    })
  }, [poiData])

  // Get POI by ID
  const getPOIById = useCallback((id: string): POI | null => {
    if (id === USER_LOCATION_ID) {
      if (!userLocation) return null
      return {
        id: -1, // Use -1 for user location
        name: getUIText('yourLocation', currentLang),
        latitude: userLocation[0],
        longitude: userLocation[1],
        category: 'user_location',
        area: 'user_area'
      }
    }
    
    return poiData.find(poi => String(poi.id) === String(id)) || null
  }, [poiData, userLocation, currentLang])

  // Get POI operational status
  const getPOIStatus = useCallback((poiId: string) => {
    return checkOperationalStatus(poiId, operatingHours)
  }, [operatingHours])

  // Add to search history
  const addToHistory = useCallback((term: string) => {
    addToSearchHistory(term)
  }, [])

  // Get search history
  const getHistory = useCallback(() => {
    return getSearchHistory()
  }, [])

  return {
    // Data
    poiData,
    operatingHours,
    filteredPOIs,
    
    // State
    loading,
    error,
    searchTerm,
    activeCategory,
    currentLang,
    userLocation,
    
    // Actions
    setSearchTerm,
    setActiveCategory,
    setCurrentLang,
    setUserLocation,
    searchPOIs,
    getPOIById,
    getPOIStatus,
    addToHistory,
    getHistory
  }
}

// Hook for map controls
export const useMapControls = () => {
  const [isTopBarVisible, setIsTopBarVisible] = useState(true)
  const [isRouteInputsVisible, setIsRouteInputsVisible] = useState(false)
  const [isTutorialOpen, setIsTutorialOpen] = useState(false)
  const [isContactOpen, setIsContactOpen] = useState(false)
  const [isDescentChoiceOpen, setIsDescentChoiceOpen] = useState(false)

  const toggleTopBar = useCallback(() => {
    setIsTopBarVisible(!isTopBarVisible)
  }, [isTopBarVisible])

  const toggleRouteInputs = useCallback(() => {
    setIsRouteInputsVisible(!isRouteInputsVisible)
    // When opening route inputs (was false -> true), hide top bar.
    // When closing route inputs (was true -> false), show top bar.
    setIsTopBarVisible(isRouteInputsVisible)
  }, [isRouteInputsVisible])

  const openTutorial = useCallback(() => {
    setIsTutorialOpen(true)
  }, [])

  const closeTutorial = useCallback(() => {
    setIsTutorialOpen(false)
  }, [])

  const openContact = useCallback(() => {
    setIsContactOpen(true)
  }, [])

  const closeContact = useCallback(() => {
    setIsContactOpen(false)
  }, [])

  const openDescentChoice = useCallback(() => {
    setIsDescentChoiceOpen(true)
  }, [])

  const closeDescentChoice = useCallback(() => {
    setIsDescentChoiceOpen(false)
  }, [])

  return {
    // State
    isTopBarVisible,
    isRouteInputsVisible,
    isTutorialOpen,
    isContactOpen,
    isDescentChoiceOpen,
    
    // Actions
    toggleTopBar,
    toggleRouteInputs,
    openTutorial,
    closeTutorial,
    openContact,
    closeContact,
    openDescentChoice,
    closeDescentChoice
  }
}

// Hook for route finding
export const useRouteFinding = (poiData: POI[], operatingHours: OperatingHoursData[]) => {
  const [startPOI, setStartPOI] = useState<POI | null>(null)
  const [endPOI, setEndPOI] = useState<POI | null>(null)
  const [currentRoute, setCurrentRoute] = useState<any>(null)
  const [routeLoading, setRouteLoading] = useState(false)
  const [routeError, setRouteError] = useState<string | null>(null)
  const [currentLang, setCurrentLang] = useState('vi')

  const findRoute = useCallback(async (startId: string, endId: string) => {
    if (!startId || !endId) {
      setRouteError('Please select start and end points')
      return null
    }

    const start = poiData.find(poi => String(poi.id) === String(startId))
    const end = poiData.find(poi => String(poi.id) === String(endId))

    if (!start || !end) {
      setRouteError('Start or end point not found')
      return null
    }

    if (start.id === end.id) {
      setRouteError('Start and end points are the same')
      return null
    }

    setRouteLoading(true)
    setRouteError(null)

    try {
      // Use the complete route finding algorithm from mapService
      const route = findPath(startId, endId, poiData, currentLang, operatingHours)
      
      if (!route) {
        setRouteError('No route found')
        return null
      }

      if (route.timedOut) {
        setRouteError('Route calculation timed out')
        return null
      }
      
      setCurrentRoute(route)
      return route
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to find route'
      setRouteError(errorMessage)
      return null
    } finally {
      setRouteLoading(false)
    }
  }, [poiData, currentLang])

  const clearRoute = useCallback(() => {
    setCurrentRoute(null)
    setRouteError(null)
  }, [])

  const setLanguage = useCallback((lang: string) => {
    setCurrentLang(lang)
  }, [])

  return {
    // State
    startPOI,
    endPOI,
    currentRoute,
    routeLoading,
    routeError,
    currentLang,
    
    // Actions
    setStartPOI,
    setEndPOI,
    setCurrentRoute,
    findRoute,
    clearRoute,
    setLanguage
  }
}

// Hook for geolocation
export const useGeolocation = () => {
  const [location, setLocation] = useState<[number, number] | null>(null)
  const [locationError, setLocationError] = useState<string | null>(null)
  const [locationLoading, setLocationLoading] = useState(false)

  const getCurrentLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setLocationError('Geolocation is not supported by this browser')
      return
    }

    setLocationLoading(true)
    setLocationError(null)

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords
        setLocation([latitude, longitude])
        setLocationLoading(false)
      },
      (error) => {
        let errorMessage = 'Failed to get location'
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = 'Location permission denied'
            break
          case error.POSITION_UNAVAILABLE:
            errorMessage = 'Location information unavailable'
            break
          case error.TIMEOUT:
            errorMessage = 'Location request timed out'
            break
        }
        setLocationError(errorMessage)
        setLocationLoading(false)
      },
      {
        enableHighAccuracy: true,
        timeout: 20000,
        maximumAge: 0
      }
    )
  }, [])

  return {
    location,
    locationError,
    locationLoading,
    getCurrentLocation
  }
}
