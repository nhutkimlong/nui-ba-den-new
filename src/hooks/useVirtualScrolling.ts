import { useState, useEffect, useMemo , useCallback} from 'react';

interface VirtualScrollingOptions {
  itemHeight: number;
  containerHeight: number;
  overscan?: number;
  scrollingDelay?: number;
}

interface VirtualScrollingResult<T> {
  virtualItems: Array<{
    index: number;
    item: T;
    offsetTop: number;
  }>;
  totalHeight: number;
  startIndex: number;
  endIndex: number;
  isScrolling: boolean;
  scrollToIndex: (index: number) => void;
}

export function useVirtualScrolling<T>(
  items: T[],
  options: VirtualScrollingOptions
): VirtualScrollingResult<T> {
  const {
    itemHeight,
    containerHeight,
    overscan = 5,
    scrollingDelay = 150
  } = options;

  const [scrollTop, setScrollTop] = useState(0);
  const [isScrolling, setIsScrolling] = useState(false);

  // Calculate visible range
  const { startIndex, endIndex } = useMemo(() => {
    const visibleStart = Math.floor(scrollTop / itemHeight);
    const visibleEnd = Math.min(
      visibleStart + Math.ceil(containerHeight / itemHeight),
      items.length - 1
    );

    return {
      startIndex: Math.max(0, visibleStart - overscan),
      endIndex: Math.min(items.length - 1, visibleEnd + overscan)
    };
  }, [scrollTop, itemHeight, containerHeight, overscan, items.length]);

  // Create virtual items
  const virtualItems = useMemo(() => {
    const result = [];
    for (let i = startIndex; i <= endIndex; i++) {
      result.push({
        index: i,
        item: items[i],
        offsetTop: i * itemHeight
      });
    }
    return result;
  }, [startIndex, endIndex, items, itemHeight]);

  // Total height for scrollbar
  const totalHeight = items.length * itemHeight;

  // Handle scroll events
  const handleScroll = useCallback((event: Event) => {
    const target = event.target as HTMLElement;
    setScrollTop(target.scrollTop);
    setIsScrolling(true);
  }, []);

  // Debounce scrolling state
  useEffect(() => {
    if (!isScrolling) return;

    const timeoutId = setTimeout(() => {
      setIsScrolling(false);
    }, scrollingDelay);

    return () => clearTimeout(timeoutId);
  }, [isScrolling, scrollingDelay]);

  // Scroll to specific index
  const scrollToIndex = useCallback((index: number) => {
    const targetScrollTop = index * itemHeight;
    setScrollTop(targetScrollTop);
  }, [itemHeight]);

  return {
    virtualItems,
    totalHeight,
    startIndex,
    endIndex,
    isScrolling,
    scrollToIndex
  };
}

// Hook for dynamic item heights (more complex virtual scrolling)
interface DynamicVirtualScrollingOptions {
  estimatedItemHeight: number;
  containerHeight: number;
  overscan?: number;
  getItemHeight?: (index: number) => number;
}

export function useDynamicVirtualScrolling<T>(
  items: T[],
  options: DynamicVirtualScrollingOptions
) {
  const {
    estimatedItemHeight,
    containerHeight,
    overscan = 5,
    getItemHeight
  } = options;

  const [scrollTop, setScrollTop] = useState(0);
  const [itemHeights, setItemHeights] = useState<Map<number, number>>(new Map());

  // Calculate item positions
  const itemPositions = useMemo(() => {
    const positions = new Map<number, { top: number; height: number }>();
    let currentTop = 0;

    for (let i = 0; i < items.length; i++) {
      const height = itemHeights.get(i) || 
                    (getItemHeight ? getItemHeight(i) : estimatedItemHeight);
      
      positions.set(i, { top: currentTop, height });
      currentTop += height;
    }

    return positions;
  }, [items.length, itemHeights, getItemHeight, estimatedItemHeight]);

  // Find visible range
  const { startIndex, endIndex } = useMemo(() => {
    let start = 0;
    let end = items.length - 1;

    // Binary search for start index
    let low = 0;
    let high = items.length - 1;
    while (low <= high) {
      const mid = Math.floor((low + high) / 2);
      const position = itemPositions.get(mid);
      if (!position) break;

      if (position.top + position.height < scrollTop) {
        low = mid + 1;
      } else {
        high = mid - 1;
        start = mid;
      }
    }

    // Find end index
    const viewportBottom = scrollTop + containerHeight;
    for (let i = start; i < items.length; i++) {
      const position = itemPositions.get(i);
      if (!position) break;

      if (position.top > viewportBottom) {
        end = i - 1;
        break;
      }
    }

    return {
      startIndex: Math.max(0, start - overscan),
      endIndex: Math.min(items.length - 1, end + overscan)
    };
  }, [scrollTop, containerHeight, itemPositions, items.length, overscan]);

  // Create virtual items
  const virtualItems = useMemo(() => {
    const result = [];
    for (let i = startIndex; i <= endIndex; i++) {
      const position = itemPositions.get(i);
      if (position) {
        result.push({
          index: i,
          item: items[i],
          offsetTop: position.top,
          height: position.height
        });
      }
    }
    return result;
  }, [startIndex, endIndex, items, itemPositions]);

  // Total height
  const totalHeight = useMemo(() => {
    const lastPosition = itemPositions.get(items.length - 1);
    return lastPosition ? lastPosition.top + lastPosition.height : 0;
  }, [itemPositions, items.length]);

  // Update item height
  const setItemHeight = useCallback((index: number, height: number) => {
    setItemHeights(prev => {
      const newMap = new Map(prev);
      newMap.set(index, height);
      return newMap;
    });
  }, []);

  return {
    virtualItems,
    totalHeight,
    startIndex,
    endIndex,
    setItemHeight,
    scrollTop,
    setScrollTop
  };
}