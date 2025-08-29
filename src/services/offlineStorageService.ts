// Offline Storage Service for managing offline data and synchronization

export interface OfflineData {
  id: string;
  type: string;
  data: any;
  timestamp: number;
  lastModified: number;
  syncStatus: 'pending' | 'synced' | 'failed';
  version: number;
}

export interface SyncResult {
  success: boolean;
  syncedCount: number;
  failedCount: number;
  errors: string[];
}

class OfflineStorageService {
  private dbName = 'NuiBaDenOfflineDB';
  private dbVersion = 1;
  private db: IDBDatabase | null = null;

  constructor() {
    this.initializeDB();
  }

  private async initializeDB(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.dbVersion);

      request.onerror = () => {
        console.error('Failed to open IndexedDB:', request.error);
        reject(request.error);
      };

      request.onsuccess = () => {
        this.db = request.result;
        console.log('IndexedDB initialized successfully');
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        this.createObjectStores(db);
      };
    });
  }

  private createObjectStores(db: IDBDatabase): void {
    // Core data stores
    if (!db.objectStoreNames.contains('pois')) {
      const poisStore = db.createObjectStore('pois', { keyPath: 'id' });
      poisStore.createIndex('type', 'type', { unique: false });
      poisStore.createIndex('lastModified', 'lastModified', { unique: false });
    }

    if (!db.objectStoreNames.contains('tours')) {
      const toursStore = db.createObjectStore('tours', { keyPath: 'id' });
      toursStore.createIndex('category', 'category', { unique: false });
      toursStore.createIndex('lastModified', 'lastModified', { unique: false });
    }

    if (!db.objectStoreNames.contains('accommodations')) {
      const accommodationsStore = db.createObjectStore('accommodations', { keyPath: 'id' });
      accommodationsStore.createIndex('type', 'type', { unique: false });
      accommodationsStore.createIndex('lastModified', 'lastModified', { unique: false });
    }

    if (!db.objectStoreNames.contains('restaurants')) {
      const restaurantsStore = db.createObjectStore('restaurants', { keyPath: 'id' });
      restaurantsStore.createIndex('cuisine', 'cuisine', { unique: false });
      restaurantsStore.createIndex('lastModified', 'lastModified', { unique: false });
    }

    // User data stores
    if (!db.objectStoreNames.contains('userPreferences')) {
      db.createObjectStore('userPreferences', { keyPath: 'id' });
    }

    if (!db.objectStoreNames.contains('userHistory')) {
      const historyStore = db.createObjectStore('userHistory', { keyPath: 'id' });
      historyStore.createIndex('timestamp', 'timestamp', { unique: false });
      historyStore.createIndex('type', 'type', { unique: false });
    }

    if (!db.objectStoreNames.contains('favorites')) {
      const favoritesStore = db.createObjectStore('favorites', { keyPath: 'id' });
      favoritesStore.createIndex('itemId', 'itemId', { unique: false });
      favoritesStore.createIndex('type', 'type', { unique: false });
    }

    // Sync management
    if (!db.objectStoreNames.contains('syncQueue')) {
      const syncStore = db.createObjectStore('syncQueue', { keyPath: 'id' });
      syncStore.createIndex('syncStatus', 'syncStatus', { unique: false });
      syncStore.createIndex('timestamp', 'timestamp', { unique: false });
    }
  }

  private async ensureDB(): Promise<IDBDatabase> {
    if (!this.db) {
      await this.initializeDB();
    }
    if (!this.db) {
      throw new Error('Failed to initialize database');
    }
    return this.db;
  }

  // Generic CRUD operations
  async store(storeName: string, data: any): Promise<void> {
    const db = await this.ensureDB();
    const transaction = db.transaction([storeName], 'readwrite');
    const store = transaction.objectStore(storeName);

    const offlineData: OfflineData = {
      ...data,
      lastModified: Date.now(),
      syncStatus: 'pending',
      version: (data.version || 0) + 1
    };

    return new Promise((resolve, reject) => {
      const request = store.put(offlineData);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async get(storeName: string, id: string): Promise<OfflineData | null> {
    const db = await this.ensureDB();
    const transaction = db.transaction([storeName], 'readonly');
    const store = transaction.objectStore(storeName);

    return new Promise((resolve, reject) => {
      const request = store.get(id);
      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => reject(request.error);
    });
  }

  async getAll(storeName: string, filter?: { index: string; value: any }): Promise<OfflineData[]> {
    const db = await this.ensureDB();
    const transaction = db.transaction([storeName], 'readonly');
    const store = transaction.objectStore(storeName);

    return new Promise((resolve, reject) => {
      let request: IDBRequest;

      if (filter) {
        const index = store.index(filter.index);
        request = index.getAll(filter.value);
      } else {
        request = store.getAll();
      }

      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => reject(request.error);
    });
  }

  async delete(storeName: string, id: string): Promise<void> {
    const db = await this.ensureDB();
    const transaction = db.transaction([storeName], 'readwrite');
    const store = transaction.objectStore(storeName);

    return new Promise((resolve, reject) => {
      const request = store.delete(id);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async clear(storeName: string): Promise<void> {
    const db = await this.ensureDB();
    const transaction = db.transaction([storeName], 'readwrite');
    const store = transaction.objectStore(storeName);

    return new Promise((resolve, reject) => {
      const request = store.clear();
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  // Specialized methods for core data
  async storePOIs(pois: any[]): Promise<void> {
    const db = await this.ensureDB();
    const transaction = db.transaction(['pois'], 'readwrite');
    const store = transaction.objectStore('pois');

    for (const poi of pois) {
      const offlineData: OfflineData = {
        id: poi.id,
        type: 'poi',
        data: poi,
        timestamp: Date.now(),
        lastModified: Date.now(),
        syncStatus: 'synced',
        version: 1
      };
      store.put(offlineData);
    }

    return new Promise((resolve, reject) => {
      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error);
    });
  }

  async getPOIs(type?: string): Promise<any[]> {
    const filter = type ? { index: 'type', value: type } : undefined;
    const offlineData = await this.getAll('pois', filter);
    return offlineData.map(item => item.data);
  }

  async storeTours(tours: any[]): Promise<void> {
    const db = await this.ensureDB();
    const transaction = db.transaction(['tours'], 'readwrite');
    const store = transaction.objectStore('tours');

    for (const tour of tours) {
      const offlineData: OfflineData = {
        id: tour.id,
        type: 'tour',
        data: tour,
        timestamp: Date.now(),
        lastModified: Date.now(),
        syncStatus: 'synced',
        version: 1
      };
      store.put(offlineData);
    }

    return new Promise((resolve, reject) => {
      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error);
    });
  }

  async getTours(category?: string): Promise<any[]> {
    const filter = category ? { index: 'category', value: category } : undefined;
    const offlineData = await this.getAll('tours', filter);
    return offlineData.map(item => item.data);
  }

  // User data management
  async storeUserPreferences(preferences: any): Promise<void> {
    await this.store('userPreferences', {
      id: 'current',
      ...preferences
    });
  }

  async getUserPreferences(): Promise<any | null> {
    const data = await this.get('userPreferences', 'current');
    return data?.data || null;
  }

  async addToHistory(item: any): Promise<void> {
    const historyItem = {
      id: crypto.randomUUID(),
      itemId: item.id,
      type: item.type,
      data: item,
      timestamp: Date.now()
    };
    await this.store('userHistory', historyItem);
  }

  async getHistory(type?: string, limit: number = 50): Promise<any[]> {
    const filter = type ? { index: 'type', value: type } : undefined;
    const offlineData = await this.getAll('userHistory', filter);
    
    return offlineData
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, limit)
      .map(item => item.data);
  }

  async addToFavorites(item: any): Promise<void> {
    const favorite = {
      id: `${item.type}-${item.id}`,
      itemId: item.id,
      type: item.type,
      data: item,
      timestamp: Date.now()
    };
    await this.store('favorites', favorite);
  }

  async removeFromFavorites(itemId: string, type: string): Promise<void> {
    await this.delete('favorites', `${type}-${itemId}`);
  }

  async getFavorites(type?: string): Promise<any[]> {
    const filter = type ? { index: 'type', value: type } : undefined;
    const offlineData = await this.getAll('favorites', filter);
    return offlineData.map(item => item.data);
  }

  async isFavorite(itemId: string, type: string): Promise<boolean> {
    const favorite = await this.get('favorites', `${type}-${itemId}`);
    return favorite !== null;
  }

  // Sync management
  async addToSyncQueue(action: string, data: any): Promise<void> {
    const syncItem = {
      id: crypto.randomUUID(),
      action,
      data,
      timestamp: Date.now(),
      syncStatus: 'pending' as const,
      retryCount: 0
    };
    await this.store('syncQueue', syncItem);
  }

  async getSyncQueue(): Promise<OfflineData[]> {
    return this.getAll('syncQueue', { index: 'syncStatus', value: 'pending' });
  }

  async markSynced(id: string): Promise<void> {
    const item = await this.get('syncQueue', id);
    if (item) {
      item.syncStatus = 'synced';
      await this.store('syncQueue', item);
    }
  }

  async markSyncFailed(id: string): Promise<void> {
    const item = await this.get('syncQueue', id);
    if (item) {
      item.syncStatus = 'failed';
      await this.store('syncQueue', item);
    }
  }

  async processSyncQueue(): Promise<SyncResult> {
    const queue = await this.getSyncQueue();
    let syncedCount = 0;
    let failedCount = 0;
    const errors: string[] = [];

    for (const item of queue) {
      try {
        await this.processSyncItem(item);
        await this.markSynced(item.id);
        syncedCount++;
      } catch (error) {
        console.error('Sync failed for item:', item.id, error);
        await this.markSyncFailed(item.id);
        failedCount++;
        errors.push(`${item.id}: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }

    return {
      success: failedCount === 0,
      syncedCount,
      failedCount,
      errors
    };
  }

  private async processSyncItem(item: OfflineData): Promise<void> {
    // This would implement the actual sync logic based on the action type
    // For now, we'll just simulate the sync process
    console.log('Processing sync item:', item);
    
    // Simulate network request
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // In a real implementation, this would make actual API calls
    // based on the item.data.action and item.data.data
  }

  // Data freshness and cache management
  async isDataFresh(storeName: string, maxAge: number = 24 * 60 * 60 * 1000): Promise<boolean> {
    const data = await this.getAll(storeName);
    if (data.length === 0) return false;

    const oldestItem = data.reduce((oldest, current) => 
      current.lastModified < oldest.lastModified ? current : oldest
    );

    return (Date.now() - oldestItem.lastModified) < maxAge;
  }

  async getStorageSize(): Promise<number> {
    if (!('storage' in navigator) || !('estimate' in navigator.storage)) {
      return 0;
    }

    try {
      const estimate = await navigator.storage.estimate();
      return estimate.usage || 0;
    } catch (error) {
      console.error('Failed to get storage size:', error);
      return 0;
    }
  }

  async clearOldData(maxAge: number = 30 * 24 * 60 * 60 * 1000): Promise<void> {
    const stores = ['userHistory', 'syncQueue'];
    const cutoffTime = Date.now() - maxAge;

    for (const storeName of stores) {
      const data = await this.getAll(storeName);
      const oldItems = data.filter(item => item.timestamp < cutoffTime);
      
      for (const item of oldItems) {
        await this.delete(storeName, item.id);
      }
    }
  }
}

export const offlineStorageService = new OfflineStorageService();
export default offlineStorageService;