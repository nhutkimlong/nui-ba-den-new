import { useState, useCallback } from 'react';
import { LocationData } from '../types/climb';
import { getDistanceFromLatLonInMeters, SUMMIT_LATITUDE, SUMMIT_LONGITUDE, REGISTRATION_LATITUDE, REGISTRATION_LONGITUDE } from '../utils/climbUtils';

export const useGeolocation = () => {
  const [location, setLocation] = useState<LocationData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getCurrentPosition = useCallback((): Promise<LocationData> => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Trình duyệt không hỗ trợ định vị'));
        return;
      }

      setLoading(true);
      setError(null);

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const locationData: LocationData = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy
          };
          setLocation(locationData);
          setLoading(false);
          resolve(locationData);
        },
        (error) => {
          let errorMessage = 'Lỗi định vị: ';
          switch (error.code) {
            case error.PERMISSION_DENIED:
              errorMessage += 'Quyền truy cập bị từ chối.';
              break;
            case error.POSITION_UNAVAILABLE:
              errorMessage += 'Thông tin vị trí không khả dụng.';
              break;
            case error.TIMEOUT:
              errorMessage += 'Yêu cầu vị trí hết thời gian chờ.';
              break;
            default:
              errorMessage += `Lỗi không xác định (${error.code}).`;
              break;
          }
          setError(errorMessage);
          setLoading(false);
          reject(new Error(errorMessage));
        },
        {
          enableHighAccuracy: true,
          timeout: 20000,
          maximumAge: 0
        }
      );
    });
  }, []);

  const checkRegistrationLocation = useCallback(async (radius: number): Promise<boolean> => {
    try {
      const position = await getCurrentPosition();
      const distance = getDistanceFromLatLonInMeters(
        position.latitude,
        position.longitude,
        REGISTRATION_LATITUDE,
        REGISTRATION_LONGITUDE
      );
      return distance <= radius;
    } catch (error) {
      throw error;
    }
  }, [getCurrentPosition]);

  const checkSummitLocation = useCallback(async (radius: number): Promise<boolean> => {
    try {
      const position = await getCurrentPosition();
      const distance = getDistanceFromLatLonInMeters(
        position.latitude,
        position.longitude,
        SUMMIT_LATITUDE,
        SUMMIT_LONGITUDE
      );
      return distance <= radius;
    } catch (error) {
      throw error;
    }
  }, [getCurrentPosition]);

  const getDistanceToSummit = useCallback((lat: number, lon: number): number => {
    return getDistanceFromLatLonInMeters(lat, lon, SUMMIT_LATITUDE, SUMMIT_LONGITUDE);
  }, []);

  const getDistanceToRegistration = useCallback((lat: number, lon: number): number => {
    return getDistanceFromLatLonInMeters(lat, lon, REGISTRATION_LATITUDE, REGISTRATION_LONGITUDE);
  }, []);

  return {
    location,
    loading,
    error,
    getCurrentPosition,
    checkRegistrationLocation,
    checkSummitLocation,
    getDistanceToSummit,
    getDistanceToRegistration
  };
};
