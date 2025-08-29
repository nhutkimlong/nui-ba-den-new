// React hook for PWA capabilities and management

import { useState, useEffect , useCallback} from 'react';
import { pwaService, PWACapabilities } from '../services/pwaService';
import { backgroundSyncService } from '../services/backgroundSyncService';
import { offlineStorageService } from '../services/offlineStorageService';

export interface PWAState {
  capabilities: PWACapabilities;
  isInstallable: boolean;
  isInstalled: boolean;
  isOnline: boolean;
  isLoading: boolean;
  cacheSize: number;
  syncStatus: {
    pending: number;
    running: number;
    completed: number;
    failed: number;
  };
  lastSyncTime: number | null;
}

export interface PWAActions {
  install: () => Promise<boolean>;
  checkForUpdates: () => Promise<boolean>;
  applyUpdate: () => Promise<void>;
  clearCache: () => Promise<void>;
  forceSyncAll: () => Promise<void>;
  forceSyncType: (type: string) => Promise<void>;
  refreshCacheSize: () => Promise<void>;
}

export function usePWA(): [PWAState, PWAActions] {
  const [state, setState] = useState<PWAState>({
    capabilities: {
      isInstallable: false,
      isInstalled: false,
      isOnline: navigator.onLine,
      hasNotificationPermission: false,
      hasLocationPermission: false,
      supportsPushNotifications: false,
      supportsBackgroundSync: false
    },
    isInstallable: false,
    isInstalled: false,
    isOnline: navigator.onLine,
    isLoading: true,
    cacheSize: 0,
    syncStatus: {
      pending: 0,
      running: 0,
      completed: 0,
      failed: 0
    },
    lastSyncTime: null
  });

  // Initialize PWA state
  useEffect(() => {
    const initializePWA = async () => {
      try {
        const capabilities = await pwaService.getCapabilities();
        const cacheSize = await pwaService.getCacheSize();
        const syncStatus = backgroundSyncService.getSyncStatus();

        setState(prev => ({
          ...prev,
          capabilities,
          isInstallable: capabilities.isInstallable,
          isInstalled: capabilities.isInstalled,
          isOnline: capabilities.isOnline,
          cacheSize,
          syncStatus,
          isLoading: false
        }));
      } catch (error) {
        console.error('Failed to initialize PWA state:', error);
        setState(prev => ({ ...prev, isLoading: false }));
      }
    };

    initializePWA();
  }, []);

  // Listen for PWA events
  useEffect(() => {
    const handleInstallAvailable = () => {
      setState(prev => ({ ...prev, isInstallable: true }));
    };

    const handleAppInstalled = () => {
      setState(prev => ({
        ...prev,
        isInstallable: false,
        isInstalled: true
      }));
    };

    const handleNetworkStatusChange = (event: CustomEvent) => {
      const { isOnline } = event.detail;
      setState(prev => ({ ...prev, isOnline }));
      
      if (isOnline) {
        // Trigger sync when coming back online
        backgroundSyncService.forceSyncAll().catch(console.error);
      }
    };

    const handleSyncSuccess = (event: CustomEvent) => {
      const syncStatus = backgroundSyncService.getSyncStatus();
      setState(prev => ({
        ...prev,
        syncStatus,
        lastSyncTime: Date.now()
      }));
    };

    const handleSyncFailed = (event: CustomEvent) => {
      const syncStatus = backgroundSyncService.getSyncStatus();
      setState(prev => ({ ...prev, syncStatus }));
    };

    const handleCacheUpdated = () => {
      // Refresh cache size when cache is updated
      pwaService.getCacheSize().then(cacheSize => {
        setState(prev => ({ ...prev, cacheSize }));
      });
    };

    // Add event listeners
    window.addEventListener('pwa-install-available', handleInstallAvailable);
    window.addEventListener('pwa-app-installed', handleAppInstalled);
    window.addEventListener('pwa-network-status-change', handleNetworkStatusChange as EventListener);
    window.addEventListener('background-sync-success', handleSyncSuccess as EventListener);
    window.addEventListener('background-sync-failed', handleSyncFailed as EventListener);
    window.addEventListener('pwa-cache-updated', handleCacheUpdated);

    return () => {
      window.removeEventListener('pwa-install-available', handleInstallAvailable);
      window.removeEventListener('pwa-app-installed', handleAppInstalled);
      window.removeEventListener('pwa-network-status-change', handleNetworkStatusChange as EventListener);
      window.removeEventListener('background-sync-success', handleSyncSuccess as EventListener);
      window.removeEventListener('background-sync-failed', handleSyncFailed as EventListener);
      window.removeEventListener('pwa-cache-updated', handleCacheUpdated);
    };
  }, []);

  // Periodic sync status updates
  useEffect(() => {
    const interval = setInterval(() => {
      const syncStatus = backgroundSyncService.getSyncStatus();
      setState(prev => ({ ...prev, syncStatus }));
    }, 5000); // Update every 5 seconds

    return () => clearInterval(interval);
  }, []);

  // Actions
  const install = useCallback(async (): Promise<boolean> => {
    try {
      const result = await pwaService.promptInstall();
      if (result) {
        setState(prev => ({
          ...prev,
          isInstallable: false,
          isInstalled: true
        }));
      }
      return result;
    } catch (error) {
      console.error('Failed to install PWA:', error);
      return false;
    }
  }, []);

  const checkForUpdates = useCallback(async (): Promise<boolean> => {
    try {
      return await pwaService.checkForUpdates();
    } catch (error) {
      console.error('Failed to check for updates:', error);
      return false;
    }
  }, []);

  const applyUpdate = useCallback(async (): Promise<void> => {
    try {
      await pwaService.applyUpdate();
    } catch (error) {
      console.error('Failed to apply update:', error);
      throw error;
    }
  }, []);

  const clearCache = useCallback(async (): Promise<void> => {
    try {
      await pwaService.clearCache();
      await offlineStorageService.clear('pois');
      await offlineStorageService.clear('tours');
      await offlineStorageService.clear('accommodations');
      await offlineStorageService.clear('restaurants');
      
      setState(prev => ({ ...prev, cacheSize: 0 }));
    } catch (error) {
      console.error('Failed to clear cache:', error);
      throw error;
    }
  }, []);

  const forceSyncAll = useCallback(async (): Promise<void> => {
    try {
      await backgroundSyncService.forceSyncAll();
      const syncStatus = backgroundSyncService.getSyncStatus();
      setState(prev => ({
        ...prev,
        syncStatus,
        lastSyncTime: Date.now()
      }));
    } catch (error) {
      console.error('Failed to force sync all:', error);
      throw error;
    }
  }, []);

  const forceSyncType = useCallback(async (type: string): Promise<void> => {
    try {
      await backgroundSyncService.forceSyncType(type);
      const syncStatus = backgroundSyncService.getSyncStatus();
      setState(prev => ({ ...prev, syncStatus }));
    } catch (error) {
      console.error(`Failed to force sync type ${type}:`, error);
      throw error;
    }
  }, []);

  const refreshCacheSize = useCallback(async (): Promise<void> => {
    try {
      const cacheSize = await pwaService.getCacheSize();
      setState(prev => ({ ...prev, cacheSize }));
    } catch (error) {
      console.error('Failed to refresh cache size:', error);
    }
  }, []);

  const actions: PWAActions = {
    install,
    checkForUpdates,
    applyUpdate,
    clearCache,
    forceSyncAll,
    forceSyncType,
    refreshCacheSize
  };

  return [state, actions];
}

