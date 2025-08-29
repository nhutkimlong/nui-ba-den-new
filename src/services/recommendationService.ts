// Recommendation Service for location-based and personalized recommendations
import { POI, Restaurant, Accommodation, Tour } from '@/types';
import { locationService, LocationCoordinates } from './locationService';
import { weatherService, WeatherData, ActivityRecommendation } from './weatherService';
import { dataApi } from './api';

export interface RecommendationContext {
  userLocation?: LocationCoordinates;
  weather?: WeatherData;
  timeOfDay?: 'morning' | 'afternoon' | 'evening' | 'night';
  userPreferences?: UserPreferences;
  visitHistory?: string[];
  currentSeason?: 'spring' | 'summer' | 'autumn' | 'winter';
}

export interface UserPreferences {
  interests: string[];
  activityLevel: 'low' | 'moderate' | 'high';
  budgetRange: 'budget' | 'mid-range' | 'luxury';
  groupType: 'solo' | 'couple' | 'family' | 'group';
  accessibility: boolean;
  preferredLanguage: 'vi' | 'en';
}

export interface Recommendation {
  id: string;
  type: 'poi' | 'restaurant' | 'accommodation' | 'tour' | 'activity';
  item: POI | Restaurant | Accommodation | Tour | ActivityRecommendation;
  score: number;
  reasons: string[];
  distance?: number;
  estimatedTime?: number;
  weatherSuitability?: 'excellent' | 'good' | 'fair' | 'poor';
  category: string;
  priority: 'high' | 'medium' | 'low';
}

export interface RecommendationGroup {
  title: string;
  description: string;
  recommendations: Recommendation[];
  icon: string;
}

class RecommendationService {
  private poiData: POI[] = [];
  private restaurantData: Restaurant[] = [];
  private accommodationData: Accommodation[] = [];
  private tourData: Tour[] = [];
  private dataLoaded = false;

  // Initialize data
  async initialize(): Promise<void> {
    if (this.dataLoaded) return;

    try {
      const [poiRes, restaurantRes, accommodationRes, tourRes] = await Promise.all([
        dataApi.getPOI(),
        dataApi.getRestaurants(),
        dataApi.getAccommodations(),
        dataApi.getTours()
      ]);

      if (poiRes.success) this.poiData = poiRes.data || [];
      if (restaurantRes.success) this.restaurantData = restaurantRes.data || [];
      if (accommodationRes.success) this.accommodationData = accommodationRes.data || [];
      if (tourRes.success) this.tourData = tourRes.data || [];

      this.dataLoaded = true;
    } catch (error) {
      console.error('Failed to initialize recommendation service:', error);
    }
  }

  // Get nearby POIs based on user location
  async getNearbyPOIs(
    userLocation: LocationCoordinates,
    radius: number = 5, // km
    limit: number = 10
  ): Promise<Recommendation[]> {
    await this.initialize();

    const nearbyPOIs = this.poiData
      .map(poi => {
        const distance = locationService.calculateDistance(
          userLocation.latitude,
          userLocation.longitude,
          poi.latitude,
          poi.longitude
        );
        return { poi, distance };
      })
      .filter(item => item.distance <= radius)
      .sort((a, b) => a.distance - b.distance)
      .slice(0, limit);

    return nearbyPOIs.map(({ poi, distance }) => ({
      id: `poi-${poi.id}`,
      type: 'poi' as const,
      item: poi,
      score: this.calculatePOIScore(poi, distance),
      reasons: this.generatePOIReasons(poi, distance),
      distance,
      estimatedTime: this.estimateVisitTime(poi),
      category: poi.category,
      priority: distance < 1 ? 'high' : distance < 3 ? 'medium' : 'low'
    }));
  }

