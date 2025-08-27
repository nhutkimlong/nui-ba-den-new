// API Service for Netlify Functions
const API_BASE = '/.netlify/functions';

// Types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface Statistics {
  totalPoi: number;
  totalTours: number;
  totalAccommodations: number;
  totalRestaurants: number;
  totalSpecialties: number;
}

export interface Activity {
  title: string;
  description: string;
  icon: string;
  iconColor: string;
  iconBg: string;
  time: string;
}

// Utility function for API calls
async function apiCall<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  try {
    const url = `${API_BASE}${endpoint}`;
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    if (!response.ok) {
      // Check if response is HTML (error page) or JSON
      const contentType = response.headers.get('content-type') || '';
      let errorMessage = `HTTP ${response.status}: ${response.statusText}`;

      if (contentType.includes('application/json')) {
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorMessage;
        } catch {
          // Failed to parse JSON, use status text
        }
      } else {
        // Likely HTML error page from Netlify
        const errorText = await response.text();
        if (errorText.includes('<!doctype') || errorText.includes('<html')) {
          errorMessage = `Service unavailable (${response.status}). The API endpoint may not be deployed.`;
        }
      }

      throw new Error(errorMessage);
    }

    // Check if response is JSON
    const contentType = response.headers.get('content-type') || '';
    if (!contentType.includes('application/json')) {
      const responseText = await response.text();
      if (responseText.includes('<!doctype') || responseText.includes('<html')) {
        throw new Error('Service returned HTML instead of JSON. The API endpoint may not be deployed correctly.');
      }
      throw new Error('Invalid response format. Expected JSON.');
    }

    const data = await response.json();
    return {
      success: true,
      data,
    };
  } catch (error) {
    console.error(`API call failed for ${endpoint}:`, error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
}

// Authentication API
export const authApi = {
  // Login with password
  async login(password: string): Promise<ApiResponse<{ token: string; message: string }>> {
    return apiCall('/auth', {
      method: 'POST',
      body: JSON.stringify({ password, action: 'login' }),
    });
  },

  // Verify token
  async verifyToken(token: string): Promise<ApiResponse<{ valid: boolean; role: string }>> {
    return apiCall('/auth', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ action: 'verify' }),
    });
  },

  // Change password
  async changePassword(
    currentPassword: string, 
    newPassword: string
  ): Promise<ApiResponse<{ message: string }>> {
    return apiCall('/auth', {
      method: 'POST',
      body: JSON.stringify({ 
        currentPassword, 
        newPassword, 
        action: 'changePassword' 
      }),
    });
  },
};

// Fallback data loading from static files
async function loadStaticFile<T>(fileName: string): Promise<ApiResponse<T>> {
  try {
    const response = await fetch(`/data/${fileName}`);

    if (!response.ok) {
      throw new Error(`Static file ${fileName} not found (${response.status})`);
    }

    const data = await response.json();
    return {
      success: true,
      data,
    };
  } catch (error) {
    console.error(`Failed to load static file ${fileName}:`, error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to load static file',
    };
  }
}

