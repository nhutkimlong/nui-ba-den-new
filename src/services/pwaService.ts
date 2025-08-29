// PWA Service for managing PWA features and capabilities

export interface PWACapabilities {
  isInstallable: boolean;
  isInstalled: boolean;
  isOnline: boolean;
  hasNotificationPermission: boolean;
  hasLocationPermission: boolean;
  supportsPushNotifications: boolean;
  supportsBackgroundSync: boolean;
}

export interface OfflineAction {
  id: string;
  type: string;
  data: any;
  timestamp: number;
  retryCount: number;
}

class PWAService {
  private deferredPrompt: any = null;
  private offlineActions: OfflineAction[] = [];
  private readonly OFFLINE_ACTIONS_KEY = 'pwa-offline-actions';
  private readonly MAX_RETRY_COUNT = 3;

  constructor() {
    this.initializePWA();
    this.loadOfflineActions();
  }

  private initializePWA(): void {
    // Listen for beforeinstallprompt event
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      this.deferredPrompt = e;
      this.notifyInstallAvailable();
    });

    // Listen for app installed event
    window.addEventListener('appinstalled', () => {
      console.log('PWA was installed');
      this.deferredPrompt = null;
      this.notifyAppInstalled();
    });

    // Listen for online/offline events
    window.addEventListener('online', () => {
      this.handleOnline();
    });

    window.addEventListener('offline', () => {
      this.handleOffline();
    });

    // Register service worker message listener
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.addEventListener('message', (event) => {
        this.handleServiceWorkerMessage(event);
      });
    }
  }

  // Installation management
  async canInstall(): Promise<boolean> {
    return this.deferredPrompt !== null;
  }

  async isInstalled(): Promise<boolean> {
    if ('getInstalledRelatedApps' in navigator) {
      try {
        const relatedApps = await (navigator as any).getInstalledRelatedApps();
        return relatedApps.length > 0;
      } catch (error) {
        console.warn('Could not check installed apps:', error);
      }
    }

    // Fallback: check display mode
    return window.matchMedia('(display-mode: standalone)').matches ||
           window.matchMedia('(display-mode: fullscreen)').matches ||
           (window.navigator as any).standalone === true;
  }

  async promptInstall(): Promise<boolean> {
    if (!this.deferredPrompt) {
      throw new Error('Install prompt not available');
    }

    try {
      this.deferredPrompt.prompt();
      const { outcome } = await this.deferredPrompt.userChoice;
      
      if (outcome === 'accepted') {
        console.log('User accepted the install prompt');
        this.deferredPrompt = null;
        return true;
      } else {
        console.log('User dismissed the install prompt');
        return false;
      }
    } catch (error) {
      console.error('Error during install prompt:', error);
      return false;
    }
  }

  // Offline functionality
  async queueOfflineAction(type: string, data: any): Promise<void> {
    const action: OfflineAction = {
      id: crypto.randomUUID(),
      type,
      data,
      timestamp: Date.now(),
      retryCount: 0
    };

    this.offlineActions.push(action);
    await this.saveOfflineActions();

    // Try to register background sync if available
    if ('serviceWorker' in navigator && 'sync' in window.ServiceWorkerRegistration.prototype) {
      try {
        const registration = await navigator.serviceWorker.ready;
        await (registration as any).sync?.register('background-sync');
      } catch (error) {
        console.warn('Background sync registration failed:', error);
      }
    }
  }

  async processOfflineActions(): Promise<void> {
    if (!navigator.onLine || this.offlineActions.length === 0) {
      return;
    }

    const actionsToProcess = [...this.offlineActions];
    
    for (const action of actionsToProcess) {
      try {
        await this.processAction(action);
        this.removeOfflineAction(action.id);
      } catch (error) {
        console.error('Failed to process offline action:', error);
        
        action.retryCount++;
        if (action.retryCount >= this.MAX_RETRY_COUNT) {
          console.warn('Max retry count reached for action:', action.id);
          this.removeOfflineAction(action.id);
        }
      }
    }

    await this.saveOfflineActions();
  }

  private async processAction(action: OfflineAction): Promise<void> {
    switch (action.type) {
      case 'form-submission':
        await this.processFormSubmission(action.data);
        break;
      case 'user-preference':
        await this.processUserPreference(action.data);
        break;
      case 'location-update':
        await this.processLocationUpdate(action.data);
        break;
      default:
        console.warn('Unknown offline action type:', action.type);
    }
  }

  private async processFormSubmission(data: any): Promise<void> {
    const response = await fetch(data.url, {
      method: data.method || 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...data.headers
      },
      body: JSON.stringify(data.body)
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
  }

  private async processUserPreference(data: any): Promise<void> {
    // Process user preference updates
    const response = await fetch('/api/user/preferences', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      throw new Error(`Failed to update preferences: ${response.statusText}`);
    }
  }

  private async processLocationUpdate(data: any): Promise<void> {
    // Process location updates
    const response = await fetch('/api/user/location', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      throw new Error(`Failed to update location: ${response.statusText}`);
    }
  }

  private removeOfflineAction(id: string): void {
    this.offlineActions = this.offlineActions.filter(action => action.id !== id);
  }

  private async saveOfflineActions(): Promise<void> {
    try {
      localStorage.setItem(this.OFFLINE_ACTIONS_KEY, JSON.stringify(this.offlineActions));
    } catch (error) {
      console.error('Failed to save offline actions:', error);
    }
  }

  private loadOfflineActions(): void {
    try {
      const stored = localStorage.getItem(this.OFFLINE_ACTIONS_KEY);
      if (stored) {
        this.offlineActions = JSON.parse(stored);
      }
    } catch (error) {
      console.error('Failed to load offline actions:', error);
      this.offlineActions = [];
    }
  }

  // Network status
  isOnline(): boolean {
    return navigator.onLine;
  }

  private handleOnline(): void {
    console.log('App is online');
    this.processOfflineActions();
    this.notifyNetworkStatusChange(true);
  }

  private handleOffline(): void {
    console.log('App is offline');
    this.notifyNetworkStatusChange(false);
  }

  // Capabilities detection
  async getCapabilities(): Promise<PWACapabilities> {
    return {
      isInstallable: await this.canInstall(),
      isInstalled: await this.isInstalled(),
      isOnline: this.isOnline(),
      hasNotificationPermission: await this.hasNotificationPermission(),
      hasLocationPermission: await this.hasLocationPermission(),
      supportsPushNotifications: this.supportsPushNotifications(),
      supportsBackgroundSync: this.supportsBackgroundSync()
    };
  }

  private async hasNotificationPermission(): Promise<boolean> {
    if (!('Notification' in window)) {
      return false;
    }
    return Notification.permission === 'granted';
  }

  private async hasLocationPermission(): Promise<boolean> {
    if (!('geolocation' in navigator)) {
      return false;
    }

    try {
      const permission = await navigator.permissions.query({ name: 'geolocation' });
      return permission.state === 'granted';
    } catch (error) {
      return false;
    }
  }

  private supportsPushNotifications(): boolean {
    return 'serviceWorker' in navigator && 
           'PushManager' in window && 
           'Notification' in window;
  }

  private supportsBackgroundSync(): boolean {
    return 'serviceWorker' in navigator && 
           'sync' in window.ServiceWorkerRegistration.prototype;
  }

  // Cache management
  async getCacheSize(): Promise<number> {
    if (!('serviceWorker' in navigator)) {
      return 0;
    }

    try {
      const registration = await navigator.serviceWorker.ready;
      if (registration.active) {
        return new Promise((resolve) => {
          const messageChannel = new MessageChannel();
          messageChannel.port1.onmessage = (event) => {
            if (event.data.type === 'CACHE_SIZE') {
              resolve(event.data.size);
            }
          };

          registration.active.postMessage(
            { type: 'GET_CACHE_SIZE' },
            [messageChannel.port2]
          );
        });
      }
    } catch (error) {
      console.error('Failed to get cache size:', error);
    }

    return 0;
  }

  async clearCache(): Promise<void> {
    if ('caches' in window) {
      const cacheNames = await caches.keys();
      await Promise.all(
        cacheNames.map(cacheName => caches.delete(cacheName))
      );
    }
  }

  // Event notifications
  private notifyInstallAvailable(): void {
    window.dispatchEvent(new CustomEvent('pwa-install-available'));
  }

  private notifyAppInstalled(): void {
    window.dispatchEvent(new CustomEvent('pwa-app-installed'));
  }

  private notifyNetworkStatusChange(isOnline: boolean): void {
    window.dispatchEvent(new CustomEvent('pwa-network-status-change', {
      detail: { isOnline }
    }));
  }

  private handleServiceWorkerMessage(event: MessageEvent): void {
    const { data } = event;
    
    switch (data.type) {
      case 'CACHE_UPDATED':
        window.dispatchEvent(new CustomEvent('pwa-cache-updated', {
          detail: data.payload
        }));
        break;
      case 'OFFLINE_READY':
        window.dispatchEvent(new CustomEvent('pwa-offline-ready'));
        break;
      default:
        console.log('Unknown service worker message:', data);
    }
  }

  // Update management
  async checkForUpdates(): Promise<boolean> {
    if (!('serviceWorker' in navigator)) {
      return false;
    }

    try {
      const registration = await navigator.serviceWorker.getRegistration();
      if (registration) {
        await registration.update();
        return registration.waiting !== null;
      }
    } catch (error) {
      console.error('Failed to check for updates:', error);
    }

    return false;
  }

  async applyUpdate(): Promise<void> {
    if (!('serviceWorker' in navigator)) {
      return;
    }

    const registration = await navigator.serviceWorker.getRegistration();
    if (registration && registration.waiting) {
      registration.waiting.postMessage({ type: 'SKIP_WAITING' });
      window.location.reload();
    }
  }
}

export const pwaService = new PWAService();
export default pwaService;