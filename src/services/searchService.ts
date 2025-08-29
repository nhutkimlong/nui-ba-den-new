// Smart search service with auto-complete and suggestions
import { POI, Restaurant, Accommodation, Tour, Specialty } from '@/types';
import { dataApi } from './api';

export interface SearchResult {
  id: string;
  type: 'poi' | 'restaurant' | 'accommodation' | 'tour' | 'specialty';
  title: string;
  subtitle?: string;
  description?: string;
  category?: string;
  area?: string;
  image?: string;
  score: number;
  matchedFields: string[];
  item: POI | Restaurant | Accommodation | Tour | Specialty;
}

export interface SearchSuggestion {
  text: string;
  type: 'query' | 'category' | 'area' | 'recent' | 'popular';
  count?: number;
  icon?: string;
}

export interface SearchFilters {
  type?: string[];
  category?: string[];
  area?: string[];
  featured?: boolean;
  minScore?: number;
}

export interface SearchOptions {
  limit?: number;
  includeDescription?: boolean;
  fuzzyMatch?: boolean;
  filters?: SearchFilters;
  sortBy?: 'relevance' | 'name' | 'distance' | 'popularity';
}

class SearchService {
  private searchData: {
    pois: POI[];
    restaurants: Restaurant[];
    accommodations: Accommodation[];
    tours: Tour[];
    specialties: Specialty[];
  } = {
    pois: [],
    restaurants: [],
    accommodations: [],
    tours: [],
    specialties: []
  };

  private searchHistory: string[] = [];
  private popularSearches: Map<string, number> = new Map();
  private dataLoaded = false;

  // Initialize search data
  async initialize(): Promise<void> {
    if (this.dataLoaded) return;

    try {
      const [poiRes, restaurantRes, accommodationRes, tourRes, specialtyRes] = await Promise.all([
        dataApi.getPOI(),
        dataApi.getRestaurants(),
        dataApi.getAccommodations(),
        dataApi.getTours(),
        dataApi.getSpecialties()
      ]);

      if (poiRes.success) this.searchData.pois = poiRes.data || [];
      if (restaurantRes.success) this.searchData.restaurants = restaurantRes.data || [];
      if (accommodationRes.success) this.searchData.accommodations = accommodationRes.data || [];
      if (tourRes.success) this.searchData.tours = tourRes.data || [];
      if (specialtyRes.success) this.searchData.specialties = specialtyRes.data || [];

      // Load search history from localStorage
      this.loadSearchHistory();
      this.loadPopularSearches();

      this.dataLoaded = true;
    } catch (error) {
      console.error('Failed to initialize search service:', error);
    }
  }

  // Main search function
  async search(query: string, options: SearchOptions = {}): Promise<SearchResult[]> {
    await this.initialize();

    if (!query.trim()) return [];

    const {
      limit = 20,
      includeDescription = true,
      fuzzyMatch = true,
      filters = {},
      sortBy = 'relevance'
    } = options;

    // Record search query
    this.recordSearch(query);

    const results: SearchResult[] = [];
    const normalizedQuery = this.normalizeQuery(query);

    // Search POIs
    if (!filters.type || filters.type.includes('poi')) {
      const poiResults = this.searchPOIs(normalizedQuery, includeDescription, fuzzyMatch, filters);
      results.push(...poiResults);
    }

    // Search restaurants
    if (!filters.type || filters.type.includes('restaurant')) {
      const restaurantResults = this.searchRestaurants(normalizedQuery, includeDescription, fuzzyMatch, filters);
      results.push(...restaurantResults);
    }

    // Search accommodations
    if (!filters.type || filters.type.includes('accommodation')) {
      const accommodationResults = this.searchAccommodations(normalizedQuery, includeDescription, fuzzyMatch, filters);
      results.push(...accommodationResults);
    }

    // Search tours
    if (!filters.type || filters.type.includes('tour')) {
      const tourResults = this.searchTours(normalizedQuery, includeDescription, fuzzyMatch, filters);
      results.push(...tourResults);
    }

    // Search specialties
    if (!filters.type || filters.type.includes('specialty')) {
      const specialtyResults = this.searchSpecialties(normalizedQuery, includeDescription, fuzzyMatch, filters);
      results.push(...specialtyResults);
    }

    // Sort and limit results
    const sortedResults = this.sortResults(results, sortBy);
    return sortedResults.slice(0, limit);
  }

