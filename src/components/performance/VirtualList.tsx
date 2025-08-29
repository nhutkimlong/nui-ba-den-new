import React, { useRef, useEffect, useCallback } from 'react';
import { useVirtualScrolling, useDynamicVirtualScrolling } from '../../hooks/useVirtualScrolling';
import { cn } from '../../utils/cn';

interface VirtualListProps<T> {
  items: T[];
  itemHeight: number;
  height: number;
  renderItem: (item: T, index: number) => React.ReactNode;
  className?: string;
  overscan?: number;
  onScroll?: (scrollTop: number) => void;
  scrollToIndex?: number;
}

export function VirtualList<T>({
  items,
  itemHeight,
  height,
  renderItem,
  className,
  overscan = 5,
  onScroll,
  scrollToIndex
}: VirtualListProps<T>) {
  const containerRef = useRef<HTMLDivElement>(null);
  
  const {
    virtualItems,
    totalHeight,
    isScrolling,
    scrollToIndex: scrollToIndexFn
  } = useVirtualScrolling(items, {
    itemHeight,
    containerHeight: height,
    overscan
  });

  // Handle scroll events
  const handleScroll = useCallback((event: React.UIEvent<HTMLDivElement>) => {
    const target = event.currentTarget;
    onScroll?.(target.scrollTop);
  }, [onScroll]);

  // Handle scroll to index
  useEffect(() => {
    if (typeof scrollToIndex === 'number' && containerRef.current) {
      const targetScrollTop = scrollToIndex * itemHeight;
      containerRef.current.scrollTop = targetScrollTop;
      scrollToIndexFn(scrollToIndex);
    }
  }, [scrollToIndex, itemHeight, scrollToIndexFn]);

  return (
    <div
      ref={containerRef}
      className={cn(
        'overflow-auto',
        className
      )}
      style={{ height }}
      onScroll={handleScroll}
    >
      <div style={{ height: totalHeight, position: 'relative' }}>
        {virtualItems.map(({ index, item, offsetTop }) => (
          <div
            key={index}
            style={{
              position: 'absolute',
              top: offsetTop,
              left: 0,
              right: 0,
              height: itemHeight
            }}
          >
            {renderItem(item, index)}
          </div>
        ))}
        
        {/* Scrolling indicator */}
        {isScrolling && (
          <div className="absolute top-2 right-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-sm">
            Scrolling...
          </div>
        )}
      </div>
    </div>
  );
}

// Dynamic height virtual list
interface DynamicVirtualListProps<T> {
  items: T[];
  estimatedItemHeight: number;
  height: number;
  renderItem: (
    item: T, 
    index: number, 
    setHeight: (height: number) => void
  ) => React.ReactNode;
  className?: string;
  overscan?: number;
  onScroll?: (scrollTop: number) => void;
}

export function DynamicVirtualList<T>({
  items,
  estimatedItemHeight,
  height,
  renderItem,
  className,
  overscan = 5,
  onScroll
}: DynamicVirtualListProps<T>) {
  const containerRef = useRef<HTMLDivElement>(null);
  
  const {
    virtualItems,
    totalHeight,
    setItemHeight,
    scrollTop,
    setScrollTop
  } = useDynamicVirtualScrolling(items, {
    estimatedItemHeight,
    containerHeight: height,
    overscan
  });

  // Handle scroll events
  const handleScroll = useCallback((event: React.UIEvent<HTMLDivElement>) => {
    const target = event.currentTarget;
    setScrollTop(target.scrollTop);
    onScroll?.(target.scrollTop);
  }, [onScroll, setScrollTop]);

  // Create height setter for each item
  const createHeightSetter = useCallback((index: number) => {
    return (height: number) => setItemHeight(index, height);
  }, [setItemHeight]);

  return (
    <div
      ref={containerRef}
      className={cn(
        'overflow-auto',
        className
      )}
      style={{ height }}
      onScroll={handleScroll}
    >
      <div style={{ height: totalHeight, position: 'relative' }}>
        {virtualItems.map(({ index, item, offsetTop, height: itemHeight }) => (
          <div
            key={index}
            style={{
              position: 'absolute',
              top: offsetTop,
              left: 0,
              right: 0,
              minHeight: itemHeight
            }}
          >
            {renderItem(item, index, createHeightSetter(index))}
          </div>
        ))}
      </div>
    </div>
  );
}

// Grid virtual list for masonry layouts
interface VirtualGridProps<T> {
  items: T[];
  itemHeight: number;
  height: number;
  columns: number;
  gap?: number;
  renderItem: (item: T, index: number) => React.ReactNode;
  className?: string;
}

export function VirtualGrid<T>({
  items,
  itemHeight,
  height,
  columns,
  gap = 16,
  renderItem,
  className
}: VirtualGridProps<T>) {
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Calculate rows needed
  const rowCount = Math.ceil(items.length / columns);
  const rowHeight = itemHeight + gap;
  
  const {
    virtualItems: virtualRows,
    totalHeight
  } = useVirtualScrolling(
    Array.from({ length: rowCount }, (_, i) => i),
    {
      itemHeight: rowHeight,
      containerHeight: height,
      overscan: 2
    }
  );

  return (
    <div
      ref={containerRef}
      className={cn('overflow-auto', className)}
      style={{ height }}
    >
      <div style={{ height: totalHeight, position: 'relative' }}>
        {virtualRows.map(({ index: rowIndex, offsetTop }) => (
          <div
            key={rowIndex}
            style={{
              position: 'absolute',
              top: offsetTop,
              left: 0,
              right: 0,
              height: rowHeight,
              display: 'grid',
              gridTemplateColumns: `repeat(${columns}, 1fr)`,
              gap
            }}
          >
            {Array.from({ length: columns }, (_, colIndex) => {
              const itemIndex = rowIndex * columns + colIndex;
              const item = items[itemIndex];
              
              if (!item) return null;
              
              return (
                <div key={itemIndex}>
                  {renderItem(item, itemIndex)}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}