// Additional hook for offline data management
export function useOfflineData() {
  const [isDataFresh, setIsDataFresh] = useState<Record<string, boolean>>({});
  const [storageSize, setStorageSize] = useState(0);

  useEffect(() => {
    const checkDataFreshness = async () => {
      const stores = ['pois', 'tours', 'accommodations', 'restaurants'];
      const freshness: Record<string, boolean> = {};

      for (const store of stores) {
        freshness[store] = await offlineStorageService.isDataFresh(store);
      }

      setIsDataFresh(freshness);
    };

    const updateStorageSize = async () => {
      const size = await offlineStorageService.getStorageSize();
      setStorageSize(size);
    };

    checkDataFreshness();
    updateStorageSize();

    // Check freshness periodically
    const interval = setInterval(() => {
      checkDataFreshness();
      updateStorageSize();
    }, 60000); // Check every minute

    return () => clearInterval(interval);
  }, []);

  const refreshData = useCallback(async (storeName: string) => {
    await backgroundSyncService.forceSyncType(storeName);
    setIsDataFresh(prev => ({ ...prev, [storeName]: true }));
  }, []);

  const clearOldData = useCallback(async () => {
    await offlineStorageService.clearOldData();
    const size = await offlineStorageService.getStorageSize();
    setStorageSize(size);
  }, []);

  return {
    isDataFresh,
    storageSize,
    refreshData,
    clearOldData
  };
}