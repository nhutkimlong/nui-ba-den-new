// User preferences service for storing and managing user preferences
import { UserPreferences } from './recommendationService';

export interface PreferenceCategory {
  id: string;
  name: string;
  description: string;
  icon: string;
  subcategories?: string[];
}

export interface PreferenceProfile {
  id: string;
  name: string;
  description: string;
  preferences: Partial<UserPreferences>;
  isDefault?: boolean;
}

export interface UserHistory {
  visitedPOIs: string[];
  searchHistory: string[];
  favoriteCategories: string[];
  timeSpentByCategory: Record<string, number>;
  lastVisit: string;
  totalVisits: number;
}

export interface PreferenceAnalytics {
  mostViewedCategories: { category: string; count: number }[];
  preferredTimeOfDay: 'morning' | 'afternoon' | 'evening' | 'night';
  averageSessionDuration: number;
  favoriteAreas: string[];
  activityPattern: 'explorer' | 'planner' | 'casual' | 'focused';
}

class PreferencesService {
  private readonly STORAGE_KEY = 'ba_den_user_preferences';
  private readonly HISTORY_KEY = 'ba_den_user_history';
  private readonly ANALYTICS_KEY = 'ba_den_preference_analytics';

  // Available preference categories
  private readonly categories: PreferenceCategory[] = [
    {
      id: 'sightseeing',
      name: 'Tham quan',
      description: 'Khám phá các điểm tham quan và danh lam thắng cảnh',
      icon: '🏛️',
      subcategories: ['attraction', 'viewpoint', 'historical']
    },
    {
      id: 'spirituality',
      name: 'Tâm linh',
      description: 'Tham quan các địa điểm tâm linh và tôn giáo',
      icon: '🙏',
      subcategories: ['religious', 'temple', 'meditation']
    },
    {
      id: 'nature',
      name: 'Thiên nhiên',
      description: 'Khám phá thiên nhiên và cảnh quan núi rừng',
      icon: '🌲',
      subcategories: ['hiking', 'viewpoint', 'outdoor']
    },
    {
      id: 'photography',
      name: 'Chụp ảnh',
      description: 'Tìm kiếm các địa điểm đẹp để chụp ảnh',
      icon: '📸',
      subcategories: ['viewpoint', 'scenic', 'instagram']
    },
    {
      id: 'culture',
      name: 'Văn hóa',
      description: 'Tìm hiểu văn hóa và lịch sử địa phương',
      icon: '🎭',
      subcategories: ['historical', 'cultural', 'traditional']
    },
    {
      id: 'food',
      name: 'Ẩm thực',
      description: 'Thưởng thức đặc sản và ẩm thực địa phương',
      icon: '🍽️',
      subcategories: ['restaurant', 'local-food', 'specialty']
    },
    {
      id: 'adventure',
      name: 'Phiêu lưu',
      description: 'Các hoạt động mạo hiểm và thể thao',
      icon: '🧗',
      subcategories: ['hiking', 'climbing', 'extreme']
    },
    {
      id: 'relaxation',
      name: 'Thư giãn',
      description: 'Nghỉ ngơi và thư giãn trong không gian yên tĩnh',
      icon: '🧘',
      subcategories: ['peaceful', 'quiet', 'meditation']
    }
  ];

  // Predefined preference profiles
  private readonly profiles: PreferenceProfile[] = [
    {
      id: 'explorer',
      name: 'Nhà thám hiểm',
      description: 'Thích khám phá và trải nghiệm mọi thứ',
      preferences: {
        interests: ['sightseeing', 'nature', 'adventure', 'photography'],
        activityLevel: 'high',
        budgetRange: 'mid-range',
        groupType: 'solo',
        accessibility: false,
        preferredLanguage: 'vi'
      }
    },
    {
      id: 'spiritual-seeker',
      name: 'Người tìm kiếm tâm linh',
      description: 'Quan tâm đến các địa điểm tâm linh và văn hóa',
      preferences: {
        interests: ['spirituality', 'culture', 'relaxation'],
        activityLevel: 'low',
        budgetRange: 'budget',
        groupType: 'solo',
        accessibility: true,
        preferredLanguage: 'vi'
      }
    },
    {
      id: 'family-traveler',
      name: 'Du lịch gia đình',
      description: 'Phù hợp cho gia đình có trẻ em',
      preferences: {
        interests: ['sightseeing', 'culture', 'food'],
        activityLevel: 'moderate',
        budgetRange: 'mid-range',
        groupType: 'family',
        accessibility: true,
        preferredLanguage: 'vi'
      }
    },
    {
      id: 'photographer',
      name: 'Nhiếp ảnh gia',
      description: 'Tập trung vào chụp ảnh và cảnh đẹp',
      preferences: {
        interests: ['photography', 'nature', 'sightseeing'],
        activityLevel: 'moderate',
        budgetRange: 'mid-range',
        groupType: 'solo',
        accessibility: false,
        preferredLanguage: 'vi'
      }
    },
    {
      id: 'foodie',
      name: 'Tín đồ ẩm thực',
      description: 'Yêu thích khám phá ẩm thực địa phương',
      preferences: {
        interests: ['food', 'culture', 'sightseeing'],
        activityLevel: 'low',
        budgetRange: 'luxury',
        groupType: 'couple',
        accessibility: true,
        preferredLanguage: 'vi'
      }
    }
  ];

