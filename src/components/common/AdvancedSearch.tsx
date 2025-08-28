import React, { useState, useCallback, useRef, useEffect } from 'react'
import { Search, Mic, MicOff, Filter, X, MapPin, Star, Clock, DollarSign } from 'lucide-react'
import { cn } from '@/utils/cn'
import { useHapticFeedback } from '@/hooks/useHapticFeedback'
import { useVoiceNavigation, useVoiceFeedback } from '@/hooks/useVoiceNavigation'

interface SearchFilter {
  category: string[]
  rating: number
  priceRange: 'low' | 'medium' | 'high' | 'all'
  distance: number
  openNow: boolean
  features: string[]
}

interface SearchResult {
  id: string
  name: string
  category: string
  rating: number
  priceRange: 'low' | 'medium' | 'high'
  distance: number
  isOpen: boolean
  features: string[]
  location: [number, number]
}

interface AdvancedSearchProps {
  onSearch: (query: string, filters: SearchFilter) => void
  onResultSelect: (result: SearchResult) => void
  placeholder?: string
  className?: string
  showFilters?: boolean
  showVoice?: boolean
  results?: SearchResult[]
  isLoading?: boolean
}

const AdvancedSearch: React.FC<AdvancedSearchProps> = ({
  onSearch,
  onResultSelect,
  placeholder = 'Tìm kiếm địa điểm...',
  className,
  showFilters = true,
  showVoice = true,
  results = [],
  isLoading = false
}) => {
  const [query, setQuery] = useState('')
  const [isExpanded, setIsExpanded] = useState(false)
  const [showResults, setShowResults] = useState(false)
  const [filters, setFilters] = useState<SearchFilter>({
    category: [],
    rating: 0,
    priceRange: 'all',
    distance: 10,
    openNow: false,
    features: []
  })

  const inputRef = useRef<HTMLInputElement>(null)
  const resultsRef = useRef<HTMLDivElement>(null)
  const haptic = useHapticFeedback()
  const voiceNav = useVoiceNavigation()
  const voiceFeedback = useVoiceFeedback()

  // Categories for filtering
  const categories = [
    { id: 'religious', name: 'Tâm linh', icon: '🕍' },
    { id: 'restaurant', name: 'Nhà hàng', icon: '🍽️' },
    { id: 'hotel', name: 'Khách sạn', icon: '🏨' },
    { id: 'transport', name: 'Giao thông', icon: '🚠' },
    { id: 'entertainment', name: 'Giải trí', icon: '🎢' },
    { id: 'shopping', name: 'Mua sắm', icon: '🛍️' }
  ]

  // Features for filtering
  const features = [
    { id: 'parking', name: 'Bãi đỗ xe', icon: '🅿️' },
    { id: 'wifi', name: 'WiFi', icon: '📶' },
    { id: 'accessible', name: 'Thân thiện người khuyết tật', icon: '♿' },
    { id: 'family', name: 'Thân thiện gia đình', icon: '👨‍👩‍👧‍👦' },
    { id: 'pet', name: 'Cho phép thú cưng', icon: '🐕' }
  ]

  // Handle search input
  const handleSearch = useCallback((searchQuery: string) => {
    setQuery(searchQuery)
    onSearch(searchQuery, filters)
    setShowResults(true)
    haptic.light()
  }, [onSearch, filters, haptic])

  // Handle filter changes
  const handleFilterChange = useCallback((key: keyof SearchFilter, value: any) => {
    const newFilters = { ...filters, [key]: value }
    setFilters(newFilters)
    onSearch(query, newFilters)
    haptic.light()
  }, [filters, query, onSearch, haptic])

  // Toggle category filter
  const toggleCategory = useCallback((category: string) => {
    const newCategories = filters.category.includes(category)
      ? filters.category.filter(c => c !== category)
      : [...filters.category, category]
    handleFilterChange('category', newCategories)
  }, [filters.category, handleFilterChange])

  // Toggle feature filter
  const toggleFeature = useCallback((feature: string) => {
    const newFeatures = filters.features.includes(feature)
      ? filters.features.filter(f => f !== feature)
      : [...filters.features, feature]
    handleFilterChange('features', newFeatures)
  }, [filters.features, handleFilterChange])

  // Handle voice input
  const handleVoiceInput = useCallback(() => {
    if (voiceNav.isListening) {
      voiceNav.stopListening()
      haptic.medium()
    } else {
      voiceNav.startListening()
      haptic.medium()
      voiceFeedback.speak('Bắt đầu nhận diện giọng nói')
    }
  }, [voiceNav, haptic, voiceFeedback])

  // Handle result selection
  const handleResultSelect = useCallback((result: SearchResult) => {
    onResultSelect(result)
    setShowResults(false)
    setQuery(result.name)
    haptic.success()
    voiceFeedback.announceAction(`chọn ${result.name}`)
  }, [onResultSelect, haptic, voiceFeedback])

  // Clear search
  const clearSearch = useCallback(() => {
    setQuery('')
    setShowResults(false)
    setFilters({
      category: [],
      rating: 0,
      priceRange: 'all',
      distance: 10,
      openNow: false,
      features: []
    })
    haptic.light()
    inputRef.current?.focus()
  }, [haptic])

  // Handle voice transcript
  useEffect(() => {
    if (voiceNav.transcript && !voiceNav.isListening) {
      setQuery(voiceNav.transcript)
      handleSearch(voiceNav.transcript)
      voiceNav.clearTranscript()
    }
  }, [voiceNav.transcript, voiceNav.isListening, handleSearch, voiceNav])

  // Close results when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (resultsRef.current && !resultsRef.current.contains(event.target as Node)) {
        setShowResults(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div className={cn('relative w-full', className)} ref={resultsRef}>
      {/* Search Input */}
      <div className="relative">
        <div className="flex items-center bg-white border border-gray-300 rounded-lg shadow-sm focus-within:ring-2 focus-within:ring-primary-500 focus-within:border-primary-500">
          <div className="pl-3 pr-2">
            <Search className="w-5 h-5 text-gray-400" />
          </div>
          
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder={placeholder}
            className="flex-1 py-3 px-2 text-sm focus:outline-none"
          />
          
          {query && (
            <button
              onClick={clearSearch}
              className="p-2 text-gray-400 hover:text-gray-600"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          
          {showVoice && (
            <button
              onClick={handleVoiceInput}
              className={cn(
                'p-2 transition-colors',
                voiceNav.isListening 
                  ? 'text-red-500 animate-pulse' 
                  : 'text-gray-400 hover:text-gray-600'
              )}
            >
              {voiceNav.isListening ? (
                <MicOff className="w-4 h-4" />
              ) : (
                <Mic className="w-4 h-4" />
              )}
            </button>
          )}
          
          {showFilters && (
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className={cn(
                'p-2 transition-colors',
                isExpanded 
                  ? 'text-primary-500' 
                  : 'text-gray-400 hover:text-gray-600'
              )}
            >
              <Filter className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Voice Status */}
      {voiceNav.isListening && (
        <div className="absolute top-full left-0 right-0 mt-1 p-2 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-700">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
            Đang nghe: {voiceNav.transcript || '...'}
          </div>
        </div>
      )}

      {/* Filters Panel */}
      {isExpanded && showFilters && (
        <div className="absolute top-full left-0 right-0 mt-1 p-4 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
          <div className="space-y-4">
            {/* Categories */}
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2">Danh mục</h4>
              <div className="grid grid-cols-2 gap-2">
                {categories.map(category => (
                  <button
                    key={category.id}
                    onClick={() => toggleCategory(category.id)}
                    className={cn(
                      'flex items-center gap-2 p-2 rounded-lg text-sm transition-colors',
                      filters.category.includes(category.id)
                        ? 'bg-primary-100 text-primary-700'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    )}
                  >
                    <span>{category.icon}</span>
                    <span>{category.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Rating */}
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2">
                Đánh giá tối thiểu: {filters.rating > 0 ? `${filters.rating}+` : 'Tất cả'}
              </h4>
              <div className="flex items-center gap-2">
                {[0, 3, 3.5, 4, 4.5].map(rating => (
                  <button
                    key={rating}
                    onClick={() => handleFilterChange('rating', rating)}
                    className={cn(
                      'flex items-center gap-1 px-3 py-1 rounded-full text-sm transition-colors',
                      filters.rating === rating
                        ? 'bg-primary-100 text-primary-700'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    )}
                  >
                    {rating > 0 && <Star className="w-3 h-3 fill-current" />}
                    <span>{rating > 0 ? rating : 'Tất cả'}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Price Range */}
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2">Mức giá</h4>
              <div className="flex items-center gap-2">
                {[
                  { value: 'all', label: 'Tất cả', icon: '💰' },
                  { value: 'low', label: 'Thấp', icon: '💵' },
                  { value: 'medium', label: 'Trung bình', icon: '💵💵' },
                  { value: 'high', label: 'Cao', icon: '💵💵💵' }
                ].map(price => (
                  <button
                    key={price.value}
                    onClick={() => handleFilterChange('priceRange', price.value)}
                    className={cn(
                      'flex items-center gap-1 px-3 py-1 rounded-full text-sm transition-colors',
                      filters.priceRange === price.value
                        ? 'bg-primary-100 text-primary-700'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    )}
                  >
                    <span>{price.icon}</span>
                    <span>{price.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Distance */}
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2">
                Khoảng cách: {filters.distance}km
              </h4>
              <input
                type="range"
                min="1"
                max="50"
                value={filters.distance}
                onChange={(e) => handleFilterChange('distance', parseInt(e.target.value))}
                className="w-full"
              />
            </div>

            {/* Features */}
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2">Tính năng</h4>
              <div className="grid grid-cols-2 gap-2">
                {features.map(feature => (
                  <button
                    key={feature.id}
                    onClick={() => toggleFeature(feature.id)}
                    className={cn(
                      'flex items-center gap-2 p-2 rounded-lg text-sm transition-colors',
                      filters.features.includes(feature.id)
                        ? 'bg-primary-100 text-primary-700'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    )}
                  >
                    <span>{feature.icon}</span>
                    <span>{feature.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Open Now */}
            <div>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={filters.openNow}
                  onChange={(e) => handleFilterChange('openNow', e.target.checked)}
                  className="rounded"
                />
                <span className="text-sm text-gray-700">Chỉ hiển thị đang mở cửa</span>
              </label>
            </div>
          </div>
        </div>
      )}

      {/* Search Results */}
      {showResults && (results.length > 0 || isLoading) && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto">
          {isLoading ? (
            <div className="p-4 text-center text-gray-500">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-500 mx-auto mb-2" />
              Đang tìm kiếm...
            </div>
          ) : (
            <div className="py-2">
              {results.map((result) => (
                <button
                  key={result.id}
                  onClick={() => handleResultSelect(result)}
                  className="w-full p-3 text-left hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-b-0"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">{result.name}</h4>
                      <p className="text-sm text-gray-600">{result.category}</p>
                      <div className="flex items-center gap-4 mt-1 text-xs text-gray-500">
                        <div className="flex items-center gap-1">
                          <Star className="w-3 h-3 fill-current text-yellow-400" />
                          <span>{result.rating}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          <span>{result.distance.toFixed(1)}km</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <DollarSign className="w-3 h-3" />
                          <span>{result.priceRange}</span>
                        </div>
                        {result.isOpen && (
                          <div className="flex items-center gap-1 text-green-600">
                            <Clock className="w-3 h-3" />
                            <span>Mở cửa</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default AdvancedSearch
