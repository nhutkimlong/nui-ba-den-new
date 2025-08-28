import { useEffect, useRef, useState } from 'react'

interface PerformanceMetrics {
  loadTime: number
  firstContentfulPaint: number
  largestContentfulPaint: number
  cumulativeLayoutShift: number
  firstInputDelay: number
  timeToInteractive: number
}

interface PerformanceObserver {
  observe: (options: any) => void
  disconnect: () => void
}

export const usePerformance = () => {
  const [metrics, setMetrics] = useState<PerformanceMetrics | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const observersRef = useRef<PerformanceObserver[]>([])

  useEffect(() => {
    const measurePerformance = () => {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming
      const paint = performance.getEntriesByType('paint')
      
      const fcp = paint.find(entry => entry.name === 'first-contentful-paint')
      const lcp = performance.getEntriesByType('largest-contentful-paint')[0]
      const cls = performance.getEntriesByType('layout-shift')[0]

      const metrics: PerformanceMetrics = {
        loadTime: navigation.loadEventEnd - navigation.loadEventStart,
        firstContentfulPaint: fcp ? fcp.startTime : 0,
        largestContentfulPaint: lcp ? lcp.startTime : 0,
        cumulativeLayoutShift: cls ? (cls as any).value : 0,
        firstInputDelay: 0, // Will be measured separately
        timeToInteractive: navigation.domContentLoadedEventEnd - navigation.fetchStart
      }

      setMetrics(metrics)
      setIsLoading(false)

      // Send metrics to analytics
      sendPerformanceMetrics(metrics)
    }

    // Measure initial load
    if (document.readyState === 'complete') {
      measurePerformance()
    } else {
      window.addEventListener('load', measurePerformance)
    }

    // Observe LCP
    if ('PerformanceObserver' in window) {
      const lcpObserver = new (window as any).PerformanceObserver((list: any) => {
        const entries = list.getEntries()
        const lastEntry = entries[entries.length - 1]
        setMetrics(prev => prev ? { ...prev, largestContentfulPaint: lastEntry.startTime } : null)
      })
      lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] })
      observersRef.current.push(lcpObserver)

      // Observe CLS
      const clsObserver = new (window as any).PerformanceObserver((list: any) => {
        let clsValue = 0
        for (const entry of list.getEntries()) {
          if (!(entry as any).hadRecentInput) {
            clsValue += (entry as any).value
          }
        }
        setMetrics(prev => prev ? { ...prev, cumulativeLayoutShift: clsValue } : null)
      })
      clsObserver.observe({ entryTypes: ['layout-shift'] })
      observersRef.current.push(clsObserver)

      // Observe FID
      const fidObserver = new (window as any).PerformanceObserver((list: any) => {
        const entries = list.getEntries()
        const firstInput = entries[0]
        setMetrics(prev => prev ? { ...prev, firstInputDelay: firstInput.processingStart - firstInput.startTime } : null)
      })
      fidObserver.observe({ entryTypes: ['first-input'] })
      observersRef.current.push(fidObserver)
    }

    return () => {
      window.removeEventListener('load', measurePerformance)
      observersRef.current.forEach(observer => observer.disconnect())
    }
  }, [])

  const sendPerformanceMetrics = (metrics: PerformanceMetrics) => {
    // Send to analytics service
    if (process.env.NODE_ENV === 'production') {
      // Example: Google Analytics
      if ((window as any).gtag) {
        (window as any).gtag('event', 'performance', {
          load_time: metrics.loadTime,
          fcp: metrics.firstContentfulPaint,
          lcp: metrics.largestContentfulPaint,
          cls: metrics.cumulativeLayoutShift,
          fid: metrics.firstInputDelay,
          tti: metrics.timeToInteractive
        })
      }
    }
  }

  const getPerformanceScore = (): number => {
    if (!metrics) return 0

    let score = 100

    // LCP penalty (should be < 2.5s)
    if (metrics.largestContentfulPaint > 2500) {
      score -= Math.min(25, (metrics.largestContentfulPaint - 2500) / 100)
    }

    // FID penalty (should be < 100ms)
    if (metrics.firstInputDelay > 100) {
      score -= Math.min(25, (metrics.firstInputDelay - 100) / 10)
    }

    // CLS penalty (should be < 0.1)
    if (metrics.cumulativeLayoutShift > 0.1) {
      score -= Math.min(25, metrics.cumulativeLayoutShift * 250)
    }

    return Math.max(0, Math.round(score))
  }

  return {
    metrics,
    isLoading,
    score: getPerformanceScore(),
    isGood: getPerformanceScore() >= 90,
    isNeedsImprovement: getPerformanceScore() >= 50 && getPerformanceScore() < 90,
    isPoor: getPerformanceScore() < 50
  }
}

// Image optimization hook
export const useImageOptimization = () => {
  const [loadedImages, setLoadedImages] = useState<Set<string>>(new Set())

  const preloadImage = (src: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      if (loadedImages.has(src)) {
        resolve()
        return
      }

      const img = new Image()
      img.onload = () => {
        setLoadedImages(prev => new Set(prev).add(src))
        resolve()
      }
      img.onerror = reject
      img.src = src
    })
  }

  const preloadImages = async (srcs: string[]) => {
    const promises = srcs.map(src => preloadImage(src).catch(() => {}))
    await Promise.all(promises)
  }

  return {
    preloadImage,
    preloadImages,
    isImageLoaded: (src: string) => loadedImages.has(src)
  }
}

// Memory optimization hook
export const useMemoryOptimization = () => {
  const [memoryUsage, setMemoryUsage] = useState<number | null>(null)

  useEffect(() => {
    const checkMemory = () => {
      if ('memory' in performance) {
        const memory = (performance as any).memory
        const usage = (memory.usedJSHeapSize / memory.jsHeapSizeLimit) * 100
        setMemoryUsage(usage)

        // Warn if memory usage is high
        if (usage > 80) {
          console.warn('High memory usage detected:', usage.toFixed(2) + '%')
        }
      }
    }

    const interval = setInterval(checkMemory, 30000) // Check every 30 seconds
    checkMemory() // Initial check

    return () => clearInterval(interval)
  }, [])

  const clearMemory = () => {
    if (memoryUsage && memoryUsage > 70) {
      // Force garbage collection if available
      if ((window as any).gc) {
        (window as any).gc()
      }
    }
  }

  return {
    memoryUsage,
    isHighMemory: memoryUsage ? memoryUsage > 80 : false,
    clearMemory
  }
}
