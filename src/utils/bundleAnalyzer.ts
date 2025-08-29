// Bundle analysis utilities for development and monitoring

interface BundleStats {
  totalSize: number;
  gzippedSize: number;
  chunks: Array<{
    name: string;
    size: number;
    modules: string[];
  }>;
  assets: Array<{
    name: string;
    size: number;
    type: string;
  }>;
}

interface PerformanceMetrics {
  firstContentfulPaint: number;
  largestContentfulPaint: number;
  firstInputDelay: number;
  cumulativeLayoutShift: number;
  timeToInteractive: number;
  totalBlockingTime: number;
}

// Performance monitoring
export class PerformanceMonitor {
  private metrics: Partial<PerformanceMetrics> = {};
  private observer: PerformanceObserver | null = null;

  constructor() {
    this.initializeObserver();
    this.measureCoreWebVitals();
  }

  private initializeObserver() {
    if (typeof window === 'undefined' || !('PerformanceObserver' in window)) {
      return;
    }

    this.observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        this.processEntry(entry);
      }
    });

    // Observe different types of performance entries
    try {
      this.observer.observe({ entryTypes: ['navigation', 'paint', 'largest-contentful-paint', 'first-input', 'layout-shift'] });
    } catch (e) {
      // Fallback for browsers that don't support all entry types
      console.warn('Some performance metrics may not be available:', e);
    }
  }

  private processEntry(entry: PerformanceEntry) {
    switch (entry.entryType) {
      case 'paint':
        if (entry.name === 'first-contentful-paint') {
          this.metrics.firstContentfulPaint = entry.startTime;
        }
        break;
      
      case 'largest-contentful-paint':
        this.metrics.largestContentfulPaint = (entry as any).startTime;
        break;
      
      case 'first-input':
        this.metrics.firstInputDelay = (entry as any).processingStart - entry.startTime;
        break;
      
      case 'layout-shift':
        if (!(entry as any).hadRecentInput) {
          this.metrics.cumulativeLayoutShift = 
            (this.metrics.cumulativeLayoutShift || 0) + (entry as any).value;
        }
        break;
    }
  }

  private measureCoreWebVitals() {
    // Measure Time to Interactive (TTI)
    if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
      window.requestIdleCallback(() => {
        this.metrics.timeToInteractive = performance.now();
      });
    }

    // Measure Total Blocking Time (TBT)
    this.measureTotalBlockingTime();
  }

  private measureTotalBlockingTime() {
    if (typeof window === 'undefined' || !('PerformanceObserver' in window)) {
      return;
    }

    let totalBlockingTime = 0;
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.duration > 50) {
          totalBlockingTime += entry.duration - 50;
        }
      }
      this.metrics.totalBlockingTime = totalBlockingTime;
    });

    try {
      observer.observe({ entryTypes: ['longtask'] });
    } catch (e) {
      console.warn('Long task monitoring not supported:', e);
    }
  }

  getMetrics(): Partial<PerformanceMetrics> {
    return { ...this.metrics };
  }

  getScore(): { score: number; grade: string; recommendations: string[] } {
    const metrics = this.getMetrics();
    let score = 100;
    const recommendations: string[] = [];

    // FCP scoring (0-1.8s = good, 1.8-3s = needs improvement, >3s = poor)
    if (metrics.firstContentfulPaint) {
      if (metrics.firstContentfulPaint > 3000) {
        score -= 20;
        recommendations.push('Improve First Contentful Paint (currently > 3s)');
      } else if (metrics.firstContentfulPaint > 1800) {
        score -= 10;
        recommendations.push('Optimize First Contentful Paint (currently > 1.8s)');
      }
    }

    // LCP scoring (0-2.5s = good, 2.5-4s = needs improvement, >4s = poor)
    if (metrics.largestContentfulPaint) {
      if (metrics.largestContentfulPaint > 4000) {
        score -= 25;
        recommendations.push('Improve Largest Contentful Paint (currently > 4s)');
      } else if (metrics.largestContentfulPaint > 2500) {
        score -= 15;
        recommendations.push('Optimize Largest Contentful Paint (currently > 2.5s)');
      }
    }

    // FID scoring (0-100ms = good, 100-300ms = needs improvement, >300ms = poor)
    if (metrics.firstInputDelay) {
      if (metrics.firstInputDelay > 300) {
        score -= 20;
        recommendations.push('Improve First Input Delay (currently > 300ms)');
      } else if (metrics.firstInputDelay > 100) {
        score -= 10;
        recommendations.push('Optimize First Input Delay (currently > 100ms)');
      }
    }

    // CLS scoring (0-0.1 = good, 0.1-0.25 = needs improvement, >0.25 = poor)
    if (metrics.cumulativeLayoutShift) {
      if (metrics.cumulativeLayoutShift > 0.25) {
        score -= 20;
        recommendations.push('Reduce Cumulative Layout Shift (currently > 0.25)');
      } else if (metrics.cumulativeLayoutShift > 0.1) {
        score -= 10;
        recommendations.push('Optimize Cumulative Layout Shift (currently > 0.1)');
      }
    }

    const grade = score >= 90 ? 'A' : score >= 80 ? 'B' : score >= 70 ? 'C' : score >= 60 ? 'D' : 'F';

    return { score: Math.max(0, score), grade, recommendations };
  }

  disconnect() {
    if (this.observer) {
      this.observer.disconnect();
    }
  }
}

