// Hook for managing user preferences and personalization
import { useState, useEffect, useCallback } from 'react';
import { preferencesService, PreferenceAnalytics, UserHistory } from '@/services/preferencesService';
import { UserPreferences } from '@/services/recommendationService';

export interface UseUserPreferencesOptions {
  autoLoad?: boolean;
  trackHistory?: boolean;
}

export interface UserPreferencesState {
  // Preferences
  preferences: UserPreferences | null;
  hasPreferences: boolean;
  completeness: number;
  
  // History and analytics
  history: UserHistory;
  analytics: PreferenceAnalytics;
  
  // Loading states
  isLoading: boolean;
  isSaving: boolean;
  
  // Error states
  error: string | null;
  
  // Smart suggestions
  suggestedInterests: string[];
  suggestedActivityLevel: 'low' | 'moderate' | 'high';
  smartDefaults: Partial<UserPreferences>;
}

export interface UserPreferencesActions {
  // Preference management
  loadPreferences: () => void;
  savePreferences: (preferences: UserPreferences) => Promise<void>;
  updatePreference: <K extends keyof UserPreferences>(key: K, value: UserPreferences[K]) => Promise<void>;
  resetPreferences: () => void;
  
  // Profile management
  applyProfile: (profileId: string) => void;
  getProfiles: () => import('@/services/preferencesService').PreferenceProfile[];
  getCategories: () => import('@/services/preferencesService').PreferenceCategory[];
  
  // History tracking
  recordPOIVisit: (poiId: string, category: string, timeSpent?: number) => void;
  recordSearch: (query: string) => void;
  clearHistory: () => void;
  
  // Smart features
  generateSmartDefaults: () => void;
  getPersonalizedInterests: () => string[];
  
  // Data management
  exportData: () => void;
  importData: (data: any) => void;
  
  // Analytics
  refreshAnalytics: () => void;
  getUsageStats: () => {
    totalVisits: number;
    favoriteCategories: string[];
    searchCount: number;
    lastVisit: string;
  };
}