  // Get user preferences
  getUserPreferences(): UserPreferences | null {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (error) {
      console.warn('Failed to load user preferences:', error);
    }
    return null;
  }

  // Save user preferences
  saveUserPreferences(preferences: UserPreferences): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(preferences));
      this.updateAnalytics(preferences);
    } catch (error) {
      console.warn('Failed to save user preferences:', error);
    }
  }

  // Update specific preference
  updatePreference<K extends keyof UserPreferences>(
    key: K,
    value: UserPreferences[K]
  ): void {
    const current = this.getUserPreferences();
    if (current) {
      const updated = { ...current, [key]: value };
      this.saveUserPreferences(updated);
    }
  }

  // Get user history
  getUserHistory(): UserHistory {
    try {
      const stored = localStorage.getItem(this.HISTORY_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (error) {
      console.warn('Failed to load user history:', error);
    }

    // Return default history
    return {
      visitedPOIs: [],
      searchHistory: [],
      favoriteCategories: [],
      timeSpentByCategory: {},
      lastVisit: new Date().toISOString(),
      totalVisits: 0
    };
  }

  // Update user history
  updateUserHistory(updates: Partial<UserHistory>): void {
    try {
      const current = this.getUserHistory();
      const updated = {
        ...current,
        ...updates,
        lastVisit: new Date().toISOString(),
        totalVisits: current.totalVisits + 1
      };
      localStorage.setItem(this.HISTORY_KEY, JSON.stringify(updated));
    } catch (error) {
      console.warn('Failed to update user history:', error);
    }
  }

  // Record POI visit
  recordPOIVisit(poiId: string, category: string, timeSpent: number = 0): void {
    const history = this.getUserHistory();
    
    // Add to visited POIs (avoid duplicates)
    if (!history.visitedPOIs.includes(poiId)) {
      history.visitedPOIs.push(poiId);
    }

    // Update time spent by category
    history.timeSpentByCategory[category] = (history.timeSpentByCategory[category] || 0) + timeSpent;

    // Update favorite categories based on frequency
    const categoryCount = history.visitedPOIs.filter(id => 
      // This would need actual POI data to determine category
      // For now, just add the category
      true
    ).length;

    if (!history.favoriteCategories.includes(category)) {
      history.favoriteCategories.push(category);
    }

    this.updateUserHistory(history);
  }

  // Record search query
  recordSearch(query: string): void {
    const history = this.getUserHistory();
    
    // Add to search history (avoid duplicates, keep recent)
    history.searchHistory = history.searchHistory.filter(q => q !== query);
    history.searchHistory.push(query);
    
    // Keep only last 50 searches
    if (history.searchHistory.length > 50) {
      history.searchHistory = history.searchHistory.slice(-50);
    }

    this.updateUserHistory(history);
  }

  // Get preference analytics
  getPreferenceAnalytics(): PreferenceAnalytics {
    try {
      const stored = localStorage.getItem(this.ANALYTICS_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (error) {
      console.warn('Failed to load preference analytics:', error);
    }

    return this.generateDefaultAnalytics();
  }

  // Generate recommendations based on user history
  generatePersonalizedInterests(): string[] {
    const history = this.getUserHistory();
    const analytics = this.getPreferenceAnalytics();

    const interests: string[] = [];

    // Add interests based on most viewed categories
    analytics.mostViewedCategories.slice(0, 3).forEach(({ category }) => {
      if (!interests.includes(category)) {
        interests.push(category);
      }
    });

    // Add interests based on favorite categories
    history.favoriteCategories.slice(0, 2).forEach(category => {
      if (!interests.includes(category)) {
        interests.push(category);
      }
    });

    // Add interests based on time spent
    const topTimeCategories = Object.entries(history.timeSpentByCategory)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 2)
      .map(([category]) => category);

    topTimeCategories.forEach(category => {
      if (!interests.includes(category)) {
        interests.push(category);
      }
    });

    return interests.length > 0 ? interests : ['sightseeing', 'culture'];
  }

  // Suggest activity level based on history
  suggestActivityLevel(): 'low' | 'moderate' | 'high' {
    const analytics = this.getPreferenceAnalytics();
    
    switch (analytics.activityPattern) {
      case 'explorer':
        return 'high';
      case 'focused':
        return 'moderate';
      case 'casual':
      case 'planner':
      default:
        return 'low';
    }
  }

  // Get available categories
  getCategories(): PreferenceCategory[] {
    return this.categories;
  }

  // Get predefined profiles
  getProfiles(): PreferenceProfile[] {
    return this.profiles;
  }

  // Apply profile to user preferences
  applyProfile(profileId: string): void {
    const profile = this.profiles.find(p => p.id === profileId);
    if (profile && profile.preferences) {
      const currentPrefs = this.getUserPreferences();
      const newPrefs: UserPreferences = {
        interests: profile.preferences.interests || [],
        activityLevel: profile.preferences.activityLevel || 'moderate',
        budgetRange: profile.preferences.budgetRange || 'mid-range',
        groupType: profile.preferences.groupType || 'solo',
        accessibility: profile.preferences.accessibility || false,
        preferredLanguage: profile.preferences.preferredLanguage || 'vi',
        ...currentPrefs // Keep existing preferences that aren't in profile
      };
      this.saveUserPreferences(newPrefs);
    }
  }

  // Reset preferences to default
  resetPreferences(): void {
    try {
      localStorage.removeItem(this.STORAGE_KEY);
      localStorage.removeItem(this.HISTORY_KEY);
      localStorage.removeItem(this.ANALYTICS_KEY);
    } catch (error) {
      console.warn('Failed to reset preferences:', error);
    }
  }

  // Export user data
  exportUserData(): {
    preferences: UserPreferences | null;
    history: UserHistory;
    analytics: PreferenceAnalytics;
  } {
    return {
      preferences: this.getUserPreferences(),
      history: this.getUserHistory(),
      analytics: this.getPreferenceAnalytics()
    };
  }

  // Import user data
  importUserData(data: {
    preferences?: UserPreferences;
    history?: UserHistory;
    analytics?: PreferenceAnalytics;
  }): void {
    try {
      if (data.preferences) {
        this.saveUserPreferences(data.preferences);
      }
      if (data.history) {
        localStorage.setItem(this.HISTORY_KEY, JSON.stringify(data.history));
      }
      if (data.analytics) {
        localStorage.setItem(this.ANALYTICS_KEY, JSON.stringify(data.analytics));
      }
    } catch (error) {
      console.warn('Failed to import user data:', error);
    }
  }

  // Get smart default preferences based on history
  getSmartDefaults(): Partial<UserPreferences> {
    const history = this.getUserHistory();
    const analytics = this.getPreferenceAnalytics();

    return {
      interests: this.generatePersonalizedInterests(),
      activityLevel: this.suggestActivityLevel(),
      budgetRange: 'mid-range', // Default
      groupType: 'solo', // Default
      accessibility: false, // Default
      preferredLanguage: 'vi'
    };
  }

  // Check if user has set preferences
  hasUserPreferences(): boolean {
    return this.getUserPreferences() !== null;
  }

  // Get preference completion percentage
  getPreferenceCompleteness(): number {
    const prefs = this.getUserPreferences();
    if (!prefs) return 0;

    const requiredFields: (keyof UserPreferences)[] = [
      'interests',
      'activityLevel',
      'budgetRange',
      'groupType',
      'accessibility',
      'preferredLanguage'
    ];

    const completedFields = requiredFields.filter(field => {
      const value = prefs[field];
      if (Array.isArray(value)) {
        return value.length > 0;
      }
      return value !== undefined && value !== null;
    });

    return Math.round((completedFields.length / requiredFields.length) * 100);
  }

  // Private methods
  private updateAnalytics(preferences: UserPreferences): void {
    const current = this.getPreferenceAnalytics();
    const history = this.getUserHistory();

    // Update most viewed categories based on interests
    const categoryMap = new Map<string, number>();
    preferences.interests.forEach(interest => {
      categoryMap.set(interest, (categoryMap.get(interest) || 0) + 1);
    });

    const mostViewedCategories = Array.from(categoryMap.entries())
      .map(([category, count]) => ({ category, count }))
      .sort((a, b) => b.count - a.count);

    // Determine activity pattern
    let activityPattern: PreferenceAnalytics['activityPattern'] = 'casual';
    if (preferences.activityLevel === 'high' && preferences.interests.includes('adventure')) {
      activityPattern = 'explorer';
    } else if (preferences.interests.length <= 2) {
      activityPattern = 'focused';
    } else if (history.totalVisits > 10) {
      activityPattern = 'planner';
    }

    const updated: PreferenceAnalytics = {
      ...current,
      mostViewedCategories,
      activityPattern,
      favoriteAreas: history.favoriteCategories.slice(0, 5)
    };

    try {
      localStorage.setItem(this.ANALYTICS_KEY, JSON.stringify(updated));
    } catch (error) {
      console.warn('Failed to update analytics:', error);
    }
  }

  private generateDefaultAnalytics(): PreferenceAnalytics {
    return {
      mostViewedCategories: [],
      preferredTimeOfDay: 'afternoon',
      averageSessionDuration: 0,
      favoriteAreas: [],
      activityPattern: 'casual'
    };
  }
}

// Export singleton instance
export const preferencesService = new PreferencesService();
export default preferencesService;