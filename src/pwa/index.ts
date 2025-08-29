// PWA Integration - Export all PWA-related functionality

// Services
export { pwaService } from '../services/pwaService';
export { offlineStorageService } from '../services/offlineStorageService';
export { backgroundSyncService } from '../services/backgroundSyncService';
export { appIconService } from '../services/appIconService';

// Hooks
export { usePWA, useOfflineData } from '../hooks/usePWA';

// Components
export { InstallPrompt, useInstallPrompt } from '../components/pwa/InstallPrompt';
export { SplashScreen, useSplashScreen } from '../components/pwa/SplashScreen';
export { 
  NativeGestures, 
  PageTransition, 
  BottomSheet, 
  PullToRefresh 
} from '../components/pwa/NativeGestures';

// Types
export type { 
  PWACapabilities, 
  OfflineAction 
} from '../services/pwaService';
export type { 
  OfflineData, 
  SyncResult 
} from '../services/offlineStorageService';
export type { 
  SyncConfig, 
  SyncTask 
} from '../services/backgroundSyncService';
export type { 
  IconConfig, 
  SplashScreenConfig 
} from '../services/appIconService';

// Initialize PWA features
export const initializePWA = async () => {
  console.log('Initializing PWA features...');
  
  // Services are automatically initialized when imported
  // Additional initialization logic can be added here if needed
  
  console.log('PWA features initialized successfully');
};