export function useUserPreferences(
  options: UseUserPreferencesOptions = {}
): [UserPreferencesState, UserPreferencesActions] {
  const { autoLoad = true, trackHistory = true } = options;

  // State
  const [state, setState] = useState<UserPreferencesState>({
    preferences: null,
    hasPreferences: false,
    completeness: 0,
    history: {
      visitedPOIs: [],
      searchHistory: [],
      favoriteCategories: [],
      timeSpentByCategory: {},
      lastVisit: new Date().toISOString(),
      totalVisits: 0
    },
    analytics: {
      mostViewedCategories: [],
      preferredTimeOfDay: 'afternoon',
      averageSessionDuration: 0,
      favoriteAreas: [],
      activityPattern: 'casual'
    },
    isLoading: false,
    isSaving: false,
    error: null,
    suggestedInterests: [],
    suggestedActivityLevel: 'moderate',
    smartDefaults: {}
  });

  // Load preferences from storage
  const loadPreferences = useCallback(() => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const preferences = preferencesService.getUserPreferences();
      const history = preferencesService.getUserHistory();
      const analytics = preferencesService.getPreferenceAnalytics();
      const hasPreferences = preferencesService.hasUserPreferences();
      const completeness = preferencesService.getPreferenceCompleteness();
      const suggestedInterests = preferencesService.generatePersonalizedInterests();
      const suggestedActivityLevel = preferencesService.suggestActivityLevel();
      const smartDefaults = preferencesService.getSmartDefaults();

      setState(prev => ({
        ...prev,
        preferences,
        hasPreferences,
        completeness,
        history,
        analytics,
        suggestedInterests,
        suggestedActivityLevel,
        smartDefaults,
        isLoading: false
      }));

    } catch (error) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Lỗi tải preferences'
      }));
    }
  }, []);

  // Save preferences
  const savePreferences = useCallback(async (preferences: UserPreferences) => {
    setState(prev => ({ ...prev, isSaving: true, error: null }));

    try {
      preferencesService.saveUserPreferences(preferences);
      
      // Refresh state
      const completeness = preferencesService.getPreferenceCompleteness();
      const analytics = preferencesService.getPreferenceAnalytics();

      setState(prev => ({
        ...prev,
        preferences,
        hasPreferences: true,
        completeness,
        analytics,
        isSaving: false
      }));

    } catch (error) {
      setState(prev => ({
        ...prev,
        isSaving: false,
        error: error instanceof Error ? error.message : 'Lỗi lưu preferences'
      }));
    }
  }, []);

  // Update specific preference
  const updatePreference = useCallback(async <K extends keyof UserPreferences>(
    key: K,
    value: UserPreferences[K]
  ) => {
    if (!state.preferences) return;

    const updatedPreferences = { ...state.preferences, [key]: value };
    await savePreferences(updatedPreferences);
  }, [state.preferences, savePreferences]);

  // Reset preferences
  const resetPreferences = useCallback(() => {
    preferencesService.resetPreferences();
    setState(prev => ({
      ...prev,
      preferences: null,
      hasPreferences: false,
      completeness: 0,
      history: {
        visitedPOIs: [],
        searchHistory: [],
        favoriteCategories: [],
        timeSpentByCategory: {},
        lastVisit: new Date().toISOString(),
        totalVisits: 0
      },
      analytics: {
        mostViewedCategories: [],
        preferredTimeOfDay: 'afternoon',
        averageSessionDuration: 0,
        favoriteAreas: [],
        activityPattern: 'casual'
      }
    }));
  }, []);

  // Apply profile
  const applyProfile = useCallback((profileId: string) => {
    preferencesService.applyProfile(profileId);
    loadPreferences(); // Reload to get updated preferences
  }, [loadPreferences]);

  // Get profiles
  const getProfiles = useCallback(() => {
    return preferencesService.getProfiles();
  }, []);

  // Get categories
  const getCategories = useCallback(() => {
    return preferencesService.getCategories();
  }, []);

  // Record POI visit
  const recordPOIVisit = useCallback((poiId: string, category: string, timeSpent: number = 0) => {
    if (!trackHistory) return;

    preferencesService.recordPOIVisit(poiId, category, timeSpent);
    
    // Update state
    const updatedHistory = preferencesService.getUserHistory();
    setState(prev => ({ ...prev, history: updatedHistory }));
  }, [trackHistory]);

  // Record search
  const recordSearch = useCallback((query: string) => {
    if (!trackHistory) return;

    preferencesService.recordSearch(query);
    
    // Update state
    const updatedHistory = preferencesService.getUserHistory();
    setState(prev => ({ ...prev, history: updatedHistory }));
  }, [trackHistory]);

  // Clear history
  const clearHistory = useCallback(() => {
    preferencesService.resetPreferences();
    loadPreferences();
  }, [loadPreferences]);

  // Generate smart defaults
  const generateSmartDefaults = useCallback(() => {
    const smartDefaults = preferencesService.getSmartDefaults();
    const suggestedInterests = preferencesService.generatePersonalizedInterests();
    const suggestedActivityLevel = preferencesService.suggestActivityLevel();

    setState(prev => ({
      ...prev,
      smartDefaults,
      suggestedInterests,
      suggestedActivityLevel
    }));
  }, []);

  // Get personalized interests
  const getPersonalizedInterests = useCallback(() => {
    return preferencesService.generatePersonalizedInterests();
  }, []);

  // Export data
  const exportData = useCallback(() => {
    const data = preferencesService.exportUserData();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ba-den-preferences-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, []);

  // Import data
  const importData = useCallback((data: any) => {
    try {
      preferencesService.importUserData(data);
      loadPreferences();
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: 'Lỗi import dữ liệu. Vui lòng kiểm tra định dạng file.'
      }));
    }
  }, [loadPreferences]);

  // Refresh analytics
  const refreshAnalytics = useCallback(() => {
    const analytics = preferencesService.getPreferenceAnalytics();
    setState(prev => ({ ...prev, analytics }));
  }, []);

  // Get usage statistics
  const getUsageStats = useCallback(() => {
    return {
      totalVisits: state.history.totalVisits,
      favoriteCategories: state.history.favoriteCategories,
      searchCount: state.history.searchHistory.length,
      lastVisit: state.history.lastVisit
    };
  }, [state.history]);

  // Auto-load preferences on mount
  useEffect(() => {
    if (autoLoad) {
      loadPreferences();
    }
  }, [autoLoad, loadPreferences]);

  // Auto-refresh smart suggestions when history changes
  useEffect(() => {
    if (state.history.totalVisits > 0) {
      generateSmartDefaults();
    }
  }, [state.history.totalVisits, generateSmartDefaults]);

  // Actions object
  const actions: UserPreferencesActions = {
    loadPreferences,
    savePreferences,
    updatePreference,
    resetPreferences,
    applyProfile,
    getProfiles,
    getCategories,
    recordPOIVisit,
    recordSearch,
    clearHistory,
    generateSmartDefaults,
    getPersonalizedInterests,
    exportData,
    importData,
    refreshAnalytics,
    getUsageStats
  };

  return [state, actions];
}