  // Get weather-based recommendations
  async getWeatherBasedRecommendations(
    context: RecommendationContext
  ): Promise<RecommendationGroup[]> {
    await this.initialize();

    const weather = context.weather || await weatherService.getCurrentWeather();
    const activityRecommendations = await weatherService.getActivityRecommendations(weather);
    
    const groups: RecommendationGroup[] = [];

    // Weather-suitable activities
    const weatherActivities: Recommendation[] = activityRecommendations.map((activity, index) => ({
      id: `weather-activity-${index}`,
      type: 'activity' as const,
      item: activity,
      score: this.getActivityScore(activity.suitability),
      reasons: [activity.reason],
      weatherSuitability: activity.suitability,
      category: 'weather-activity',
      priority: activity.suitability === 'excellent' ? 'high' : 
                activity.suitability === 'good' ? 'medium' : 'low'
    }));

    if (weatherActivities.length > 0) {
      groups.push({
        title: `Hoạt động phù hợp với thời tiết ${weather.description.toLowerCase()}`,
        description: `Nhiệt độ ${weather.temperature}°C, ${weather.description.toLowerCase()}`,
        recommendations: weatherActivities,
        icon: weather.icon
      });
    }

    // Weather-suitable POIs
    const suitablePOIs = this.poiData
      .filter(poi => this.isPOISuitableForWeather(poi, weather))
      .slice(0, 5)
      .map(poi => ({
        id: `weather-poi-${poi.id}`,
        type: 'poi' as const,
        item: poi,
        score: this.calculatePOIScore(poi, 0, weather),
        reasons: this.generateWeatherPOIReasons(poi, weather),
        weatherSuitability: this.getPOIWeatherSuitability(poi, weather),
        category: poi.category,
        priority: 'medium'
      }));

    if (suitablePOIs.length > 0) {
      groups.push({
        title: 'Địa điểm phù hợp với thời tiết hiện tại',
        description: 'Các địa điểm được đề xuất dựa trên điều kiện thời tiết',
        recommendations: suitablePOIs as Recommendation[],
        icon: '🏞️'
      });
    }

    return groups;
  }

  // Get personalized recommendations based on user preferences
  async getPersonalizedRecommendations(
    context: RecommendationContext
  ): Promise<RecommendationGroup[]> {
    await this.initialize();

    const groups: RecommendationGroup[] = [];
    const preferences = context.userPreferences;

    if (!preferences) return groups;

    // Interest-based POI recommendations
    const interestPOIs = this.poiData
      .filter(poi => this.matchesUserInterests(poi, preferences.interests))
      .slice(0, 8)
      .map(poi => ({
        id: `interest-poi-${poi.id}`,
        type: 'poi' as const,
        item: poi,
        score: this.calculatePersonalizedPOIScore(poi, preferences),
        reasons: this.generateInterestReasons(poi, preferences.interests),
        category: poi.category,
        priority: poi.featured ? 'high' : 'medium' as const
      }));

    if (interestPOIs.length > 0) {
      groups.push({
        title: 'Dành cho sở thích của bạn',
        description: 'Các địa điểm phù hợp với sở thích đã chọn',
        recommendations: interestPOIs as Recommendation[],
        icon: '❤️'
      });
    }

    // Budget-appropriate restaurants
    const budgetRestaurants = this.restaurantData
      .filter(restaurant => 
        restaurant.isActive && 
        (!restaurant.price_range || restaurant.price_range === preferences.budgetRange)
      )
      .slice(0, 5)
      .map(restaurant => ({
        id: `budget-restaurant-${restaurant.id}`,
        type: 'restaurant' as const,
        item: restaurant,
        score: this.calculateRestaurantScore(restaurant, preferences),
        reasons: this.generateBudgetReasons(restaurant, preferences.budgetRange),
        category: 'restaurant',
        priority: restaurant.featured ? 'high' : 'medium' as const
      }));

    if (budgetRestaurants.length > 0) {
      groups.push({
        title: 'Nhà hàng phù hợp ngân sách',
        description: `Các nhà hàng trong tầm giá ${this.getBudgetLabel(preferences.budgetRange)}`,
        recommendations: budgetRestaurants as Recommendation[],
        icon: '🍽️'
      });
    }

    // Group-appropriate accommodations
    const groupAccommodations = this.accommodationData
      .filter(acc => 
        acc.isActive && 
        this.isAccommodationSuitableForGroup(acc, preferences.groupType)
      )
      .slice(0, 3)
      .map(accommodation => ({
        id: `group-accommodation-${accommodation.id}`,
        type: 'accommodation' as const,
        item: accommodation,
        score: this.calculateAccommodationScore(accommodation, preferences),
        reasons: this.generateGroupAccommodationReasons(accommodation, preferences.groupType),
        category: 'accommodation',
        priority: accommodation.featured ? 'high' : 'medium' as const
      }));

    if (groupAccommodations.length > 0) {
      groups.push({
        title: 'Nơi lưu trú phù hợp',
        description: `Các nơi lưu trú phù hợp cho ${this.getGroupTypeLabel(preferences.groupType)}`,
        recommendations: groupAccommodations as Recommendation[],
        icon: '🏨'
      });
    }

    return groups;
  }