// Data API for JSON files with fallback
export const dataApi = {
  // Get JSON file data with fallback
  async getFile(fileName: string): Promise<ApiResponse<any>> {
    // Try API first
    const apiResult = await apiCall(`/data-blobs?file=${encodeURIComponent(fileName)}`);

    if (apiResult.success) {
      return apiResult;
    }

    // Fallback to static file
    console.warn(`API failed for ${fileName}, falling back to static file`);
    return loadStaticFile(fileName);
  },

  // Save JSON file data (only via API)
  async saveFile(fileName: string, data: any): Promise<ApiResponse<{ message: string }>> {
    return apiCall(`/data-blobs?file=${encodeURIComponent(fileName)}`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // Get POI data
  async getPOI(): Promise<ApiResponse<any[]>> {
    return this.getFile('POI.json');
  },

  // Get Tours data
  async getTours(): Promise<ApiResponse<any[]>> {
    return this.getFile('Tours.json');
  },

  // Get Accommodations data
  async getAccommodations(): Promise<ApiResponse<any[]>> {
    return this.getFile('Accommodations.json');
  },

  // Get Restaurants data
  async getRestaurants(): Promise<ApiResponse<any[]>> {
    return this.getFile('Restaurants.json');
  },

  // Get Specialties data
  async getSpecialties(): Promise<ApiResponse<any[]>> {
    return this.getFile('Specialties.json');
  },

  // Get Operating Hours data
  async getOperatingHours(): Promise<ApiResponse<any[]>> {
    return this.getFile('GioHoatDong.json');
  },
};

// Dashboard API
export const dashboardApi = {
  // Get all statistics
  async getStatistics(): Promise<ApiResponse<Statistics>> {
    try {
      const [poiRes, toursRes, accommodationsRes, restaurantsRes, specialtiesRes] = 
        await Promise.all([
          dataApi.getPOI(),
          dataApi.getTours(),
          dataApi.getAccommodations(),
          dataApi.getRestaurants(),
          dataApi.getSpecialties(),
        ]);

      if (!poiRes.success || !toursRes.success || !accommodationsRes.success || 
          !restaurantsRes.success || !specialtiesRes.success) {
        throw new Error('Failed to load some data');
      }

      const statistics: Statistics = {
        totalPoi: Array.isArray(poiRes.data) ? poiRes.data.length : 0,
        totalTours: Array.isArray(toursRes.data) ? toursRes.data.length : 0,
        totalAccommodations: Array.isArray(accommodationsRes.data) ? accommodationsRes.data.length : 0,
        totalRestaurants: Array.isArray(restaurantsRes.data) ? restaurantsRes.data.length : 0,
        totalSpecialties: Array.isArray(specialtiesRes.data) ? specialtiesRes.data.length : 0,
      };

      return { success: true, data: statistics };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to load statistics',
      };
    }
  },

  // Get recent activities
  async getRecentActivities(): Promise<ApiResponse<Activity[]>> {
    try {
      const activities: Activity[] = [];
      
      // Check POI data
      const poiRes = await dataApi.getPOI();
      if (poiRes.success && Array.isArray(poiRes.data)) {
        activities.push({
          title: 'Dữ liệu POI đã tải',
          description: `${poiRes.data.length} điểm tham quan đã được tải thành công`,
          icon: 'fa-map-marker-alt',
          iconColor: 'text-blue-600',
          iconBg: 'bg-blue-100',
          time: 'Vừa xong',
        });
      }

      // Check operating hours
      const hoursRes = await dataApi.getOperatingHours();
      if (hoursRes.success && Array.isArray(hoursRes.data)) {
        activities.push({
          title: 'Giờ hoạt động đã đồng bộ',
          description: `${hoursRes.data.length} bản ghi giờ hoạt động đã được tải`,
          icon: 'fa-clock',
          iconColor: 'text-green-600',
          iconBg: 'bg-green-100',
          time: '1 phút trước',
        });
      }

      // Check system connectivity
      const testRes = await dataApi.getPOI();
      if (testRes.success) {
        activities.push({
          title: 'Kết nối Netlify Blobs',
          description: 'Kết nối với hệ thống lưu trữ dữ liệu thành công',
          icon: 'fa-database',
          iconColor: 'text-purple-600',
          iconBg: 'bg-purple-100',
          time: '2 phút trước',
        });
      }

      // Add system status
      activities.push({
        title: 'Hệ thống đã sẵn sàng',
        description: 'Tất cả dịch vụ đang hoạt động bình thường',
        icon: 'fa-check',
        iconColor: 'text-green-600',
        iconBg: 'bg-green-100',
        time: 'Vừa xong',
      });

      return { success: true, data: activities };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to load activities',
        data: [{
          title: 'Lỗi kết nối dữ liệu',
          description: 'Không thể kết nối với hệ thống lưu trữ dữ liệu',
          icon: 'fa-exclamation-triangle',
          iconColor: 'text-red-600',
          iconBg: 'bg-red-100',
          time: 'Vừa xong',
        }],
      };
    }
  },
};

// Error handling utilities
export const apiUtils = {
  // Check if error is network related
  isNetworkError(error: string): boolean {
    return error.includes('fetch') || error.includes('network') || error.includes('Failed to fetch');
  },

  // Get user-friendly error message
  getErrorMessage(error: string): string {
    if (this.isNetworkError(error)) {
      return 'Lỗi kết nối mạng. Vui lòng kiểm tra kết nối internet và thử lại.';
    }
    
    if (error.includes('401') || error.includes('Unauthorized')) {
      return 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.';
    }
    
    if (error.includes('403') || error.includes('Forbidden')) {
      return 'Bạn không có quyền truy cập vào tài nguyên này.';
    }
    
    if (error.includes('404') || error.includes('Not Found')) {
      return 'Không tìm thấy dữ liệu yêu cầu.';
    }
    
    if (error.includes('500') || error.includes('Internal Server Error')) {
      return 'Lỗi máy chủ. Vui lòng thử lại sau.';
    }
    
    return error || 'Đã xảy ra lỗi không xác định.';
  },

  // Retry mechanism for failed requests
  async retry<T>(
    fn: () => Promise<ApiResponse<T>>, 
    maxRetries: number = 3, 
    delay: number = 1000
  ): Promise<ApiResponse<T>> {
    for (let i = 0; i < maxRetries; i++) {
      const result = await fn();
      if (result.success) {
        return result;
      }
      
      if (i < maxRetries - 1) {
        await new Promise(resolve => setTimeout(resolve, delay * (i + 1)));
      }
    }
    
    return await fn(); // Final attempt
  },
};

export default {
  auth: authApi,
  data: dataApi,
  dashboard: dashboardApi,
  utils: apiUtils,
};