// Bundle size monitoring
export class BundleSizeMonitor {
  private static instance: BundleSizeMonitor;
  private bundleStats: Partial<BundleStats> = {};

  static getInstance(): BundleSizeMonitor {
    if (!BundleSizeMonitor.instance) {
      BundleSizeMonitor.instance = new BundleSizeMonitor();
    }
    return BundleSizeMonitor.instance;
  }

  async analyzeBundleSize(): Promise<Partial<BundleStats>> {
    if (typeof window === 'undefined') {
      return this.bundleStats;
    }

    try {
      // Get resource timing information
      const resources = performance.getEntriesByType('resource') as PerformanceResourceTiming[];
      
      const assets = resources
        .filter(resource => resource.name.includes('.js') || resource.name.includes('.css'))
        .map(resource => ({
          name: resource.name.split('/').pop() || resource.name,
          size: resource.transferSize || 0,
          type: resource.name.includes('.js') ? 'javascript' : 'css'
        }));

      const totalSize = assets.reduce((sum, asset) => sum + asset.size, 0);

      this.bundleStats = {
        totalSize,
        assets,
        // Note: gzippedSize would need server-side information
        gzippedSize: Math.round(totalSize * 0.7) // Rough estimate
      };

      return this.bundleStats;
    } catch (error) {
      console.warn('Bundle analysis failed:', error);
      return this.bundleStats;
    }
  }

  getBundleReport(): {
    totalSize: string;
    recommendations: string[];
    largestAssets: Array<{ name: string; size: string; type: string }>;
  } {
    const stats = this.bundleStats;
    const recommendations: string[] = [];
    
    if (!stats.totalSize) {
      return {
        totalSize: 'Unknown',
        recommendations: ['Run bundle analysis first'],
        largestAssets: []
      };
    }

    // Size recommendations
    if (stats.totalSize > 1024 * 1024) { // > 1MB
      recommendations.push('Bundle size is large (>1MB). Consider code splitting.');
    }
    if (stats.totalSize > 512 * 1024) { // > 512KB
      recommendations.push('Consider lazy loading non-critical components.');
    }

    // Asset recommendations
    const largestAssets = (stats.assets || [])
      .sort((a, b) => b.size - a.size)
      .slice(0, 5)
      .map(asset => ({
        name: asset.name,
        size: this.formatBytes(asset.size),
        type: asset.type
      }));

    if (largestAssets.some(asset => asset.type === 'javascript' && parseInt(asset.size) > 200)) {
      recommendations.push('Large JavaScript files detected. Consider splitting them.');
    }

    return {
      totalSize: this.formatBytes(stats.totalSize),
      recommendations,
      largestAssets
    };
  }

  private formatBytes(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
}

// Resource loading optimization
export class ResourceOptimizer {
  private preloadedResources = new Set<string>();
  private criticalResources = new Set<string>();

  // Preload critical resources
  preloadResource(url: string, type: 'script' | 'style' | 'image' | 'font' = 'script'): void {
    if (this.preloadedResources.has(url) || typeof document === 'undefined') {
      return;
    }

    const link = document.createElement('link');
    link.rel = 'preload';
    link.href = url;
    
    switch (type) {
      case 'script':
        link.as = 'script';
        break;
      case 'style':
        link.as = 'style';
        break;
      case 'image':
        link.as = 'image';
        break;
      case 'font':
        link.as = 'font';
        link.crossOrigin = 'anonymous';
        break;
    }

    document.head.appendChild(link);
    this.preloadedResources.add(url);
  }

  // Prefetch non-critical resources
  prefetchResource(url: string): void {
    if (this.preloadedResources.has(url) || typeof document === 'undefined') {
      return;
    }

    const link = document.createElement('link');
    link.rel = 'prefetch';
    link.href = url;
    
    document.head.appendChild(link);
    this.preloadedResources.add(url);
  }

  // Mark resources as critical
  markAsCritical(url: string): void {
    this.criticalResources.add(url);
  }

  // Get optimization recommendations
  getOptimizationRecommendations(): string[] {
    const recommendations: string[] = [];

    if (this.criticalResources.size === 0) {
      recommendations.push('Identify and mark critical resources for preloading');
    }

    if (this.preloadedResources.size < 3) {
      recommendations.push('Consider preloading more critical resources');
    }

    return recommendations;
  }
}

// Export singleton instances
export const performanceMonitor = new PerformanceMonitor();
export const bundleSizeMonitor = BundleSizeMonitor.getInstance();
export const resourceOptimizer = new ResourceOptimizer();

// Development helper for bundle analysis
export function logBundleAnalysis(): void {
  if (process.env.NODE_ENV !== 'development') {
    return;
  }

  setTimeout(async () => {
    const performanceScore = performanceMonitor.getScore();
    const bundleReport = bundleSizeMonitor.getBundleReport();
    
    console.group('📊 Bundle Analysis Report');
    console.log('🎯 Performance Score:', `${performanceScore.score}/100 (${performanceScore.grade})`);
    console.log('📦 Bundle Size:', bundleReport.totalSize);
    console.log('🔍 Largest Assets:', bundleReport.largestAssets);
    
    if (performanceScore.recommendations.length > 0) {
      console.log('💡 Performance Recommendations:', performanceScore.recommendations);
    }
    
    if (bundleReport.recommendations.length > 0) {
      console.log('💡 Bundle Recommendations:', bundleReport.recommendations);
    }
    
    console.groupEnd();
  }, 3000); // Wait for initial load to complete
}