  // Get time-based recommendations
  async getTimeBasedRecommendations(
    timeOfDay: 'morning' | 'afternoon' | 'evening' | 'night'
  ): Promise<RecommendationGroup> {
    await this.initialize();

    const timeRecommendations: Recommendation[] = [];

    switch (timeOfDay) {
      case 'morning':
        // Morning activities: sunrise viewing, temple visits, hiking
        const morningPOIs = this.poiData
          .filter(poi => 
            poi.category === 'viewpoint' || 
            poi.category === 'religious' ||
            poi.area === 'Đỉnh núi'
          )
          .slice(0, 5)
          .map(poi => ({
            id: `morning-${poi.id}`,
            type: 'poi' as const,
            item: poi,
            score: this.calculateTimeBasedScore(poi, 'morning'),
            reasons: ['Lý tưởng để ngắm bình minh', 'Không khí trong lành buổi sáng'],
            category: poi.category,
            priority: 'high'
          }));
        timeRecommendations.push(...(morningPOIs as Recommendation[]));
        break;

      case 'afternoon':
        // Afternoon activities: sightseeing, cable car, restaurants
        const afternoonPOIs = this.poiData
          .filter(poi => 
            poi.category === 'attraction' || 
            poi.category === 'transport'
          )
          .slice(0, 5)
          .map(poi => ({
            id: `afternoon-${poi.id}`,
            type: 'poi' as const,
            item: poi,
            score: this.calculateTimeBasedScore(poi, 'afternoon'),
            reasons: ['Thời gian lý tưởng để tham quan', 'Ánh sáng tốt cho chụp ảnh'],
            category: poi.category,
            priority: 'medium'
          }));
        timeRecommendations.push(...(afternoonPOIs as Recommendation[]));
        break;

      case 'evening':
        // Evening activities: sunset viewing, dining, cultural sites
        const eveningPOIs = this.poiData
          .filter(poi => 
            poi.category === 'viewpoint' || 
            poi.category === 'religious'
          )
          .slice(0, 3)
          .map(poi => ({
            id: `evening-${poi.id}`,
            type: 'poi' as const,
            item: poi,
            score: this.calculateTimeBasedScore(poi, 'evening'),
            reasons: ['Tuyệt vời để ngắm hoàng hôn', 'Không khí yên tĩnh buổi chiều'],
            category: poi.category,
            priority: 'high'
          }));
        timeRecommendations.push(...(eveningPOIs as Recommendation[]));
        break;

      case 'night':
        // Night activities: accommodation, late dining
        const nightAccommodations = this.accommodationData
          .filter(acc => acc.isActive)
          .slice(0, 3)
          .map(accommodation => ({
            id: `night-${accommodation.id}`,
            type: 'accommodation' as const,
            item: accommodation,
            score: this.calculateAccommodationScore(accommodation),
            reasons: ['Nơi nghỉ ngơi thoải mái', 'Dịch vụ tốt ban đêm'],
            category: 'accommodation',
            priority: 'high'
          }));
        timeRecommendations.push(...(nightAccommodations as Recommendation[]));
        break;
    }

    return {
      title: `Gợi ý cho ${this.getTimeOfDayLabel(timeOfDay)}`,
      description: `Các hoạt động phù hợp với thời gian ${this.getTimeOfDayLabel(timeOfDay).toLowerCase()}`,
      recommendations: timeRecommendations,
      icon: this.getTimeOfDayIcon(timeOfDay)
    };
  }

