import { useState, useEffect, useCallback } from 'react';
import { GpsSettings, Notification, RegistrationData, MemberData, CertificateResult } from '../types/climb';
import { DEFAULT_GPS_SETTINGS, COMBINED_API_URL, GOOGLE_SCRIPT_URL } from '../utils/climbUtils';

interface CombinedData {
  notifications: {
    data: Notification[];
    lastModified: string;
  };
  gpsSettings: {
    data: GpsSettings;
    lastModified: string;
  };
}

export const useClimbData = () => {
  const [gpsSettings, setGpsSettings] = useState<GpsSettings>(DEFAULT_GPS_SETTINGS);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load all data from combined API
  const loadAllDataFromAPI = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(COMBINED_API_URL);
      if (!response.ok) {
        throw new Error('Failed to fetch combined data');
      }
      
      const result: CombinedData = await response.json();
      
      // Check if we have cached data to compare
      const cachedData = localStorage.getItem('combinedDataCache');
      if (cachedData) {
        const cached = JSON.parse(cachedData);
        const notificationsChanged = cached.notifications.lastModified !== result.notifications.lastModified;
        const gpsChanged = cached.gpsSettings.lastModified !== result.gpsSettings.lastModified;
        
        if (!notificationsChanged && !gpsChanged) {
          // Use cached data
          setGpsSettings(cached.gpsSettings.data);
          setNotifications(cached.notifications.data.filter((n: Notification) => n.active));
          setLoading(false);
          return;
        }
      }
      
      // Save new data to cache
      localStorage.setItem('combinedDataCache', JSON.stringify({
        notifications: result.notifications,
        gpsSettings: result.gpsSettings
      }));
      
      // Process GPS settings
      setGpsSettings(result.gpsSettings.data);
      localStorage.setItem('gpsSettings', JSON.stringify(result.gpsSettings.data));
      
      // Process notifications
      const activeNotifications = result.notifications.data.filter((n: Notification) => n.active);
      setNotifications(activeNotifications);
      localStorage.setItem('climbNotifications', JSON.stringify(activeNotifications));
      
    } catch (error) {
      console.error('Error loading combined data:', error);

      // Fallback to localStorage first
      const storedSettings = localStorage.getItem('gpsSettings');
      const storedNotifications = localStorage.getItem('climbNotifications');

      if (storedSettings || storedNotifications) {
        // We have some cached data, use it
        if (storedSettings) {
          setGpsSettings(JSON.parse(storedSettings));
        }
        if (storedNotifications) {
          setNotifications(JSON.parse(storedNotifications));
        }
        setError(null); // Clear error since we have cached data
      } else {
        // No cached data, use defaults but don't show error
        setGpsSettings(DEFAULT_GPS_SETTINGS);
        setNotifications([]);
        setError(null); // Don't show error for first time users
      }
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch members list for selection
  const fetchMembersList = useCallback(async (phoneNumber: string): Promise<MemberData[]> => {
    const fetchUrl = new URL(GOOGLE_SCRIPT_URL);
    fetchUrl.searchParams.append('action', 'getMembersByPhone');
    fetchUrl.searchParams.append('phone', phoneNumber);

    const response = await fetch(fetchUrl.toString(), { method: 'GET' });
    if (!response.ok) {
      let serverErrorMsg = `Lỗi ${response.status}: ${response.statusText}`;
      try {
        const errResult = await response.json();
        serverErrorMsg = errResult.message || serverErrorMsg;
      } catch (e) {}
      throw new Error(serverErrorMsg);
    }

    const result = await response.json();
    if (result.success && Array.isArray(result.members)) {
      // Convert string array to MemberData array with id
      return result.members.map((name: string, index: number) => ({
        id: `member_${index}`,
        name: name,
        photoData: null
      }));
    } else {
      throw new Error(result.message || 'Không thể lấy danh sách thành viên.');
    }
  }, []);

  // Generate certificates
  const generateCertificates = useCallback(async (
    phoneNumber: string,
    selectedMembers: MemberData[]
  ): Promise<CertificateResult> => {
    // Convert MemberData to format expected by Google Script
    const membersForScript = selectedMembers.map(member => ({
      name: member.name,
      photoData: member.photoData || null
    }));
    
    const postData = {
      action: 'generateCertificatesWithPhotos',
      phone: phoneNumber,
      members: membersForScript,
      verificationMethod: 'gps'
    };

    const response = await fetch(GOOGLE_SCRIPT_URL, {
      method: 'POST',
      redirect: "follow",
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify(postData)
    });

    const result = await response.json();
    if (!result.success) {
      throw new Error(result.message || 'Không thể tạo chứng nhận.');
    }

    return result;
  }, []);

  // Register new climbing group
  const registerClimbingGroup = useCallback(async (
    registrationData: RegistrationData,
    signatureData: string
  ): Promise<{ success: boolean; message?: string }> => {
    const data = {
      action: 'register',
      ...registrationData,
      signatureData: signatureData,
      locationMethod: 'gps'
    };

    const response = await fetch(GOOGLE_SCRIPT_URL, {
      method: 'POST',
      redirect: "follow",
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify(data)
    });

    const result = await response.json();
    if (!result.success) {
      throw new Error(result.message || 'Đăng ký thất bại từ máy chủ.');
    }

    return result;
  }, []);

  // Refresh data
  const refreshData = useCallback(() => {
    localStorage.removeItem('combinedDataCache');
    loadAllDataFromAPI();
  }, [loadAllDataFromAPI]);

  // Load data on mount
  useEffect(() => {
    loadAllDataFromAPI();
  }, [loadAllDataFromAPI]);

  return {
    gpsSettings,
    notifications,
    loading,
    error,
    fetchMembersList,
    generateCertificates,
    registerClimbingGroup,
    refreshData
  };
};
