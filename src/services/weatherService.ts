// Weather Service for weather-based activity recommendations
export interface WeatherData {
  temperature: number;
  humidity: number;
  description: string;
  icon: string;
  windSpeed: number;
  visibility: number;
  uvIndex: number;
  condition: 'sunny' | 'cloudy' | 'rainy' | 'stormy' | 'foggy';
  timestamp: number;
}

export interface WeatherForecast {
  current: WeatherData;
  hourly: WeatherData[];
  daily: WeatherData[];
}

export interface ActivityRecommendation {
  activity: string;
  suitability: 'excellent' | 'good' | 'fair' | 'poor';
  reason: string;
  alternatives?: string[];
}

class WeatherService {
  private cache: Map<string, { data: WeatherData; timestamp: number }> = new Map();
  private readonly CACHE_DURATION = 10 * 60 * 1000; // 10 minutes
  private readonly BA_DEN_COORDS = { lat: 11.3746, lon: 106.1778 }; // Núi Bà Đen coordinates

  // Get current weather (mock implementation - in real app would use weather API)
  async getCurrentWeather(lat?: number, lon?: number): Promise<WeatherData> {
    const coords = lat && lon ? { lat, lon } : this.BA_DEN_COORDS;
    const cacheKey = `${coords.lat},${coords.lon}`;
    
    // Check cache first
    const cached = this.cache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
      return cached.data;
    }

    // Mock weather data - in real implementation, call weather API
    const mockWeather = this.generateMockWeather();
    
    // Cache the result
    this.cache.set(cacheKey, {
      data: mockWeather,
      timestamp: Date.now()
    });

