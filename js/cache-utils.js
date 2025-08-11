/**
 * Cache Utility với Stale-While-Revalidate Pattern
 * 
 * Pattern này đảm bảo:
 * 1. Luôn fetch dữ liệu mới khi truy cập lần đầu
 * 2. Cache dữ liệu trong 30 phút để tối ưu performance
 * 3. Khi reload trang vẫn fetch dữ liệu mới (không dùng cache cũ)
 */

class CacheManager {
    constructor() {
        this.CACHE_EXPIRATION_MS = 30 * 60 * 1000; // 30 phút
        this.isFirstVisit = !localStorage.getItem('hasVisited');
        
        // Đánh dấu đã truy cập
        if (this.isFirstVisit) {
            localStorage.setItem('hasVisited', 'true');
        }
    }

    /**
     * Lấy dữ liệu với pattern stale-while-revalidate
     * @param {string} cacheKey - Key để lưu cache
     * @param {Function} fetchFunction - Function để fetch dữ liệu mới
     * @param {Object} options - Options bổ sung
     * @returns {Promise<Object>} Dữ liệu
     */
    async getDataWithStaleWhileRevalidate(cacheKey, fetchFunction, options = {}) {
        const {
            forceRefresh = false, // Bắt buộc refresh
            showLoading = true,   // Hiển thị loading
            loadingElement = null // Element để hiển thị loading
        } = options;

        // Luôn fetch dữ liệu mới nếu:
        // 1. Lần đầu truy cập
        // 2. Force refresh
        // 3. Reload trang (performance.navigation.type === 1)
        const shouldFetchFresh = this.isFirstVisit || 
                                forceRefresh || 
                                performance.navigation.type === 1;

        if (shouldFetchFresh) {
            return await this.fetchAndCache(cacheKey, fetchFunction, showLoading, loadingElement);
        }

        // Kiểm tra cache hiện tại
        const cachedData = this.getFromCache(cacheKey);
        
        if (cachedData && !this.isCacheExpired(cachedData.timestamp)) {
            // Background refresh - fetch dữ liệu mới nhưng không block UI
            this.backgroundRefresh(cacheKey, fetchFunction);
            
            return cachedData.data;
        }

        // Cache expired hoặc không có cache
        return await this.fetchAndCache(cacheKey, fetchFunction, showLoading, loadingElement);
    }

    /**
     * Fetch dữ liệu mới và lưu cache
     */
    async fetchAndCache(cacheKey, fetchFunction, showLoading = true, loadingElement = null) {
        try {
            if (showLoading && loadingElement) {
                this.showLoading(loadingElement);
            }

            const data = await fetchFunction();
            
            // Lưu cache
            this.saveToCache(cacheKey, data);
            
            if (showLoading && loadingElement) {
                this.hideLoading(loadingElement);
            }

            return data;
        } catch (error) {
            console.error(`[Cache] Error fetching data for ${cacheKey}:`, error);
            
            if (showLoading && loadingElement) {
                this.hideLoading(loadingElement);
            }
            
            throw error;
        }
    }

    /**
     * Background refresh - fetch dữ liệu mới mà không block UI
     */
    async backgroundRefresh(cacheKey, fetchFunction) {
        try {
            const data = await fetchFunction();
            this.saveToCache(cacheKey, data);
        } catch (error) {
            console.warn(`[Cache] Background refresh failed for ${cacheKey}:`, error);
        }
    }

    /**
     * Lấy dữ liệu từ cache
     */
    getFromCache(cacheKey) {
        try {
            const cached = localStorage.getItem(cacheKey);
            return cached ? JSON.parse(cached) : null;
        } catch (error) {
            console.warn(`[Cache] Error reading cache for ${cacheKey}:`, error);
            this.clearCache(cacheKey);
            return null;
        }
    }

    /**
     * Lưu dữ liệu vào cache
     */
    saveToCache(cacheKey, data) {
        try {
            const cacheData = {
                data: data,
                timestamp: Date.now()
            };
            localStorage.setItem(cacheKey, JSON.stringify(cacheData));
        } catch (error) {
            console.warn(`[Cache] Error saving cache for ${cacheKey}:`, error);
        }
    }

    /**
     * Kiểm tra cache có expired không
     */
    isCacheExpired(timestamp) {
        return Date.now() - timestamp > this.CACHE_EXPIRATION_MS;
    }

    /**
     * Xóa cache
     */
    clearCache(cacheKey) {
        try {
            localStorage.removeItem(cacheKey);
        } catch (error) {
            console.warn(`[Cache] Error clearing cache for ${cacheKey}:`, error);
        }
    }

    /**
     * Xóa tất cả cache
     */
    clearAllCache() {
        try {
            const keys = Object.keys(localStorage);
            keys.forEach(key => {
                if (key.startsWith('cache_') || key.includes('Data') || key.includes('guide')) {
                    localStorage.removeItem(key);
                }
            });
        } catch (error) {
            console.warn('[Cache] Error clearing all cache:', error);
        }
    }

    /**
     * Hiển thị loading
     */
    showLoading(element) {
        if (element) {
            element.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i> Đang tải dữ liệu...';
            element.style.display = 'block';
        }
    }

    /**
     * Ẩn loading
     */
    hideLoading(element) {
        if (element) {
            element.style.display = 'none';
        }
    }

    /**
     * Lấy thông tin cache
     */
    getCacheInfo(cacheKey) {
        const cached = this.getFromCache(cacheKey);
        if (!cached) {
            return { exists: false, age: null, expired: false };
        }

        const age = Date.now() - cached.timestamp;
        const expired = this.isCacheExpired(cached.timestamp);
        
        return {
            exists: true,
            age: age,
            ageMinutes: Math.floor(age / (1000 * 60)),
            expired: expired
        };
    }
}

// Tạo instance global
const cacheManager = new CacheManager();

// Export cho sử dụng trong các file khác
window.cacheManager = cacheManager; 