  // Calculate POI score based on various factors
  private calculatePOIScore(
    poi: POI, 
    distance: number = 0, 
    weather?: WeatherData
  ): number {
    let score = 50; // Base score

    // Distance factor (closer is better)
    if (distance > 0) {
      score += Math.max(0, 30 - distance * 5);
    }

    // Featured POIs get bonus
    if (poi.featured) {
      score += 20;
    }

    // Category popularity bonus
    const popularCategories = ['attraction', 'viewpoint', 'religious'];
    if (popularCategories.includes(poi.category)) {
      score += 10;
    }

    // Weather suitability
    if (weather) {
      const suitability = this.getPOIWeatherSuitability(poi, weather);
      const weatherBonus = {
        excellent: 15,
        good: 10,
        fair: 5,
        poor: -10
      };
      score += weatherBonus[suitability];
    }

    // Has audio guide bonus
    if (poi.audio_url) {
      score += 5;
    }

    return Math.max(0, Math.min(100, score));
  }

  private calculatePersonalizedPOIScore(poi: POI, preferences: UserPreferences): number {
    let score = this.calculatePOIScore(poi);

    // Interest matching bonus
    const interestBonus = this.getInterestMatchBonus(poi, preferences.interests);
    score += interestBonus;

    // Activity level matching
    const activityBonus = this.getActivityLevelBonus(poi, preferences.activityLevel);
    score += activityBonus;

    // Accessibility bonus
    if (preferences.accessibility && this.isPOIAccessible(poi)) {
      score += 15;
    }

    return Math.max(0, Math.min(100, score));
  }

  private getInterestMatchBonus(poi: POI, interests: string[]): number {
    const categoryInterestMap: Record<string, string[]> = {
      'attraction': ['sightseeing', 'photography', 'nature'],
      'viewpoint': ['photography', 'nature', 'hiking'],
      'religious': ['culture', 'spirituality', 'history'],
      'historical': ['history', 'culture', 'education'],
      'food': ['food', 'culture'],
      'transport': ['adventure', 'sightseeing']
    };

    const poiInterests = categoryInterestMap[poi.category] || [];
    const matchCount = interests.filter(interest => 
      poiInterests.some(poiInterest => 
        poiInterest.toLowerCase().includes(interest.toLowerCase()) ||
        interest.toLowerCase().includes(poiInterest.toLowerCase())
      )
    ).length;

    return matchCount * 10;
  }

  private getActivityLevelBonus(poi: POI, activityLevel: string): number {
    // High activity level prefers hiking, adventure
    if (activityLevel === 'high') {
      if (poi.category === 'viewpoint' || poi.area === 'Đỉnh núi') return 10;
    }
    
    // Low activity level prefers accessible attractions
    if (activityLevel === 'low') {
      if (poi.category === 'transport' || poi.area === 'Chân núi') return 10;
    }

    return 0;
  }

  private isPOIAccessible(poi: POI): boolean {
    // Consider POIs accessible if they're at the base or have transport access
    return poi.area === 'Chân núi' || 
           poi.category === 'transport' || 
           poi.walkable_to?.includes('6'); // Connected to cable car station
  }