    return mockWeather;
  }

  // Get weather-based activity recommendations
  async getActivityRecommendations(weather?: WeatherData): Promise<ActivityRecommendation[]> {
    const currentWeather = weather || await this.getCurrentWeather();
    const recommendations: ActivityRecommendation[] = [];

    // Cable car recommendations
    if (currentWeather.condition === 'sunny' && currentWeather.visibility > 5) {
      recommendations.push({
        activity: 'Đi cáp treo ngắm cảnh',
        suitability: 'excellent',
        reason: 'Thời tiết đẹp, tầm nhìn xa, lý tưởng để ngắm cảnh từ trên cao',
        alternatives: ['Chụp ảnh panorama', 'Ngắm hoàng hôn']
      });
    } else if (currentWeather.condition === 'cloudy' && currentWeather.visibility > 3) {
      recommendations.push({
        activity: 'Đi cáp treo ngắm cảnh',
        suitability: 'good',
        reason: 'Thời tiết mát mẻ, phù hợp đi cáp treo nhưng tầm nhìn có thể bị hạn chế',
        alternatives: ['Tham quan chùa', 'Khám phá hang động']
      });
    } else if (currentWeather.condition === 'rainy') {
      recommendations.push({
        activity: 'Đi cáp treo ngắm cảnh',
        suitability: 'poor',
        reason: 'Trời mưa, tầm nhìn kém và có thể nguy hiểm',
        alternatives: ['Tham quan bảo tàng', 'Nghỉ ngơi tại nhà hàng']
      });
    }

    // Hiking recommendations
    if (currentWeather.temperature < 30 && currentWeather.condition !== 'rainy') {
      recommendations.push({
        activity: 'Leo núi bộ',
        suitability: currentWeather.temperature < 25 ? 'excellent' : 'good',
        reason: currentWeather.temperature < 25 
          ? 'Nhiệt độ mát mẻ, lý tưởng cho hoạt động leo núi'
          : 'Nhiệt độ ổn, phù hợp leo núi nhưng cần mang nước',
        alternatives: ['Đi bộ đường mòn', 'Khám phá thiên nhiên']
      });
    } else if (currentWeather.temperature >= 30) {
      recommendations.push({
        activity: 'Leo núi bộ',
        suitability: 'fair',
        reason: 'Nhiệt độ cao, nên leo núi vào sáng sớm hoặc chiều mát',
        alternatives: ['Leo núi sáng sớm (5-7h)', 'Leo núi chiều mát (16-18h)']
      });
    }

    // Temple visiting recommendations
    if (currentWeather.condition !== 'stormy') {
      recommendations.push({
        activity: 'Tham quan chùa chiền',
        suitability: currentWeather.condition === 'rainy' ? 'excellent' : 'good',
        reason: currentWeather.condition === 'rainy'
          ? 'Thời tiết mưa, lý tưởng để tham quan các khu vực có mái che'
          : 'Thời tiết ổn định, phù hợp tham quan và chiêm bái',
        alternatives: ['Thiền định', 'Tìm hiểu lịch sử']
      });
    }

    // Photography recommendations
    if (currentWeather.condition === 'sunny' || currentWeather.condition === 'cloudy') {
      recommendations.push({
        activity: 'Chụp ảnh phong cảnh',
        suitability: currentWeather.condition === 'cloudy' ? 'excellent' : 'good',
        reason: currentWeather.condition === 'cloudy'
          ? 'Ánh sáng mềm mại từ mây che, lý tưởng cho chụp ảnh'
          : 'Ánh sáng tốt nhưng có thể hơi gắt, nên chụp vào sáng sớm hoặc chiều',
        alternatives: ['Chụp ảnh sunrise', 'Chụp ảnh sunset', 'Chụp ảnh macro']
      });
    }

    // Outdoor dining recommendations
    if (currentWeather.condition === 'sunny' && currentWeather.temperature < 32) {
      recommendations.push({
        activity: 'Ăn uống ngoài trời',
        suitability: 'excellent',
        reason: 'Thời tiết đẹp, nhiệt độ dễ chịu, lý tưởng cho bữa ăn ngoài trời',
        alternatives: ['Picnic', 'BBQ', 'Thưởng thức đặc sản địa phương']
      });
    } else if (currentWeather.condition === 'cloudy') {
      recommendations.push({
        activity: 'Ăn uống ngoài trời',
        suitability: 'good',
        reason: 'Thời tiết mát mẻ, phù hợp ăn uống ngoài trời',
        alternatives: ['Café sân vườn', 'Nhà hàng có không gian mở']
      });
    }

    return recommendations.sort((a, b) => {
      const suitabilityOrder = { excellent: 4, good: 3, fair: 2, poor: 1 };
      return suitabilityOrder[b.suitability] - suitabilityOrder[a.suitability];
    });
  }

  // Get weather condition icon
  getWeatherIcon(condition: string): string {
    const icons: Record<string, string> = {
      sunny: '☀️',
      cloudy: '☁️',
      rainy: '🌧️',
      stormy: '⛈️',
      foggy: '🌫️'
    };
    return icons[condition] || '🌤️';
  }

  // Get weather-appropriate clothing suggestions
  getClothingSuggestions(weather: WeatherData): string[] {
    const suggestions: string[] = [];

    if (weather.temperature < 20) {
      suggestions.push('Áo khoác nhẹ', 'Quần dài');
    } else if (weather.temperature < 25) {
      suggestions.push('Áo dài tay', 'Quần dài hoặc ngắn');
    } else if (weather.temperature < 30) {
      suggestions.push('Áo ngắn tay', 'Quần ngắn');
    } else {
      suggestions.push('Áo mỏng', 'Quần ngắn', 'Nón/mũ');
    }

    if (weather.condition === 'rainy') {
      suggestions.push('Áo mưa', 'Ô', 'Giày chống trượt');
    }

    if (weather.condition === 'sunny' && weather.uvIndex > 6) {
      suggestions.push('Kem chống nắng', 'Kính râm', 'Nón rộng vành');
    }

    if (weather.humidity > 80) {
      suggestions.push('Quần áo thoáng mát', 'Khăn lau mồ hôi');
    }

    return suggestions;
  }

  // Check if weather is suitable for specific activity
  isWeatherSuitableFor(activity: string, weather: WeatherData): boolean {
    switch (activity.toLowerCase()) {
      case 'hiking':
      case 'leo núi':
        return weather.condition !== 'rainy' && 
               weather.condition !== 'stormy' && 
               weather.temperature < 35;
      
      case 'cable car':
      case 'cáp treo':
        return weather.condition !== 'stormy' && 
               weather.visibility > 2;
      
      case 'photography':
      case 'chụp ảnh':
        return weather.condition !== 'stormy';
      
      case 'temple visit':
      case 'tham quan chùa':
        return weather.condition !== 'stormy';
      
      default:
        return weather.condition !== 'stormy';
    }
  }

  private generateMockWeather(): WeatherData {
    // Generate realistic weather data for Ba Den Mountain area
    const conditions: WeatherData['condition'][] = ['sunny', 'cloudy', 'rainy'];
    const condition = conditions[Math.floor(Math.random() * conditions.length)];
    
    let temperature = 25 + Math.random() * 10; // 25-35°C
    let humidity = 60 + Math.random() * 30; // 60-90%
    let visibility = 5 + Math.random() * 10; // 5-15km
    
    // Adjust based on condition
    if (condition === 'rainy') {
      temperature -= 3;
      humidity += 10;
      visibility -= 3;
    } else if (condition === 'cloudy') {
      temperature -= 1;
      humidity += 5;
      visibility -= 1;
    }

    return {
      temperature: Math.round(temperature),
      humidity: Math.round(Math.min(100, humidity)),
      description: this.getWeatherDescription(condition),
      icon: this.getWeatherIcon(condition),
      windSpeed: Math.round(5 + Math.random() * 15), // 5-20 km/h
      visibility: Math.round(Math.max(1, visibility)),
      uvIndex: condition === 'sunny' ? Math.round(6 + Math.random() * 5) : Math.round(2 + Math.random() * 4),
      condition,
      timestamp: Date.now()
    };
  }

  private getWeatherDescription(condition: WeatherData['condition']): string {
    const descriptions: Record<WeatherData['condition'], string> = {
      sunny: 'Trời nắng đẹp',
      cloudy: 'Trời nhiều mây',
      rainy: 'Có mưa',
      stormy: 'Có bão',
      foggy: 'Có sương mù'
    };
    return descriptions[condition];
  }
}

// Export singleton instance
export const weatherService = new WeatherService();
export default weatherService;