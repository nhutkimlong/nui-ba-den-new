// POI Types
export interface POI {
  id: number;
  name: string;
  name_en?: string;
  description?: string;
  description_en?: string;
  latitude: number;
  longitude: number;
  elevation?: number;
  category: string;
  iconurl?: string;
  imageurl?: string;
  area: string;
  walkable_to?: string;
  force_walkable_to?: string | null;
  cable_route?: string | null;
  audio_url?: string | null;
  audio_url_en?: string | null;
  featured?: boolean;
  operating_hours?: OperatingHoursData; // Link to operating hours data
  created_at?: string;
  updated_at?: string;
}

export interface OperatingHours {
  default?: string;
  mon?: string;
  tue?: string;
  wed?: string;
  thu?: string;
  fri?: string;
  sat?: string;
  sun?: string;
}

export interface DaySchedule {
  status: 'open' | 'closed' | 'ignore';
  open_time?: string;
  close_time?: string;
  notes?: string;
}

export interface ContactInfo {
  phone?: string;
  email?: string;
  website?: string;
}

// Tour Types
export interface Tour {
  id: string;
  name: string;
  name_en?: string;
  description: string;
  description_en?: string;
  duration: string;
  activities?: string;
  detailsLink?: string;
  image?: string;
  featured?: boolean;
  isActive?: boolean;
  created_at?: string;
  updated_at?: string;
}

// Accommodation Types
export interface Accommodation {
  id: string;
  name: string;
  name_en?: string;
  description?: string;
  description_en?: string;
  type?: 'hotel' | 'resort' | 'guesthouse' | 'camping';
  price_range?: 'budget' | 'mid-range' | 'luxury';
  stars?: number;
  contact?: ContactInfo;
  amenities?: string[];
  image?: string;
  address?: string;
  phone?: string;
  mapLink?: string;
  isActive: boolean;
  latitude?: number;
  longitude?: number;
  featured?: boolean;
  created_at?: string;
  updated_at?: string;
}

// Restaurant Types
export interface Restaurant {
  id: string;
  name: string;
  name_en?: string;
  description?: string;
  description_en?: string;
  cuisine: string;
  price_range?: 'budget' | 'mid-range' | 'luxury';
  rating?: number;
  contact?: ContactInfo;
  operating_hours?: OperatingHours;
  specialties?: string[];
  image?: string;
  address?: string;
  mapLink?: string;
  isActive: boolean;
  latitude?: number;
  longitude?: number;
  featured?: boolean;
  created_at?: string;
  updated_at?: string;
}

// Specialty Types
export interface Specialty {
  id: string;
  name: string;
  name_en?: string;
  description: string;
  description_en?: string;
  category?: 'food' | 'craft' | 'culture' | 'nature';
  location?: string;
  best_time?: string;
  image?: string;
  purchaseLocation?: string;
  isActive: boolean;
  featured?: boolean;
  created_at?: string;
  updated_at?: string;
}

// Operating Hours Data
export interface OperatingHoursData {
  id: number; // This is the POI ID
  operating_hours: string; // JSON string
  closed_dates?: string | null;
  status_message?: string | null;
  status_message_en?: string | null;
  "Ghi chú POI (Để tham khảo)"?: string;
}

// Climbing Registration Types
export interface ClimbingRegistration {
  id: number;
  name: string;
  email: string;
  phone: string;
  date: string;
  time: string;
  group_size: number;
  experience_level: 'beginner' | 'intermediate' | 'advanced';
  special_requirements?: string;
  status: 'pending' | 'approved' | 'rejected' | 'completed';
  created_at: string;
  updated_at?: string;
}

// Admin Types
export interface AdminUser {
  id: number;
  username: string;
  email: string;
  role: 'admin' | 'moderator';
  created_at: string;
  last_login?: string;
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Form Types
export interface FormField {
  name: string;
  label: string;
  type: 'text' | 'email' | 'password' | 'number' | 'textarea' | 'select' | 'checkbox' | 'file';
  required?: boolean;
  placeholder?: string;
  options?: { value: string; label: string }[];
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
    message?: string;
  };
}

// UI Types
export interface NavItem {
  label: string;
  path: string;
  icon?: string;
  children?: NavItem[];
}

export interface BreadcrumbItem {
  label: string;
  path?: string;
}

// Map Types
export interface MapMarker {
  id: number | string;
  position: [number, number];
  title: string;
  type: 'poi' | 'accommodation' | 'restaurant' | 'tour' | 'specialty';
  data: POI | Accommodation | Restaurant | Tour | Specialty;
}

// Filter Types
export interface FilterOption {
  value: string;
  label: string;
  count?: number;
}

export interface FilterState {
  category?: string;
  area?: string;
  price_range?: string;
  rating?: number;
  featured?: boolean;
  search?: string;
}
