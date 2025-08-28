import { useState, useEffect, useCallback, useMemo } from 'react'
import { useUserPreferences } from './useUserPreferences'

interface POI {
  id: string
  name: string
  category: string
  rating: number
  visitCount: number
  location: [number, number]
  tags: string[]
  priceRange: 'low' | 'medium' | 'high'
  crowdLevel: 'low' | 'medium' | 'high'
  weatherDependent: boolean
}

interface UserBehavior {
  visitedPOIs: string[]
  searchHistory: string[]
  favoriteCategories: string[]
  preferredPriceRange: 'low' | 'medium' | 'high'
  preferredCrowdLevel: 'low' | 'medium' | 'high'
  visitTime: 'morning' | 'afternoon' | 'evening' | 'night'
  weatherPreference: 'sunny' | 'rainy' | 'cloudy' | 'any'
}

interface Recommendation {
  poi: POI
  score: number
  reason: string
  type: 'personalized' | 'popular' | 'trending' | 'nearby' | 'weather'
}

export const useRecommendations = (userLocation?: [number, number]) => {
  const [recommendations, setRecommendations] = useState<Recommendation[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const { preferences } = useUserPreferences()

  // Mock POI data - in real app, this would come from API
  const allPOIs: POI[] = useMemo(() => [
    {
      id: '1',
      name: 'Chùa Bà Đen',
      category: 'religious',
      rating: 4.8,
      visitCount: 15000,
      location: [11.3167, 106.1167],
      tags: ['temple', 'spiritual', 'historical'],
      priceRange: 'low',
      crowdLevel: 'high',
      weatherDependent: false
    },
    {
      id: '2',
      name: 'Cáp treo Núi Bà Đen',
      category: 'transport',
      rating: 4.5,
      visitCount: 12000,
      location: [11.3180, 106.1180],
      tags: ['cable-car', 'view', 'adventure'],
      priceRange: 'medium',
      crowdLevel: 'medium',
      weatherDependent: true
    },
    {
      id: '3',
      name: 'Nhà hàng Đặc sản',
      category: 'restaurant',
      rating: 4.2,
      visitCount: 8000,
      location: [11.3150, 106.1150],
      tags: ['local-food', 'traditional'],
      priceRange: 'medium',
      crowdLevel: 'medium',
      weatherDependent: false
    },
    {
      id: '4',
      name: 'Khách sạn Núi Bà',
      category: 'accommodation',
      rating: 4.0,
      visitCount: 5000,
      location: [11.3140, 106.1140],
      tags: ['hotel', 'comfortable'],
      priceRange: 'high',
      crowdLevel: 'low',
      weatherDependent: false
    }
  ], [])

  // Calculate distance between two points
  const calculateDistance = useCallback((lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371 // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180
    const dLon = (lon2 - lon1) * Math.PI / 180
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLon/2) * Math.sin(dLon/2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
    return R * c
  }, [])

  // Get current weather (mock)
  const getCurrentWeather = useCallback(() => {
    // In real app, this would call weather API
    return {
      condition: 'sunny' as const,
      temperature: 28,
      humidity: 70
    }
  }, [])

  // Get current time period
  const getCurrentTimePeriod = useCallback(() => {
    const hour = new Date().getHours()
    if (hour >= 6 && hour < 12) return 'morning'
    if (hour >= 12 && hour < 17) return 'afternoon'
    if (hour >= 17 && hour < 21) return 'evening'
    return 'night'
  }, [])

  // Generate personalized recommendations
  const generateRecommendations = useCallback(async () => {
    setIsLoading(true)
    
    try {
      const weather = getCurrentWeather()
      const timePeriod = getCurrentTimePeriod()
      const userBehavior: UserBehavior = {
        visitedPOIs: JSON.parse(localStorage.getItem('visitedPOIs') || '[]'),
        searchHistory: JSON.parse(localStorage.getItem('searchHistory') || '[]'),
        favoriteCategories: JSON.parse(localStorage.getItem('favoriteCategories') || '[]'),
        preferredPriceRange: preferences.content.showPrices ? 'medium' : 'low',
        preferredCrowdLevel: 'medium',
        visitTime: timePeriod,
        weatherPreference: weather.condition
      }

      const recommendations: Recommendation[] = []

      // Personalized recommendations based on user behavior
      allPOIs.forEach(poi => {
        let score = 0
        let reasons: string[] = []

        // Category preference
        if (userBehavior.favoriteCategories.includes(poi.category)) {
          score += 30
          reasons.push('Phù hợp với sở thích của bạn')
        }

        // Price preference
        if (poi.priceRange === userBehavior.preferredPriceRange) {
          score += 20
          reasons.push('Phù hợp với ngân sách')
        }

        // Crowd level preference
        if (poi.crowdLevel === userBehavior.preferredCrowdLevel) {
          score += 15
          reasons.push('Mức độ đông đúc phù hợp')
        }

        // Weather consideration
        if (!poi.weatherDependent || weather.condition === 'sunny') {
          score += 10
          reasons.push('Thời tiết thuận lợi')
        }

        // Distance consideration
        if (userLocation) {
          const distance = calculateDistance(
            userLocation[0], userLocation[1],
            poi.location[0], poi.location[1]
          )
          if (distance < 5) {
            score += 25
            reasons.push('Gần vị trí hiện tại')
          } else if (distance < 10) {
            score += 15
            reasons.push('Khoảng cách hợp lý')
          }
        }

        // Rating consideration
        if (poi.rating >= 4.5) {
          score += 20
          reasons.push('Đánh giá cao từ cộng đồng')
        } else if (poi.rating >= 4.0) {
          score += 10
          reasons.push('Đánh giá tốt')
        }

        // Time-based recommendations
        if (timePeriod === 'morning' && poi.category === 'religious') {
          score += 15
          reasons.push('Lý tưởng cho buổi sáng')
        }

        if (timePeriod === 'afternoon' && poi.category === 'restaurant') {
          score += 15
          reasons.push('Thời điểm tốt để ăn trưa')
        }

        if (score > 0) {
          recommendations.push({
            poi,
            score,
            reason: reasons.join(', '),
            type: 'personalized'
          })
        }
      })

      // Add popular recommendations
      const popularPOIs = allPOIs
        .sort((a, b) => b.visitCount - a.visitCount)
        .slice(0, 3)
        .map(poi => ({
          poi,
          score: poi.visitCount / 1000,
          reason: 'Địa điểm nổi tiếng',
          type: 'popular' as const
        }))

      // Add nearby recommendations
      const nearbyPOIs = userLocation ? allPOIs
        .map(poi => ({
          poi,
          distance: calculateDistance(
            userLocation[0], userLocation[1],
            poi.location[0], poi.location[1]
          )
        }))
        .filter(item => item.distance < 10)
        .sort((a, b) => a.distance - b.distance)
        .slice(0, 3)
        .map(item => ({
          poi: item.poi,
          score: 100 - item.distance * 10,
          reason: `Cách ${item.distance.toFixed(1)}km`,
          type: 'nearby' as const
        })) : []

      // Combine and sort all recommendations
      const allRecommendations = [
        ...recommendations,
        ...popularPOIs,
        ...nearbyPOIs
      ].sort((a, b) => b.score - a.score)

      // Remove duplicates and limit to top 10
      const uniqueRecommendations = allRecommendations
        .filter((rec, index, arr) => 
          arr.findIndex(r => r.poi.id === rec.poi.id) === index
        )
        .slice(0, 10)

      setRecommendations(uniqueRecommendations)
    } catch (error) {
      console.error('Failed to generate recommendations:', error)
    } finally {
      setIsLoading(false)
    }
  }, [allPOIs, userLocation, preferences, calculateDistance, getCurrentWeather, getCurrentTimePeriod])

  // Track user behavior
  const trackVisit = useCallback((poiId: string) => {
    const visited = JSON.parse(localStorage.getItem('visitedPOIs') || '[]')
    if (!visited.includes(poiId)) {
      visited.push(poiId)
      localStorage.setItem('visitedPOIs', JSON.stringify(visited))
    }
  }, [])

  const trackSearch = useCallback((query: string) => {
    const history = JSON.parse(localStorage.getItem('searchHistory') || '[]')
    history.unshift(query)
    // Keep only last 20 searches
    const uniqueHistory = [...new Set(history)].slice(0, 20)
    localStorage.setItem('searchHistory', JSON.stringify(uniqueHistory))
  }, [])

  const trackFavorite = useCallback((category: string) => {
    const favorites = JSON.parse(localStorage.getItem('favoriteCategories') || '[]')
    if (!favorites.includes(category)) {
      favorites.push(category)
      localStorage.setItem('favoriteCategories', JSON.stringify(favorites))
    }
  }, [])

  // Generate recommendations on mount and when dependencies change
  useEffect(() => {
    generateRecommendations()
  }, [generateRecommendations])

  return {
    recommendations,
    isLoading,
    generateRecommendations,
    trackVisit,
    trackSearch,
    trackFavorite
  }
}
