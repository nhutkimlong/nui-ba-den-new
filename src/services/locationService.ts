// Location Service for geolocation and location-based features
export interface LocationCoordinates {
  latitude: number;
  longitude: number;
  accuracy?: number;
  timestamp?: number;
}

export interface LocationError {
  code: number;
  message: string;
}

export interface LocationOptions {
  enableHighAccuracy?: boolean;
  timeout?: number;
  maximumAge?: number;
}

class LocationService {
  private currentPosition: LocationCoordinates | null = null;
  private watchId: number | null = null;
  private callbacks: Set<(position: LocationCoordinates) => void> = new Set();
  private errorCallbacks: Set<(error: LocationError) => void> = new Set();

  // Get current position
  async getCurrentPosition(options: LocationOptions = {}): Promise<LocationCoordinates> {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject({
          code: 0,
          message: 'Geolocation is not supported by this browser'
        });
        return;
      }

      const defaultOptions: PositionOptions = {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000, // 5 minutes
        ...options
      };

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const coords: LocationCoordinates = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
            timestamp: position.timestamp
          };
          
          this.currentPosition = coords;
          resolve(coords);
        },
        (error) => {
          const locationError: LocationError = {
            code: error.code,
            message: this.getErrorMessage(error.code)
          };
          reject(locationError);
        },
        defaultOptions
      );
    });
  }

  // Watch position changes
  watchPosition(
    callback: (position: LocationCoordinates) => void,
    errorCallback?: (error: LocationError) => void,
    options: LocationOptions = {}
  ): number {
    if (!navigator.geolocation) {
      if (errorCallback) {
        errorCallback({
          code: 0,
          message: 'Geolocation is not supported by this browser'
        });
      }
      return -1;
    }

    this.callbacks.add(callback);
    if (errorCallback) {
      this.errorCallbacks.add(errorCallback);
    }

    const defaultOptions: PositionOptions = {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 60000, // 1 minute for watch
      ...options
    };

    this.watchId = navigator.geolocation.watchPosition(
      (position) => {
        const coords: LocationCoordinates = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          timestamp: position.timestamp
        };
        
        this.currentPosition = coords;
        this.callbacks.forEach(cb => cb(coords));
      },
      (error) => {
        const locationError: LocationError = {
          code: error.code,
          message: this.getErrorMessage(error.code)
        };
        this.errorCallbacks.forEach(cb => cb(locationError));
      },
      defaultOptions
    );

    return this.watchId;
  }

  // Stop watching position
  clearWatch(): void {
    if (this.watchId !== null) {
      navigator.geolocation.clearWatch(this.watchId);
      this.watchId = null;
    }
    this.callbacks.clear();
    this.errorCallbacks.clear();
  }

  // Get cached position
  getCachedPosition(): LocationCoordinates | null {
    return this.currentPosition;
  }

  // Calculate distance between two points (Haversine formula)
  calculateDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ): number {
    const R = 6371; // Earth's radius in kilometers
    const dLat = this.toRadians(lat2 - lat1);
    const dLon = this.toRadians(lon2 - lon1);
    
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRadians(lat1)) * Math.cos(this.toRadians(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // Distance in kilometers
  }

  // Calculate bearing between two points
  calculateBearing(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ): number {
    const dLon = this.toRadians(lon2 - lon1);
    const y = Math.sin(dLon) * Math.cos(this.toRadians(lat2));
    const x = Math.cos(this.toRadians(lat1)) * Math.sin(this.toRadians(lat2)) -
              Math.sin(this.toRadians(lat1)) * Math.cos(this.toRadians(lat2)) * Math.cos(dLon);
    
    let bearing = Math.atan2(y, x);
    bearing = this.toDegrees(bearing);
    return (bearing + 360) % 360; // Normalize to 0-360
  }

  // Check if location is within bounds
  isWithinBounds(
    lat: number,
    lon: number,
    bounds: {
      north: number;
      south: number;
      east: number;
      west: number;
    }
  ): boolean {
    return lat >= bounds.south && 
           lat <= bounds.north && 
           lon >= bounds.west && 
           lon <= bounds.east;
  }

  // Get location permission status
  async getPermissionStatus(): Promise<PermissionState> {
    if (!navigator.permissions) {
      return 'prompt';
    }

    try {
      const permission = await navigator.permissions.query({ name: 'geolocation' });
      return permission.state;
    } catch (error) {
      return 'prompt';
    }
  }

  // Request location permission
  async requestPermission(): Promise<boolean> {
    try {
      const position = await this.getCurrentPosition();
      return true;
    } catch (error) {
      return false;
    }
  }

  private toRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
  }

  private toDegrees(radians: number): number {
    return radians * (180 / Math.PI);
  }

  private getErrorMessage(code: number): string {
    switch (code) {
      case 1:
        return 'Người dùng từ chối chia sẻ vị trí';
      case 2:
        return 'Không thể xác định vị trí';
      case 3:
        return 'Hết thời gian chờ xác định vị trí';
      default:
        return 'Lỗi không xác định khi xác định vị trí';
    }
  }
}

// Export singleton instance
export const locationService = new LocationService();
export default locationService;