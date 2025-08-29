// Background Sync Service for handling data synchronization

import { offlineStorageService } from './offlineStorageService';
import { pwaService } from './pwaService';

export interface SyncConfig {
  endpoint: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  headers?: Record<string, string>;
  retryAttempts: number;
  retryDelay: number;
}

export interface SyncTask {
  id: string;
  type: string;
  config: SyncConfig;
  data?: any;
  priority: 'low' | 'medium' | 'high';
  createdAt: number;
  lastAttempt?: number;
  attempts: number;
  status: 'pending' | 'running' | 'completed' | 'failed';
}

class BackgroundSyncService {
  private syncTasks: Map<string, SyncTask> = new Map();
  private isRunning = false;
  private syncInterval: number | null = null;
  private readonly SYNC_INTERVAL = 30000; // 30 seconds
  private readonly MAX_CONCURRENT_SYNCS = 3;

  constructor() {
    this.initializeSync();
  }

  private initializeSync(): void {
    // Listen for online events to trigger sync
    window.addEventListener('online', () => {
      this.startSync();
    });

    // Listen for visibility change to sync when app becomes visible
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden && navigator.onLine) {
        this.startSync();
      }
    });

    // Start periodic sync if online
    if (navigator.onLine) {
      this.startPeriodicSync();
    }
  }

  // Core data synchronization
  async syncCoreData(): Promise<void> {
    const syncTasks = [
      this.createSyncTask('pois', {
        endpoint: '/api/pois',
        method: 'GET',
        retryAttempts: 3,
        retryDelay: 1000
      }, 'high'),
      
      this.createSyncTask('tours', {
        endpoint: '/api/tours',
        method: 'GET',
        retryAttempts: 3,
        retryDelay: 1000
      }, 'high'),
      
      this.createSyncTask('accommodations', {
        endpoint: '/api/accommodations',
        method: 'GET',
        retryAttempts: 3,
        retryDelay: 1000
      }, 'medium'),
      
      this.createSyncTask('restaurants', {
        endpoint: '/api/restaurants',
        method: 'GET',
        retryAttempts: 3,
        retryDelay: 1000
      }, 'medium'),
      
      this.createSyncTask('specialties', {
        endpoint: '/api/specialties',
        method: 'GET',
        retryAttempts: 2,
        retryDelay: 2000
      }, 'low')
    ];

    await Promise.all(syncTasks.map(task => this.addSyncTask(task)));
  }

  async syncUserData(): Promise<void> {
    // Sync user preferences
    const preferences = await offlineStorageService.getUserPreferences();
    if (preferences) {
      const preferencesTask = this.createSyncTask('user-preferences', {
        endpoint: '/api/user/preferences',
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        retryAttempts: 3,
        retryDelay: 1000
      }, 'medium', preferences);

      await this.addSyncTask(preferencesTask);
    }

    // Sync favorites
    const favorites = await offlineStorageService.getFavorites();
    if (favorites.length > 0) {
      const favoritesTask = this.createSyncTask('user-favorites', {
        endpoint: '/api/user/favorites',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        retryAttempts: 3,
        retryDelay: 1000
      }, 'medium', { favorites });

      await this.addSyncTask(favoritesTask);
    }

    // Sync history
    const history = await offlineStorageService.getHistory();
    if (history.length > 0) {
      const historyTask = this.createSyncTask('user-history', {
        endpoint: '/api/user/history',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        retryAttempts: 2,
        retryDelay: 2000
      }, 'low', { history });

      await this.addSyncTask(historyTask);
    }
  }

  private createSyncTask(
    type: string,
    config: SyncConfig,
    priority: 'low' | 'medium' | 'high',
    data?: any
  ): SyncTask {
    return {
      id: crypto.randomUUID(),
      type,
      config,
      data,
      priority,
      createdAt: Date.now(),
      attempts: 0,
      status: 'pending'
    };
  }

  async addSyncTask(task: SyncTask): Promise<void> {
    this.syncTasks.set(task.id, task);
    
    // Store in offline storage for persistence
    await offlineStorageService.addToSyncQueue(task.type, {
      task,
      timestamp: Date.now()
    });

    // Start sync if not running
    if (!this.isRunning && navigator.onLine) {
      this.startSync();
    }
  }

  private async startSync(): Promise<void> {
    if (this.isRunning || !navigator.onLine) {
      return;
    }

    this.isRunning = true;
    console.log('Starting background sync...');

    try {
      await this.processSyncTasks();
    } catch (error) {
      console.error('Background sync error:', error);
    } finally {
      this.isRunning = false;
    }
  }

  private async processSyncTasks(): Promise<void> {
    const pendingTasks = Array.from(this.syncTasks.values())
      .filter(task => task.status === 'pending')
      .sort((a, b) => {
        // Sort by priority and creation time
        const priorityOrder = { high: 3, medium: 2, low: 1 };
        const priorityDiff = priorityOrder[b.priority] - priorityOrder[a.priority];
        if (priorityDiff !== 0) return priorityDiff;
        return a.createdAt - b.createdAt;
      });

    // Process tasks in batches
    const batches = this.createBatches(pendingTasks, this.MAX_CONCURRENT_SYNCS);
    
    for (const batch of batches) {
      await Promise.all(batch.map(task => this.processSyncTask(task)));
    }
  }

  private createBatches<T>(items: T[], batchSize: number): T[][] {
    const batches: T[][] = [];
    for (let i = 0; i < items.length; i += batchSize) {
      batches.push(items.slice(i, i + batchSize));
    }
    return batches;
  }

  private async processSyncTask(task: SyncTask): Promise<void> {
    if (!navigator.onLine) {
      return;
    }

    task.status = 'running';
    task.lastAttempt = Date.now();
    task.attempts++;

    try {
      const response = await this.executeSync(task);
      
      if (response.ok) {
        await this.handleSyncSuccess(task, response);
      } else {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
    } catch (error) {
      await this.handleSyncError(task, error);
    }
  }

  private async executeSync(task: SyncTask): Promise<Response> {
    const { config, data } = task;
    const requestOptions: RequestInit = {
      method: config.method,
      headers: {
        'Content-Type': 'application/json',
        ...config.headers
      }
    };

    if (data && (config.method === 'POST' || config.method === 'PUT')) {
      requestOptions.body = JSON.stringify(data);
    }

    return fetch(config.endpoint, requestOptions);
  }

  private async handleSyncSuccess(task: SyncTask, response: Response): Promise<void> {
    task.status = 'completed';
    
    try {
      const responseData = await response.json();
      await this.storeResponseData(task.type, responseData);
      
      // Remove from sync queue
      this.syncTasks.delete(task.id);
      await offlineStorageService.markSynced(task.id);
      
      console.log(`Sync completed for task: ${task.type}`);
      
      // Notify about successful sync
      window.dispatchEvent(new CustomEvent('background-sync-success', {
        detail: { taskType: task.type, data: responseData }
      }));
      
    } catch (error) {
      console.error('Error processing sync response:', error);
      task.status = 'failed';
    }
  }

  private async handleSyncError(task: SyncTask, error: any): Promise<void> {
    console.error(`Sync failed for task ${task.type}:`, error);
    
    if (task.attempts >= task.config.retryAttempts) {
      task.status = 'failed';
      await offlineStorageService.markSyncFailed(task.id);
      
      // Notify about failed sync
      window.dispatchEvent(new CustomEvent('background-sync-failed', {
        detail: { taskType: task.type, error: error.message }
      }));
    } else {
      task.status = 'pending';
      
      // Schedule retry with exponential backoff
      const delay = task.config.retryDelay * Math.pow(2, task.attempts - 1);
      setTimeout(() => {
        if (navigator.onLine) {
          this.processSyncTask(task);
        }
      }, delay);
    }
  }

  private async storeResponseData(type: string, data: any): Promise<void> {
    switch (type) {
      case 'pois':
        if (Array.isArray(data)) {
          await offlineStorageService.storePOIs(data);
        }
        break;
      
      case 'tours':
        if (Array.isArray(data)) {
          await offlineStorageService.storeTours(data);
        }
        break;
      
      case 'accommodations':
        if (Array.isArray(data)) {
          // Store accommodations
          const db = await (offlineStorageService as any).ensureDB();
          const transaction = db.transaction(['accommodations'], 'readwrite');
          const store = transaction.objectStore('accommodations');
          
          for (const item of data) {
            const offlineData = {
              id: item.id,
              type: 'accommodation',
              data: item,
              timestamp: Date.now(),
              lastModified: Date.now(),
              syncStatus: 'synced',
              version: 1
            };
            store.put(offlineData);
          }
        }
        break;
      
      case 'restaurants':
        if (Array.isArray(data)) {
          // Store restaurants
          const db = await (offlineStorageService as any).ensureDB();
          const transaction = db.transaction(['restaurants'], 'readwrite');
          const store = transaction.objectStore('restaurants');
          
          for (const item of data) {
            const offlineData = {
              id: item.id,
              type: 'restaurant',
              data: item,
              timestamp: Date.now(),
              lastModified: Date.now(),
              syncStatus: 'synced',
              version: 1
            };
            store.put(offlineData);
          }
        }
        break;
      
      default:
        console.log(`No storage handler for type: ${type}`);
    }
  }

  // Periodic sync management
  private startPeriodicSync(): void {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
    }

    this.syncInterval = window.setInterval(() => {
      if (navigator.onLine && !this.isRunning) {
        this.syncCoreData();
      }
    }, this.SYNC_INTERVAL);
  }

  private stopPeriodicSync(): void {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
    }
  }

  // Public API
  async forceSyncAll(): Promise<void> {
    await Promise.all([
      this.syncCoreData(),
      this.syncUserData()
    ]);
  }

  async forceSyncType(type: string): Promise<void> {
    const task = Array.from(this.syncTasks.values())
      .find(t => t.type === type && t.status === 'pending');
    
    if (task) {
      await this.processSyncTask(task);
    }
  }

  getSyncStatus(): { pending: number; running: number; completed: number; failed: number } {
    const tasks = Array.from(this.syncTasks.values());
    return {
      pending: tasks.filter(t => t.status === 'pending').length,
      running: tasks.filter(t => t.status === 'running').length,
      completed: tasks.filter(t => t.status === 'completed').length,
      failed: tasks.filter(t => t.status === 'failed').length
    };
  }

  clearCompletedTasks(): void {
    const completedTasks = Array.from(this.syncTasks.entries())
      .filter(([_, task]) => task.status === 'completed');
    
    completedTasks.forEach(([id]) => {
      this.syncTasks.delete(id);
    });
  }

  // Cleanup
  destroy(): void {
    this.stopPeriodicSync();
    this.syncTasks.clear();
    this.isRunning = false;
  }
}

export const backgroundSyncService = new BackgroundSyncService();
export default backgroundSyncService;