  private isPOISuitableForWeather(poi: POI, weather: WeatherData): boolean {
    switch (weather.condition) {
      case 'rainy':
        return poi.category === 'religious' || 
               poi.category === 'food' || 
               poi.area === 'Chân núi'; // Indoor or covered areas
      
      case 'sunny':
        return poi.category === 'viewpoint' || 
               poi.category === 'attraction';
      
      case 'cloudy':
        return true; // Most activities suitable
      
      default:
        return poi.category !== 'viewpoint'; // Avoid viewpoints in bad weather
    }
  }

  private getPOIWeatherSuitability(poi: POI, weather: WeatherData): 'excellent' | 'good' | 'fair' | 'poor' {
    if (weather.condition === 'stormy') return 'poor';
    
    if (weather.condition === 'rainy') {
      return (poi.category === 'religious' || poi.area === 'Chân núi') ? 'good' : 'poor';
    }
    
    if (weather.condition === 'sunny' && poi.category === 'viewpoint') {
      return weather.visibility > 8 ? 'excellent' : 'good';
    }
    
    return 'good';
  }

  private generatePOIReasons(poi: POI, distance: number): string[] {
    const reasons: string[] = [];
    
    if (distance < 0.5) {
      reasons.push('Rất gần vị trí của bạn');
    } else if (distance < 2) {
      reasons.push('Gần vị trí của bạn');
    }
    
    if (poi.featured) {
      reasons.push('Điểm tham quan nổi bật');
    }
    
    if (poi.audio_url) {
      reasons.push('Có thuyết minh âm thanh');
    }
    
    // Category-specific reasons
    switch (poi.category) {
      case 'viewpoint':
        reasons.push('Tầm nhìn đẹp');
        break;
      case 'religious':
        reasons.push('Không gian tâm linh');
        break;
      case 'historical':
        reasons.push('Giá trị lịch sử');
        break;
      case 'attraction':
        reasons.push('Điểm tham quan hấp dẫn');
        break;
    }
    
    return reasons;
  }

  private generateWeatherPOIReasons(poi: POI, weather: WeatherData): string[] {
    const reasons: string[] = [];
    
    if (weather.condition === 'sunny' && poi.category === 'viewpoint') {
      reasons.push('Thời tiết đẹp, tầm nhìn xa');
    }
    
    if (weather.condition === 'rainy' && poi.category === 'religious') {
      reasons.push('Có mái che, phù hợp thời tiết mưa');
    }
    
    if (weather.temperature < 25 && poi.area === 'Đỉnh núi') {
      reasons.push('Nhiệt độ mát mẻ, phù hợp leo núi');
    }
    
    return reasons;
  }

  private generateInterestReasons(poi: POI, interests: string[]): string[] {
    const reasons: string[] = [];
    
    interests.forEach(interest => {
      switch (interest.toLowerCase()) {
        case 'photography':
          if (poi.category === 'viewpoint' || poi.category === 'attraction') {
            reasons.push('Lý tưởng cho chụp ảnh');
          }
          break;
        case 'history':
          if (poi.category === 'historical' || poi.category === 'religious') {
            reasons.push('Giá trị lịch sử văn hóa');
          }
          break;
        case 'nature':
          if (poi.category === 'viewpoint' || poi.area === 'Đỉnh núi') {
            reasons.push('Gần gũi với thiên nhiên');
          }
          break;
        case 'spirituality':
          if (poi.category === 'religious') {
            reasons.push('Không gian tâm linh');
          }
          break;
      }
    });
    
    return reasons;
  }

  private matchesUserInterests(poi: POI, interests: string[]): boolean {
    return interests.some(interest => {
      switch (interest.toLowerCase()) {
        case 'photography':
          return poi.category === 'viewpoint' || poi.category === 'attraction';
        case 'history':
          return poi.category === 'historical' || poi.category === 'religious';
        case 'nature':
          return poi.category === 'viewpoint' || poi.area === 'Đỉnh núi';
        case 'spirituality':
          return poi.category === 'religious';
        case 'adventure':
          return poi.category === 'transport' || poi.area === 'Đỉnh núi';
        default:
          return false;
      }
    });
  }