  // Get search suggestions
  async getSuggestions(query: string, limit: number = 10): Promise<SearchSuggestion[]> {
    await this.initialize();

    const suggestions: SearchSuggestion[] = [];
    const normalizedQuery = this.normalizeQuery(query);

    if (!query.trim()) {
      // Return recent and popular searches when no query
      suggestions.push(...this.getRecentSearchSuggestions(limit / 2));
      suggestions.push(...this.getPopularSearchSuggestions(limit / 2));
      return suggestions.slice(0, limit);
    }

    // Query-based suggestions
    suggestions.push(...this.getQuerySuggestions(normalizedQuery, query));
    
    // Category suggestions
    suggestions.push(...this.getCategorySuggestions(normalizedQuery));
    
    // Area suggestions
    suggestions.push(...this.getAreaSuggestions(normalizedQuery));
    
    // Name-based suggestions
    suggestions.push(...this.getNameSuggestions(normalizedQuery));

    // Remove duplicates and sort by relevance
    const uniqueSuggestions = this.deduplicateSuggestions(suggestions);
    return uniqueSuggestions.slice(0, limit);
  }

  // Get auto-complete suggestions
  async getAutoComplete(query: string, limit: number = 5): Promise<string[]> {
    await this.initialize();

    if (!query.trim()) return [];

    const normalizedQuery = this.normalizeQuery(query);
    const completions: Set<string> = new Set();

    // Get completions from all data sources
    [...this.searchData.pois, ...this.searchData.restaurants, ...this.searchData.accommodations, 
     ...this.searchData.tours, ...this.searchData.specialties].forEach(item => {
      const name = 'name' in item ? item.name : '';
      const nameEn = 'name_en' in item ? item.name_en : '';
      
      if (name && this.normalizeQuery(name).includes(normalizedQuery)) {
        completions.add(name);
      }
      if (nameEn && this.normalizeQuery(nameEn).includes(normalizedQuery)) {
        completions.add(nameEn);
      }
    });

    // Add category and area completions
    this.getAllCategories().forEach(category => {
      if (this.normalizeQuery(category).includes(normalizedQuery)) {
        completions.add(category);
      }
    });

    this.getAllAreas().forEach(area => {
      if (this.normalizeQuery(area).includes(normalizedQuery)) {
        completions.add(area);
      }
    });

    return Array.from(completions).slice(0, limit);
  }

  // Get search filters based on current results
  getAvailableFilters(results: SearchResult[]): {
    types: { value: string; label: string; count: number }[];
    categories: { value: string; label: string; count: number }[];
    areas: { value: string; label: string; count: number }[];
  } {
    const typeCounts = new Map<string, number>();
    const categoryCounts = new Map<string, number>();
    const areaCounts = new Map<string, number>();

    results.forEach(result => {
      // Count types
      typeCounts.set(result.type, (typeCounts.get(result.type) || 0) + 1);
      
      // Count categories
      if (result.category) {
        categoryCounts.set(result.category, (categoryCounts.get(result.category) || 0) + 1);
      }
      
      // Count areas
      if (result.area) {
        areaCounts.set(result.area, (areaCounts.get(result.area) || 0) + 1);
      }
    });

    return {
      types: Array.from(typeCounts.entries()).map(([value, count]) => ({
        value,
        label: this.getTypeLabel(value),
        count
      })),
      categories: Array.from(categoryCounts.entries()).map(([value, count]) => ({
        value,
        label: this.getCategoryLabel(value),
        count
      })),
      areas: Array.from(areaCounts.entries()).map(([value, count]) => ({
        value,
        label: value,
        count
      }))
    };
  }

  // Clear search history
  clearSearchHistory(): void {
    this.searchHistory = [];
    localStorage.removeItem('ba_den_search_history');
  }

