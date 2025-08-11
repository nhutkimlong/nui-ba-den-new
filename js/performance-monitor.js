/**
 * Performance Monitoring Script
 * Tracks CSS/JS loading performance and provides optimization insights
 */

class PerformanceMonitor {
    constructor() {
        this.metrics = {
            cssLoadTimes: {},
            jsLoadTimes: {},
            criticalResourcesLoaded: false,
            pageLoadStart: performance.now()
        };
        
        this.init();
    }
    
    init() {
        // Monitor when DOM is ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
                this.metrics.domReady = performance.now() - this.metrics.pageLoadStart;
                this.checkCriticalResources();
            });
        } else {
            this.metrics.domReady = performance.now() - this.metrics.pageLoadStart;
            this.checkCriticalResources();
        }
        
        // Monitor when page is fully loaded
        window.addEventListener('load', () => {
            this.metrics.pageFullyLoaded = performance.now() - this.metrics.pageLoadStart;
            this.analyzePerformance();
        });
        
        // Monitor resource loading
        this.monitorResourceLoading();
    }
    
    monitorResourceLoading() {
        // Use Performance Observer to track resource loading
        if ('PerformanceObserver' in window) {
            const observer = new PerformanceObserver((list) => {
                list.getEntries().forEach((entry) => {
                    if (entry.initiatorType === 'link' && entry.name.includes('.css')) {
                        this.metrics.cssLoadTimes[this.getResourceName(entry.name)] = entry.duration;
                    } else if (entry.initiatorType === 'script' && entry.name.includes('.js')) {
                        this.metrics.jsLoadTimes[this.getResourceName(entry.name)] = entry.duration;
                    }
                });
            });
            
            observer.observe({ entryTypes: ['resource'] });
        }
    }
    
    getResourceName(url) {
        return url.split('/').pop().split('?')[0];
    }
    
    checkCriticalResources() {
        // Check if critical CSS is loaded
        const criticalCSS = document.querySelector('link[href*="main.css"], link[href*="main.min.css"]');
        const pageSpecificCSS = document.querySelector('link[href*="admin.css"], link[href*="climb.css"], link[href*="guide.css"], link[href*="map.css"], link[href*="data-editor.css"]');
        
        if (criticalCSS && pageSpecificCSS) {
            this.metrics.criticalResourcesLoaded = true;
            this.metrics.criticalResourcesTime = performance.now() - this.metrics.pageLoadStart;
        }
    }
    
    analyzePerformance() {
        const analysis = {
            overall: this.getOverallPerformance(),
            css: this.analyzeCSSPerformance(),
            js: this.analyzeJSPerformance(),
            recommendations: this.getRecommendations()
        };
        
        // Log performance data (only in development)
        if (window.location.hostname === 'localhost' || window.location.hostname.includes('dev')) {
            console.group('🚀 Performance Analysis');
            console.log('Overall Performance:', analysis.overall);
            console.log('CSS Performance:', analysis.css);
            console.log('JS Performance:', analysis.js);
            console.log('Recommendations:', analysis.recommendations);
            console.groupEnd();
        }
        
        // Store metrics for potential reporting
        this.storeMetrics(analysis);
    }
    
    getOverallPerformance() {
        const { domReady, pageFullyLoaded, criticalResourcesTime } = this.metrics;
        
        return {
            domReadyTime: Math.round(domReady),
            pageLoadTime: Math.round(pageFullyLoaded),
            criticalResourcesTime: Math.round(criticalResourcesTime || 0),
            performance: this.getPerformanceRating(pageFullyLoaded)
        };
    }
    
    analyzeCSSPerformance() {
        const cssFiles = Object.keys(this.metrics.cssLoadTimes);
        const totalCSSTime = Object.values(this.metrics.cssLoadTimes).reduce((sum, time) => sum + time, 0);
        
        return {
            filesLoaded: cssFiles.length,
            totalLoadTime: Math.round(totalCSSTime),
            averageLoadTime: cssFiles.length > 0 ? Math.round(totalCSSTime / cssFiles.length) : 0,
            slowestFile: this.getSlowestResource(this.metrics.cssLoadTimes)
        };
    }
    
    analyzeJSPerformance() {
        const jsFiles = Object.keys(this.metrics.jsLoadTimes);
        const totalJSTime = Object.values(this.metrics.jsLoadTimes).reduce((sum, time) => sum + time, 0);
        
        return {
            filesLoaded: jsFiles.length,
            totalLoadTime: Math.round(totalJSTime),
            averageLoadTime: jsFiles.length > 0 ? Math.round(totalJSTime / jsFiles.length) : 0,
            slowestFile: this.getSlowestResource(this.metrics.jsLoadTimes)
        };
    }
    
    getSlowestResource(resources) {
        let slowest = { name: null, time: 0 };
        
        Object.entries(resources).forEach(([name, time]) => {
            if (time > slowest.time) {
                slowest = { name, time: Math.round(time) };
            }
        });
        
        return slowest.name ? slowest : null;
    }
    
    getPerformanceRating(loadTime) {
        if (loadTime < 1000) return 'Excellent';
        if (loadTime < 2000) return 'Good';
        if (loadTime < 3000) return 'Fair';
        return 'Needs Improvement';
    }
    
    getRecommendations() {
        const recommendations = [];
        const { pageFullyLoaded, criticalResourcesTime } = this.metrics;
        
        // Check overall load time
        if (pageFullyLoaded > 3000) {
            recommendations.push('Consider implementing more aggressive lazy loading for non-critical resources');
        }
        
        // Check critical resources time
        if (criticalResourcesTime > 1000) {
            recommendations.push('Critical CSS/JS resources are loading slowly - consider inlining critical CSS');
        }
        
        // Check CSS performance
        const cssLoadTime = Object.values(this.metrics.cssLoadTimes).reduce((sum, time) => sum + time, 0);
        if (cssLoadTime > 500) {
            recommendations.push('CSS files are taking too long to load - consider minification or bundling');
        }
        
        // Check JS performance
        const jsLoadTime = Object.values(this.metrics.jsLoadTimes).reduce((sum, time) => sum + time, 0);
        if (jsLoadTime > 1000) {
            recommendations.push('JavaScript files are loading slowly - implement code splitting or lazy loading');
        }
        
        // Check number of external requests
        const externalCSS = Object.keys(this.metrics.cssLoadTimes).filter(name => 
            name.includes('googleapis') || name.includes('cdnjs') || name.includes('unpkg')
        ).length;
        
        if (externalCSS > 2) {
            recommendations.push('Too many external CSS requests - consider bundling or using local fallbacks');
        }
        
        return recommendations.length > 0 ? recommendations : ['Performance looks good! 🎉'];
    }
    
    storeMetrics(analysis) {
        // Store in sessionStorage for debugging
        try {
            sessionStorage.setItem('performanceMetrics', JSON.stringify({
                timestamp: new Date().toISOString(),
                url: window.location.href,
                userAgent: navigator.userAgent,
                ...analysis
            }));
        } catch (e) {
            // Ignore storage errors
        }
    }
    
    // Public method to get current metrics
    getMetrics() {
        return this.metrics;
    }
    
    // Public method to manually trigger analysis
    analyze() {
        this.analyzePerformance();
    }
}

// Initialize performance monitoring
if (typeof window !== 'undefined') {
    window.performanceMonitor = new PerformanceMonitor();
}

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = PerformanceMonitor;
}