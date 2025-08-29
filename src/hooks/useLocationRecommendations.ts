// Hook for location-based recommendations
import { useState, useEffect, useCallback } from 'react';
import { locationService, LocationCoordinates } from '@/services/locationService';
import { weatherService, WeatherData } from '@/services/weatherService';
import { 
  recommendationService, 
  Recommendation, 
  RecommendationGroup, 
  RecommendationContext,
  UserPreferences 
} from '@/services/recommendationService';

export interface UseLocationRecommendationsOptions {
  autoFetch?: boolean;
  radius?: number;
  limit?: number;
  includeWeather?: boolean;
  userPreferences?: UserPreferences;
}

export interface LocationRecommendationsState {
  // Location data
  userLocation: LocationCoordinates | null;
  locationError: string | null;
  locationLoading: boolean;
  
  // Weather data
  weather: WeatherData | null;
  weatherError: string | null;
  weatherLoading: boolean;
  
  // Recommendations
  nearbyRecommendations: Recommendation[];
  weatherRecommendations: RecommendationGroup[];
  personalizedRecommendations: RecommendationGroup[];
  timeBasedRecommendations: RecommendationGroup | null;
  
  // Loading states
  recommendationsLoading: boolean;
  recommendationsError: string | null;
  
  // Permissions
  locationPermission: PermissionState | null;
}

export interface LocationRecommendationsActions {
  // Location actions
  requestLocation: () => Promise<void>;
  clearLocation: () => void;
  
  // Weather actions
  refreshWeather: () => Promise<void>;
  
  // Recommendation actions
  refreshRecommendations: () => Promise<void>;
  getNearbyPOIs: (radius?: number, limit?: number) => Promise<void>;
  getWeatherRecommendations: () => Promise<void>;
  getPersonalizedRecommendations: (preferences: UserPreferences) => Promise<void>;
  getTimeBasedRecommendations: (timeOfDay?: 'morning' | 'afternoon' | 'evening' | 'night') => Promise<void>;
  
  // Utility actions
  calculateDistance: (lat: number, lon: number) => number | null;
  isWithinRadius: (lat: number, lon: number, radius: number) => boolean;
}