  // Get search statistics
  getSearchStats(): {
    totalSearches: number;
    uniqueQueries: number;
    topQueries: { query: string; count: number }[];
  } {
    return {
      totalSearches: Array.from(this.popularSearches.values()).reduce((sum, count) => sum + count, 0),
      uniqueQueries: this.popularSearches.size,
      topQueries: Array.from(this.popularSearches.entries())
        .map(([query, count]) => ({ query, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10)
    };
  }

  // Private methods
  private searchPOIs(query: string, includeDescription: boolean, fuzzyMatch: boolean, filters: SearchFilters): SearchResult[] {
    return this.searchData.pois
      .filter(poi => this.matchesFilters(poi, filters, 'poi'))
      .map(poi => {
        const score = this.calculatePOIScore(poi, query, includeDescription, fuzzyMatch);
        if (score === 0) return null;

        return {
          id: `poi-${poi.id}`,
          type: 'poi' as const,
          title: poi.name,
          subtitle: poi.name_en,
          description: poi.description,
          category: poi.category,
          area: poi.area,
          image: poi.imageurl,
          score,
          matchedFields: this.getMatchedFields(poi, query, includeDescription),
          item: poi
        };
      })
      .filter(result => result !== null);
  }

  private searchRestaurants(query: string, includeDescription: boolean, fuzzyMatch: boolean, filters: SearchFilters): SearchResult[] {
    return this.searchData.restaurants
      .filter(restaurant => restaurant.isActive && this.matchesFilters(restaurant, filters, 'restaurant'))
      .map(restaurant => {
        const score = this.calculateRestaurantScore(restaurant, query, includeDescription, fuzzyMatch);
        if (score === 0) return null;

        return {
          id: `restaurant-${restaurant.id}`,
          type: 'restaurant' as const,
          title: restaurant.name,
          subtitle: restaurant.cuisine,
          description: restaurant.description,
          category: 'restaurant',
          area: restaurant.address,
          image: restaurant.image,
          score,
          matchedFields: this.getMatchedFields(restaurant, query, includeDescription),
          item: restaurant
        };
      })
      .filter(result => result !== null);
  }

  private searchAccommodations(query: string, includeDescription: boolean, fuzzyMatch: boolean, filters: SearchFilters): SearchResult[] {
    return this.searchData.accommodations
      .filter(accommodation => accommodation.isActive && this.matchesFilters(accommodation, filters, 'accommodation'))
      .map(accommodation => {
        const score = this.calculateAccommodationScore(accommodation, query, includeDescription, fuzzyMatch);
        if (score === 0) return null;

        return {
          id: `accommodation-${accommodation.id}`,
          type: 'accommodation' as const,
          title: accommodation.name,
          subtitle: accommodation.type ? this.getAccommodationTypeLabel(accommodation.type) : undefined,
          description: accommodation.description,
          category: 'accommodation',
          area: accommodation.address,
          image: accommodation.image,
          score,
          matchedFields: this.getMatchedFields(accommodation, query, includeDescription),
          item: accommodation
        };
      })
      .filter(result => result !== null);
  }

  private searchTours(query: string, includeDescription: boolean, fuzzyMatch: boolean, filters: SearchFilters): SearchResult[] {
    return this.searchData.tours
      .filter(tour => tour.isActive && this.matchesFilters(tour, filters, 'tour'))
      .map(tour => {
        const score = this.calculateTourScore(tour, query, includeDescription, fuzzyMatch);
        if (score === 0) return null;

        return {
          id: `tour-${tour.id}`,
          type: 'tour' as const,
          title: tour.name,
          subtitle: tour.duration,
          description: tour.description,
          category: 'tour',
          image: tour.image,
          score,
          matchedFields: this.getMatchedFields(tour, query, includeDescription),
          item: tour
        };
      })
      .filter(result => result !== null);
  }

  private searchSpecialties(query: string, includeDescription: boolean, fuzzyMatch: boolean, filters: SearchFilters): SearchResult[] {
    return this.searchData.specialties
      .filter(specialty => specialty.isActive && this.matchesFilters(specialty, filters, 'specialty'))
      .map(specialty => {
        const score = this.calculateSpecialtyScore(specialty, query, includeDescription, fuzzyMatch);
        if (score === 0) return null;

        return {
          id: `specialty-${specialty.id}`,
          type: 'specialty' as const,
          title: specialty.name,
          subtitle: specialty.category,
          description: specialty.description,
          category: specialty.category || 'specialty',
          area: specialty.location,
          image: specialty.image,
          score,
          matchedFields: this.getMatchedFields(specialty, query, includeDescription),
          item: specialty
        };
      })
      .filter(result => result !== null);
  }

  private calculatePOIScore(poi: POI, query: string, includeDescription: boolean, fuzzyMatch: boolean): number {
    let score = 0;
    const normalizedQuery = this.normalizeQuery(query);

    // Exact name match (highest score)
    if (this.normalizeQuery(poi.name).includes(normalizedQuery)) {
      score += 100;
    }
    if (poi.name_en && this.normalizeQuery(poi.name_en).includes(normalizedQuery)) {
      score += 90;
    }

    // Category match
    if (this.normalizeQuery(poi.category).includes(normalizedQuery)) {
      score += 70;
    }

    // Area match
    if (poi.area && this.normalizeQuery(poi.area).includes(normalizedQuery)) {
      score += 60;
    }

    // Description match (if enabled)
    if (includeDescription && poi.description && this.normalizeQuery(poi.description).includes(normalizedQuery)) {
      score += 40;
    }
    if (includeDescription && poi.description_en && this.normalizeQuery(poi.description_en).includes(normalizedQuery)) {
      score += 35;
    }

    // Featured bonus
    if (poi.featured) {
      score += 20;
    }

    // Audio guide bonus
    if (poi.audio_url) {
      score += 10;
    }

    // Fuzzy matching (if enabled and no exact matches)
    if (fuzzyMatch && score === 0) {
      const fuzzyScore = this.calculateFuzzyScore(poi.name, query);
      if (fuzzyScore > 0.6) {
        score = Math.round(fuzzyScore * 50);
      }
    }

    return score;
  }

  private calculateRestaurantScore(restaurant: Restaurant, query: string, includeDescription: boolean, fuzzyMatch: boolean): number {
    let score = 0;
    const normalizedQuery = this.normalizeQuery(query);

    // Name match
    if (this.normalizeQuery(restaurant.name).includes(normalizedQuery)) {
      score += 100;
    }

    // Cuisine match
    if (this.normalizeQuery(restaurant.cuisine).includes(normalizedQuery)) {
      score += 80;
    }

    // Address match
    if (restaurant.address && this.normalizeQuery(restaurant.address).includes(normalizedQuery)) {
      score += 60;
    }

    // Description match
    if (includeDescription && restaurant.description && this.normalizeQuery(restaurant.description).includes(normalizedQuery)) {
      score += 40;
    }

    // Featured bonus
    if (restaurant.featured) {
      score += 20;
    }

    // Rating bonus
    if (restaurant.rating && restaurant.rating >= 4) {
      score += 15;
    }

    // Fuzzy matching
    if (fuzzyMatch && score === 0) {
      const fuzzyScore = this.calculateFuzzyScore(restaurant.name, query);
      if (fuzzyScore > 0.6) {
        score = Math.round(fuzzyScore * 50);
      }
    }

    return score;
  }

  private calculateAccommodationScore(accommodation: Accommodation, query: string, includeDescription: boolean, fuzzyMatch: boolean): number {
    let score = 0;
    const normalizedQuery = this.normalizeQuery(query);

    // Name match
    if (this.normalizeQuery(accommodation.name).includes(normalizedQuery)) {
      score += 100;
    }

    // Type match
    if (accommodation.type && this.normalizeQuery(accommodation.type).includes(normalizedQuery)) {
      score += 80;
    }

    // Address match
    if (accommodation.address && this.normalizeQuery(accommodation.address).includes(normalizedQuery)) {
      score += 60;
    }

    // Description match
    if (includeDescription && accommodation.description && this.normalizeQuery(accommodation.description).includes(normalizedQuery)) {
      score += 40;
    }

    // Featured bonus
    if (accommodation.featured) {
      score += 20;
    }

    // Stars bonus
    if (accommodation.stars && accommodation.stars >= 4) {
      score += 15;
    }

    // Fuzzy matching
    if (fuzzyMatch && score === 0) {
      const fuzzyScore = this.calculateFuzzyScore(accommodation.name, query);
      if (fuzzyScore > 0.6) {
        score = Math.round(fuzzyScore * 50);
      }
    }

    return score;
  }

  private calculateTourScore(tour: Tour, query: string, includeDescription: boolean, fuzzyMatch: boolean): number {
    let score = 0;
    const normalizedQuery = this.normalizeQuery(query);

    // Name match
    if (this.normalizeQuery(tour.name).includes(normalizedQuery)) {
      score += 100;
    }

    // Duration match
    if (this.normalizeQuery(tour.duration).includes(normalizedQuery)) {
      score += 70;
    }

    // Activities match
    if (tour.activities && this.normalizeQuery(tour.activities).includes(normalizedQuery)) {
      score += 60;
    }

    // Description match
    if (includeDescription && this.normalizeQuery(tour.description).includes(normalizedQuery)) {
      score += 40;
    }

    // Featured bonus
    if (tour.featured) {
      score += 20;
    }

    // Fuzzy matching
    if (fuzzyMatch && score === 0) {
      const fuzzyScore = this.calculateFuzzyScore(tour.name, query);
      if (fuzzyScore > 0.6) {
        score = Math.round(fuzzyScore * 50);
      }
    }

    return score;
  }

  private calculateSpecialtyScore(specialty: Specialty, query: string, includeDescription: boolean, fuzzyMatch: boolean): number {
    let score = 0;
    const normalizedQuery = this.normalizeQuery(query);

    // Name match
    if (this.normalizeQuery(specialty.name).includes(normalizedQuery)) {
      score += 100;
    }

    // Category match
    if (specialty.category && this.normalizeQuery(specialty.category).includes(normalizedQuery)) {
      score += 80;
    }

    // Location match
    if (specialty.location && this.normalizeQuery(specialty.location).includes(normalizedQuery)) {
      score += 60;
    }

    // Description match
    if (includeDescription && this.normalizeQuery(specialty.description).includes(normalizedQuery)) {
      score += 40;
    }

    // Featured bonus
    if (specialty.featured) {
      score += 20;
    }

    // Fuzzy matching
    if (fuzzyMatch && score === 0) {
      const fuzzyScore = this.calculateFuzzyScore(specialty.name, query);
      if (fuzzyScore > 0.6) {
        score = Math.round(fuzzyScore * 50);
      }
    }

    return score;
  }

  private calculateFuzzyScore(text: string, query: string): number {
    // Simple fuzzy matching using Levenshtein distance
    const normalizedText = this.normalizeQuery(text);
    const normalizedQuery = this.normalizeQuery(query);
    
    if (normalizedText.length === 0 || normalizedQuery.length === 0) return 0;
    
    const distance = this.levenshteinDistance(normalizedText, normalizedQuery);
    const maxLength = Math.max(normalizedText.length, normalizedQuery.length);
    
    return 1 - (distance / maxLength);
  }

  private levenshteinDistance(str1: string, str2: string): number {
    const matrix = Array(str2.length + 1).fill(null).map(() => Array(str1.length + 1).fill(null));
    
    for (let i = 0; i <= str1.length; i++) matrix[0][i] = i;
    for (let j = 0; j <= str2.length; j++) matrix[j][0] = j;
    
    for (let j = 1; j <= str2.length; j++) {
      for (let i = 1; i <= str1.length; i++) {
        const indicator = str1[i - 1] === str2[j - 1] ? 0 : 1;
        matrix[j][i] = Math.min(
          matrix[j][i - 1] + 1,
          matrix[j - 1][i] + 1,
          matrix[j - 1][i - 1] + indicator
        );
      }
    }
    
    return matrix[str2.length][str1.length];
  }

  private getMatchedFields(item: any, query: string, includeDescription: boolean): string[] {
    const fields: string[] = [];
    const normalizedQuery = this.normalizeQuery(query);

    if (item.name && this.normalizeQuery(item.name).includes(normalizedQuery)) {
      fields.push('name');
    }
    if (item.name_en && this.normalizeQuery(item.name_en).includes(normalizedQuery)) {
      fields.push('name_en');
    }
    if (item.category && this.normalizeQuery(item.category).includes(normalizedQuery)) {
      fields.push('category');
    }
    if (item.area && this.normalizeQuery(item.area).includes(normalizedQuery)) {
      fields.push('area');
    }
    if (item.cuisine && this.normalizeQuery(item.cuisine).includes(normalizedQuery)) {
      fields.push('cuisine');
    }
    if (includeDescription && item.description && this.normalizeQuery(item.description).includes(normalizedQuery)) {
      fields.push('description');
    }

    return fields;
  }

  private matchesFilters(item: any, filters: SearchFilters, type: string): boolean {
    if (filters.featured !== undefined && item.featured !== filters.featured) {
      return false;
    }

    if (filters.category && filters.category.length > 0) {
      const itemCategory = item.category || type;
      if (!filters.category.includes(itemCategory)) {
        return false;
      }
    }

    if (filters.area && filters.area.length > 0) {
      const itemArea = item.area || item.address || item.location;
      if (!itemArea || !filters.area.some(area => itemArea.includes(area))) {
        return false;
      }
    }

    return true;
  }

  private sortResults(results: SearchResult[], sortBy: string): SearchResult[] {
    switch (sortBy) {
      case 'name':
        return results.sort((a, b) => a.title.localeCompare(b.title));
      case 'popularity':
        return results.sort((a, b) => {
          const aFeatured = 'featured' in a.item ? a.item.featured : false;
          const bFeatured = 'featured' in b.item ? b.item.featured : false;
          if (aFeatured !== bFeatured) return bFeatured ? 1 : -1;
          return b.score - a.score;
        });
      case 'relevance':
      default:
        return results.sort((a, b) => b.score - a.score);
    }
  }

  private getQuerySuggestions(normalizedQuery: string, originalQuery: string): SearchSuggestion[] {
    const suggestions: SearchSuggestion[] = [];
    
    // Add the original query as a suggestion
    if (originalQuery.length > 2) {
      suggestions.push({
        text: originalQuery,
        type: 'query',
        icon: '🔍'
      });
    }

    return suggestions;
  }

  private getCategorySuggestions(normalizedQuery: string): SearchSuggestion[] {
    const categories = this.getAllCategories();
    return categories
      .filter(category => this.normalizeQuery(category).includes(normalizedQuery))
      .map(category => ({
        text: category,
        type: 'category' as const,
        icon: this.getCategoryIcon(category)
      }));
  }

  private getAreaSuggestions(normalizedQuery: string): SearchSuggestion[] {
    const areas = this.getAllAreas();
    return areas
      .filter(area => this.normalizeQuery(area).includes(normalizedQuery))
      .map(area => ({
        text: area,
        type: 'area' as const,
        icon: '📍'
      }));
  }

  private getNameSuggestions(normalizedQuery: string): SearchSuggestion[] {
    const suggestions: SearchSuggestion[] = [];
    const allItems = [
      ...this.searchData.pois,
      ...this.searchData.restaurants,
      ...this.searchData.accommodations,
      ...this.searchData.tours,
      ...this.searchData.specialties
    ];

    allItems.forEach(item => {
      const name = 'name' in item ? item.name : '';
      if (name && this.normalizeQuery(name).includes(normalizedQuery)) {
        suggestions.push({
          text: name,
          type: 'query',
          icon: '🏷️'
        });
      }
    });

    return suggestions.slice(0, 5);
  }

  private getRecentSearchSuggestions(limit: number): SearchSuggestion[] {
    return this.searchHistory
      .slice(-limit)
      .reverse()
      .map(query => ({
        text: query,
        type: 'recent' as const,
        icon: '🕐'
      }));
  }

  private getPopularSearchSuggestions(limit: number): SearchSuggestion[] {
    return Array.from(this.popularSearches.entries())
      .sort(([, a], [, b]) => b - a)
      .slice(0, limit)
      .map(([query, count]) => ({
        text: query,
        type: 'popular' as const,
        count,
        icon: '🔥'
      }));
  }

  private deduplicateSuggestions(suggestions: SearchSuggestion[]): SearchSuggestion[] {
    const seen = new Set<string>();
    return suggestions.filter(suggestion => {
      const key = suggestion.text.toLowerCase();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }

  private recordSearch(query: string): void {
    const trimmedQuery = query.trim();
    if (!trimmedQuery) return;

    // Add to search history
    this.searchHistory = this.searchHistory.filter(q => q !== trimmedQuery);
    this.searchHistory.push(trimmedQuery);
    if (this.searchHistory.length > 50) {
      this.searchHistory = this.searchHistory.slice(-50);
    }

    // Update popular searches
    this.popularSearches.set(trimmedQuery, (this.popularSearches.get(trimmedQuery) || 0) + 1);

    // Save to localStorage
    this.saveSearchHistory();
    this.savePopularSearches();
  }

  private loadSearchHistory(): void {
    try {
      const history = localStorage.getItem('ba_den_search_history');
      if (history) {
        this.searchHistory = JSON.parse(history);
      }
    } catch (error) {
      console.warn('Failed to load search history:', error);
    }
  }

  private saveSearchHistory(): void {
    try {
      localStorage.setItem('ba_den_search_history', JSON.stringify(this.searchHistory));
    } catch (error) {
      console.warn('Failed to save search history:', error);
    }
  }

  private loadPopularSearches(): void {
    try {
      const popular = localStorage.getItem('ba_den_popular_searches');
      if (popular) {
        const data = JSON.parse(popular);
        this.popularSearches = new Map(Object.entries(data));
      }
    } catch (error) {
      console.warn('Failed to load popular searches:', error);
    }
  }

  private savePopularSearches(): void {
    try {
      const data = Object.fromEntries(this.popularSearches);
      localStorage.setItem('ba_den_popular_searches', JSON.stringify(data));
    } catch (error) {
      console.warn('Failed to save popular searches:', error);
    }
  }

  private normalizeQuery(text: string): string {
    return text
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Remove diacritics
      .replace(/[^\w\s]/g, '') // Remove special characters
      .trim();
  }

  private getAllCategories(): string[] {
    const categories = new Set<string>();
    
    this.searchData.pois.forEach(poi => categories.add(poi.category));
    this.searchData.restaurants.forEach(restaurant => categories.add('restaurant'));
    this.searchData.accommodations.forEach(accommodation => {
      categories.add('accommodation');
      if (accommodation.type) categories.add(accommodation.type);
    });
    this.searchData.tours.forEach(tour => categories.add('tour'));
    this.searchData.specialties.forEach(specialty => {
      categories.add('specialty');
      if (specialty.category) categories.add(specialty.category);
    });

    return Array.from(categories);
  }

  private getAllAreas(): string[] {
    const areas = new Set<string>();
    
    this.searchData.pois.forEach(poi => {
      if (poi.area) areas.add(poi.area);
    });
    this.searchData.restaurants.forEach(restaurant => {
      if (restaurant.address) areas.add(restaurant.address);
    });
    this.searchData.accommodations.forEach(accommodation => {
      if (accommodation.address) areas.add(accommodation.address);
    });
    this.searchData.specialties.forEach(specialty => {
      if (specialty.location) areas.add(specialty.location);
    });

    return Array.from(areas);
  }

  private getTypeLabel(type: string): string {
    const labels: Record<string, string> = {
      poi: 'Điểm tham quan',
      restaurant: 'Nhà hàng',
      accommodation: 'Nơi lưu trú',
      tour: 'Tour du lịch',
      specialty: 'Đặc sản'
    };
    return labels[type] || type;
  }

  private getCategoryLabel(category: string): string {
    const labels: Record<string, string> = {
      attraction: 'Tham quan',
      viewpoint: 'Ngắm cảnh',
      religious: 'Tâm linh',
      historical: 'Di tích',
      food: 'Ẩm thực',
      transport: 'Di chuyển',
      parking: 'Bãi xe',
      amenities: 'Tiện ích',
      restaurant: 'Nhà hàng',
      accommodation: 'Nơi lưu trú',
      tour: 'Tour du lịch',
      specialty: 'Đặc sản'
    };
    return labels[category] || category;
  }

  private getCategoryIcon(category: string): string {
    const icons: Record<string, string> = {
      attraction: '🏛️',
      viewpoint: '🏔️',
      religious: '🏛️',
      historical: '🏛️',
      food: '🍽️',
      transport: '🚠',
      parking: '🅿️',
      amenities: '🏪',
      restaurant: '🍽️',
      accommodation: '🏨',
      tour: '🎯',
      specialty: '🎁'
    };
    return icons[category] || '📍';
  }

  private getAccommodationTypeLabel(type: string): string {
    const labels: Record<string, string> = {
      hotel: 'Khách sạn',
      resort: 'Resort',
      guesthouse: 'Nhà khách',
      camping: 'Cắm trại'
    };
    return labels[type] || type;
  }
}

// Export singleton instance
export const searchService = new SearchService();
export default searchService;