  private calculateRestaurantScore(restaurant: Restaurant, preferences?: UserPreferences): number {
    let score = 50;
    
    if (restaurant.featured) score += 20;
    if (restaurant.rating && restaurant.rating > 4) score += 15;
    if (preferences?.budgetRange === restaurant.price_range) score += 10;
    
    return Math.max(0, Math.min(100, score));
  }

  private calculateAccommodationScore(accommodation: Accommodation, preferences?: UserPreferences): number {
    let score = 50;
    
    if (accommodation.featured) score += 20;
    if (accommodation.stars && accommodation.stars >= 4) score += 15;
    if (preferences?.budgetRange === accommodation.price_range) score += 10;
    
    return Math.max(0, Math.min(100, score));
  }

  private calculateTimeBasedScore(poi: POI, timeOfDay: string): number {
    let score = this.calculatePOIScore(poi);
    
    // Time-specific bonuses
    if (timeOfDay === 'morning' && (poi.category === 'viewpoint' || poi.category === 'religious')) {
      score += 15;
    }
    
    if (timeOfDay === 'evening' && poi.category === 'viewpoint') {
      score += 20; // Sunset viewing
    }
    
    return score;
  }

  private getActivityScore(suitability: string): number {
    const scores = {
      excellent: 90,
      good: 75,
      fair: 60,
      poor: 30
    };
    return scores[suitability as keyof typeof scores] || 50;
  }

  private estimateVisitTime(poi: POI): number {
    // Estimate visit time in minutes based on POI type
    switch (poi.category) {
      case 'viewpoint': return 30;
      case 'religious': return 45;
      case 'historical': return 60;
      case 'attraction': return 90;
      case 'transport': return 15;
      default: return 30;
    }
  }

  private generateBudgetReasons(restaurant: Restaurant, budgetRange: string): string[] {
    const reasons = [`Phù hợp ngân sách ${this.getBudgetLabel(budgetRange)}`];
    if (restaurant.featured) reasons.push('Nhà hàng được đề xuất');
    return reasons;
  }

  private generateGroupAccommodationReasons(accommodation: Accommodation, groupType: string): string[] {
    const reasons = [`Phù hợp cho ${this.getGroupTypeLabel(groupType)}`];
    if (accommodation.featured) reasons.push('Nơi lưu trú được đề xuất');
    return reasons;
  }

  private isAccommodationSuitableForGroup(accommodation: Accommodation, groupType: string): boolean {
    // Simple logic - in real app would be more sophisticated
    return true; // All accommodations suitable for now
  }

  private getBudgetLabel(budgetRange: string): string {
    const labels = {
      budget: 'tiết kiệm',
      'mid-range': 'trung bình',
      luxury: 'cao cấp'
    };
    return labels[budgetRange as keyof typeof labels] || budgetRange;
  }

  private getGroupTypeLabel(groupType: string): string {
    const labels = {
      solo: 'du lịch một mình',
      couple: 'cặp đôi',
      family: 'gia đình',
      group: 'nhóm bạn'
    };
    return labels[groupType as keyof typeof labels] || groupType;
  }

  private getTimeOfDayLabel(timeOfDay: string): string {
    const labels = {
      morning: 'buổi sáng',
      afternoon: 'buổi chiều',
      evening: 'buổi tối',
      night: 'ban đêm'
    };
    return labels[timeOfDay as keyof typeof labels] || timeOfDay;
  }

  private getTimeOfDayIcon(timeOfDay: string): string {
    const icons = {
      morning: '🌅',
      afternoon: '☀️',
      evening: '🌅',
      night: '🌙'
    };
    return icons[timeOfDay as keyof typeof icons] || '🕐';
  }
}

// Export singleton instance
export const recommendationService = new RecommendationService();
export default recommendationService;