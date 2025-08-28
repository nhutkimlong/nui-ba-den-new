import { useState, useEffect, useCallback } from 'react'

interface UserPreferences {
  language: 'vi' | 'en'
  theme: 'light' | 'dark' | 'auto'
  notifications: {
    enabled: boolean
    weather: boolean
    events: boolean
    updates: boolean
  }
  accessibility: {
    highContrast: boolean
    largeText: boolean
    reducedMotion: boolean
    voiceNavigation: boolean
  }
  map: {
    defaultZoom: number
    showTraffic: boolean
    showTransit: boolean
    preferredTransport: 'walking' | 'driving' | 'transit'
  }
  content: {
    showImages: boolean
    autoPlayVideos: boolean
    showReviews: boolean
    showPrices: boolean
  }
  privacy: {
    locationSharing: boolean
    analytics: boolean
    personalizedAds: boolean
  }
}

const DEFAULT_PREFERENCES: UserPreferences = {
  language: 'vi',
  theme: 'auto',
  notifications: {
    enabled: true,
    weather: true,
    events: true,
    updates: true
  },
  accessibility: {
    highContrast: false,
    largeText: false,
    reducedMotion: false,
    voiceNavigation: false
  },
  map: {
    defaultZoom: 14,
    showTraffic: true,
    showTransit: true,
    preferredTransport: 'walking'
  },
  content: {
    showImages: true,
    autoPlayVideos: false,
    showReviews: true,
    showPrices: true
  },
  privacy: {
    locationSharing: true,
    analytics: true,
    personalizedAds: false
  }
}

export const useUserPreferences = () => {
  const [preferences, setPreferences] = useState<UserPreferences>(DEFAULT_PREFERENCES)
  const [isLoading, setIsLoading] = useState(true)

  // Load preferences from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem('userPreferences')
      if (stored) {
        const parsed = JSON.parse(stored)
        setPreferences({ ...DEFAULT_PREFERENCES, ...parsed })
      }
    } catch (error) {
      console.error('Failed to load user preferences:', error)
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Save preferences to localStorage
  const savePreferences = useCallback((newPreferences: Partial<UserPreferences>) => {
    const updated = { ...preferences, ...newPreferences }
    setPreferences(updated)
    
    try {
      localStorage.setItem('userPreferences', JSON.stringify(updated))
    } catch (error) {
      console.error('Failed to save user preferences:', error)
    }
  }, [preferences])

  // Update specific preference
  const updatePreference = useCallback(<K extends keyof UserPreferences>(
    key: K,
    value: UserPreferences[K]
  ) => {
    savePreferences({ [key]: value })
  }, [savePreferences])

  // Update nested preference
  const updateNestedPreference = useCallback(<K extends keyof UserPreferences, N extends keyof UserPreferences[K]>(
    key: K,
    nestedKey: N,
    value: UserPreferences[K][N]
  ) => {
    const current = preferences[key] as any
    const updated = { ...current, [nestedKey]: value }
    savePreferences({ [key]: updated })
  }, [preferences, savePreferences])

  // Reset to defaults
  const resetPreferences = useCallback(() => {
    setPreferences(DEFAULT_PREFERENCES)
    localStorage.removeItem('userPreferences')
  }, [])

  // Export preferences
  const exportPreferences = useCallback(() => {
    const dataStr = JSON.stringify(preferences, null, 2)
    const dataBlob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(dataBlob)
    
    const link = document.createElement('a')
    link.href = url
    link.download = 'baden-preferences.json'
    link.click()
    
    URL.revokeObjectURL(url)
  }, [preferences])

  // Import preferences
  const importPreferences = useCallback((file: File) => {
    return new Promise<void>((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = (e) => {
        try {
          const imported = JSON.parse(e.target?.result as string)
          const validated = { ...DEFAULT_PREFERENCES, ...imported }
          setPreferences(validated)
          localStorage.setItem('userPreferences', JSON.stringify(validated))
          resolve()
        } catch (error) {
          reject(new Error('Invalid preferences file'))
        }
      }
      reader.onerror = () => reject(new Error('Failed to read file'))
      reader.readAsText(file)
    })
  }, [])

  return {
    preferences,
    isLoading,
    updatePreference,
    updateNestedPreference,
    resetPreferences,
    exportPreferences,
    importPreferences,
    savePreferences
  }
}

// Theme hook
export const useTheme = () => {
  const { preferences, updatePreference } = useUserPreferences()
  
  const setTheme = useCallback((theme: 'light' | 'dark' | 'auto') => {
    updatePreference('theme', theme)
    
    // Apply theme to document
    const root = document.documentElement
    root.classList.remove('light', 'dark')
    
    if (theme === 'auto') {
      const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches
      root.classList.add(isDark ? 'dark' : 'light')
    } else {
      root.classList.add(theme)
    }
  }, [updatePreference])

  // Listen for system theme changes
  useEffect(() => {
    if (preferences.theme === 'auto') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
      const handleChange = (e: MediaQueryListEvent) => {
        const root = document.documentElement
        root.classList.remove('light', 'dark')
        root.classList.add(e.matches ? 'dark' : 'light')
      }
      
      mediaQuery.addEventListener('change', handleChange)
      return () => mediaQuery.removeEventListener('change', handleChange)
    }
  }, [preferences.theme])

  return {
    theme: preferences.theme,
    setTheme,
    isDark: preferences.theme === 'dark' || 
            (preferences.theme === 'auto' && window.matchMedia('(prefers-color-scheme: dark)').matches)
  }
}

// Accessibility hook
export const useAccessibility = () => {
  const { preferences, updateNestedPreference } = useUserPreferences()
  
  const toggleHighContrast = useCallback(() => {
    updateNestedPreference('accessibility', 'highContrast', !preferences.accessibility.highContrast)
  }, [preferences.accessibility.highContrast, updateNestedPreference])

  const toggleLargeText = useCallback(() => {
    updateNestedPreference('accessibility', 'largeText', !preferences.accessibility.largeText)
  }, [preferences.accessibility.largeText, updateNestedPreference])

  const toggleReducedMotion = useCallback(() => {
    updateNestedPreference('accessibility', 'reducedMotion', !preferences.accessibility.reducedMotion)
  }, [preferences.accessibility.reducedMotion, updateNestedPreference])

  const toggleVoiceNavigation = useCallback(() => {
    updateNestedPreference('accessibility', 'voiceNavigation', !preferences.accessibility.voiceNavigation)
  }, [preferences.accessibility.voiceNavigation, updateNestedPreference])

  // Apply accessibility settings
  useEffect(() => {
    const root = document.documentElement
    
    if (preferences.accessibility.highContrast) {
      root.classList.add('high-contrast')
    } else {
      root.classList.remove('high-contrast')
    }
    
    if (preferences.accessibility.largeText) {
      root.classList.add('large-text')
    } else {
      root.classList.remove('large-text')
    }
    
    if (preferences.accessibility.reducedMotion) {
      root.classList.add('reduced-motion')
    } else {
      root.classList.remove('reduced-motion')
    }
  }, [preferences.accessibility])

  return {
    accessibility: preferences.accessibility,
    toggleHighContrast,
    toggleLargeText,
    toggleReducedMotion,
    toggleVoiceNavigation
  }
}