export function useLocationRecommendations(
  options: UseLocationRecommendationsOptions = {}
): [LocationRecommendationsState, LocationRecommendationsActions] {
  const {
    autoFetch = true,
    radius = 5,
    limit = 10,
    includeWeather = true,
    userPreferences
  } = options;

  // State
  const [state, setState] = useState<LocationRecommendationsState>({
    userLocation: null,
    locationError: null,
    locationLoading: false,
    
    weather: null,
    weatherError: null,
    weatherLoading: false,
    
    nearbyRecommendations: [],
    weatherRecommendations: [],
    personalizedRecommendations: [],
    timeBasedRecommendations: null,
    
    recommendationsLoading: false,
    recommendationsError: null,
    
    locationPermission: null
  });

  // Get current time of day
  const getCurrentTimeOfDay = (): 'morning' | 'afternoon' | 'evening' | 'night' => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) return 'morning';
    if (hour >= 12 && hour < 17) return 'afternoon';
    if (hour >= 17 && hour < 21) return 'evening';
    return 'night';
  };

  // Request location permission and get current position
  const requestLocation = useCallback(async () => {
    setState(prev => ({ ...prev, locationLoading: true, locationError: null }));

    try {
      // Check permission first
      const permission = await locationService.getPermissionStatus();
      setState(prev => ({ ...prev, locationPermission: permission }));

      // Get current position
      const position = await locationService.getCurrentPosition({
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000 // 5 minutes
      });

      setState(prev => ({
        ...prev,
        userLocation: position,
        locationLoading: false,
        locationError: null
      }));

      // Auto-fetch recommendations if enabled
      if (autoFetch) {
        await refreshRecommendations();
      }

    } catch (error: any) {
      setState(prev => ({
        ...prev,
        locationLoading: false,
        locationError: error.message || 'Không thể xác định vị trí'
      }));
    }
  }, [autoFetch]);

  // Clear location data
  const clearLocation = useCallback(() => {
    locationService.clearWatch();
    setState(prev => ({
      ...prev,
      userLocation: null,
      locationError: null,
      nearbyRecommendations: [],
      weatherRecommendations: [],
      personalizedRecommendations: [],
      timeBasedRecommendations: null
    }));
  }, []);

  // Refresh weather data
  const refreshWeather = useCallback(async () => {
    if (!includeWeather) return;

    setState(prev => ({ ...prev, weatherLoading: true, weatherError: null }));

    try {
      const location = state.userLocation;
      const weather = await weatherService.getCurrentWeather(
        location?.latitude,
        location?.longitude
      );

      setState(prev => ({
        ...prev,
        weather,
        weatherLoading: false,
        weatherError: null
      }));

    } catch (error: any) {
      setState(prev => ({
        ...prev,
        weatherLoading: false,
        weatherError: error.message || 'Không thể tải thông tin thời tiết'
      }));
    }
  }, [includeWeather, state.userLocation]);

  // Get nearby POIs
  const getNearbyPOIs = useCallback(async (
    searchRadius: number = radius,
    searchLimit: number = limit
  ) => {
    if (!state.userLocation) return;

    setState(prev => ({ ...prev, recommendationsLoading: true }));

    try {
      const recommendations = await recommendationService.getNearbyPOIs(
        state.userLocation,
        searchRadius,
        searchLimit
      );

      setState(prev => ({
        ...prev,
        nearbyRecommendations: recommendations,
        recommendationsLoading: false,
        recommendationsError: null
      }));

    } catch (error: any) {
      setState(prev => ({
        ...prev,
        recommendationsLoading: false,
        recommendationsError: error.message || 'Không thể tải gợi ý địa điểm gần'
      }));
    }
  }, [state.userLocation, radius, limit]);

  // Get weather-based recommendations
  const getWeatherRecommendations = useCallback(async () => {
    setState(prev => ({ ...prev, recommendationsLoading: true }));

    try {
      const context: RecommendationContext = {
        userLocation: state.userLocation || undefined,
        weather: state.weather || undefined,
        timeOfDay: getCurrentTimeOfDay(),
        userPreferences
      };

      const recommendations = await recommendationService.getWeatherBasedRecommendations(context);

      setState(prev => ({
        ...prev,
        weatherRecommendations: recommendations,
        recommendationsLoading: false,
        recommendationsError: null
      }));

    } catch (error: any) {
      setState(prev => ({
        ...prev,
        recommendationsLoading: false,
        recommendationsError: error.message || 'Không thể tải gợi ý dựa trên thời tiết'
      }));
    }
  }, [state.userLocation, state.weather, userPreferences]);

  // Get personalized recommendations
  const getPersonalizedRecommendations = useCallback(async (preferences: UserPreferences) => {
    setState(prev => ({ ...prev, recommendationsLoading: true }));

    try {
      const context: RecommendationContext = {
        userLocation: state.userLocation || undefined,
        weather: state.weather || undefined,
        timeOfDay: getCurrentTimeOfDay(),
        userPreferences: preferences
      };

      const recommendations = await recommendationService.getPersonalizedRecommendations(context);

      setState(prev => ({
        ...prev,
        personalizedRecommendations: recommendations,
        recommendationsLoading: false,
        recommendationsError: null
      }));

    } catch (error: any) {
      setState(prev => ({
        ...prev,
        recommendationsLoading: false,
        recommendationsError: error.message || 'Không thể tải gợi ý cá nhân hóa'
      }));
    }
  }, [state.userLocation, state.weather]);

  // Get time-based recommendations
  const getTimeBasedRecommendations = useCallback(async (
    timeOfDay: 'morning' | 'afternoon' | 'evening' | 'night' = getCurrentTimeOfDay()
  ) => {
    setState(prev => ({ ...prev, recommendationsLoading: true }));

    try {
      const recommendations = await recommendationService.getTimeBasedRecommendations(timeOfDay);

      setState(prev => ({
        ...prev,
        timeBasedRecommendations: recommendations,
        recommendationsLoading: false,
        recommendationsError: null
      }));

    } catch (error: any) {
      setState(prev => ({
        ...prev,
        recommendationsLoading: false,
        recommendationsError: error.message || 'Không thể tải gợi ý theo thời gian'
      }));
    }
  }, []);

  // Refresh all recommendations
  const refreshRecommendations = useCallback(async () => {
    const promises: Promise<void>[] = [];

    // Get nearby POIs if location available
    if (state.userLocation) {
      promises.push(getNearbyPOIs());
    }

    // Get weather recommendations if weather enabled
    if (includeWeather) {
      promises.push(getWeatherRecommendations());
    }

    // Get personalized recommendations if preferences available
    if (userPreferences) {
      promises.push(getPersonalizedRecommendations(userPreferences));
    }

    // Get time-based recommendations
    promises.push(getTimeBasedRecommendations());

    try {
      await Promise.all(promises);
    } catch (error) {
      console.error('Error refreshing recommendations:', error);
    }
  }, [
    state.userLocation,
    includeWeather,
    userPreferences,
    getNearbyPOIs,
    getWeatherRecommendations,
    getPersonalizedRecommendations,
    getTimeBasedRecommendations
  ]);

  // Calculate distance from user location
  const calculateDistance = useCallback((lat: number, lon: number): number | null => {
    if (!state.userLocation) return null;

    return locationService.calculateDistance(
      state.userLocation.latitude,
      state.userLocation.longitude,
      lat,
      lon
    );
  }, [state.userLocation]);

  // Check if coordinates are within radius
  const isWithinRadius = useCallback((lat: number, lon: number, checkRadius: number): boolean => {
    const distance = calculateDistance(lat, lon);
    return distance !== null && distance <= checkRadius;
  }, [calculateDistance]);

  // Auto-fetch location and weather on mount
  useEffect(() => {
    if (autoFetch) {
      requestLocation();
      
      if (includeWeather) {
        refreshWeather();
      }
    }
  }, [autoFetch, includeWeather]);

  // Refresh weather when location changes
  useEffect(() => {
    if (state.userLocation && includeWeather) {
      refreshWeather();
    }
  }, [state.userLocation, includeWeather]);

  // Auto-refresh recommendations when dependencies change
  useEffect(() => {
    if (autoFetch && (state.userLocation || state.weather)) {
      refreshRecommendations();
    }
  }, [state.userLocation, state.weather, userPreferences, autoFetch]);

  // Actions object
  const actions: LocationRecommendationsActions = {
    requestLocation,
    clearLocation,
    refreshWeather,
    refreshRecommendations,
    getNearbyPOIs,
    getWeatherRecommendations,
    getPersonalizedRecommendations,
    getTimeBasedRecommendations,
    calculateDistance,
    isWithinRadius
  };

  return [state, actions];
}