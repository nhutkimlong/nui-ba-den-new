// Native-like Gestures Component

import React, { useRef, useEffect, useState, ReactNode } from 'react';

interface NativeGesturesProps {
  children: ReactNode;
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onSwipeUp?: () => void;
  onSwipeDown?: () => void;
  onLongPress?: () => void;
  onDoubleTap?: () => void;
  enableHapticFeedback?: boolean;
  swipeThreshold?: number;
  longPressDelay?: number;
  className?: string;
}

export function NativeGestures({
  children,
  onSwipeLeft,
  onSwipeRight,
  onSwipeUp,
  onSwipeDown,
  onLongPress,
  onDoubleTap,
  enableHapticFeedback = true,
  swipeThreshold = 50,
  longPressDelay = 500,
  className = ''
}: NativeGesturesProps) {
  const elementRef = useRef<HTMLDivElement>(null);
  const [touchStart, setTouchStart] = useState<{ x: number; y: number; time: number } | null>(null);
  const [lastTap, setLastTap] = useState<number>(0);
  const longPressTimer = useRef<number | null>(null);
  const [isLongPressing, setIsLongPressing] = useState(false);

  // Haptic feedback simulation
  const triggerHapticFeedback = (type: 'light' | 'medium' | 'heavy' = 'light') => {
    if (!enableHapticFeedback) return;

    // Use native haptic feedback if available
    if ('vibrate' in navigator) {
      const patterns = {
        light: [10],
        medium: [20],
        heavy: [30]
      };
      navigator.vibrate(patterns[type]);
    }

    // Visual feedback for desktop
    if (elementRef.current) {
      elementRef.current.style.transform = 'scale(0.98)';
      setTimeout(() => {
        if (elementRef.current) {
          elementRef.current.style.transform = 'scale(1)';
        }
      }, 100);
    }
  };

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    const handleTouchStart = (e: TouchEvent) => {
      const touch = e.touches[0];
      setTouchStart({
        x: touch.clientX,
        y: touch.clientY,
        time: Date.now()
      });

      // Start long press timer
      if (onLongPress) {
        longPressTimer.current = window.setTimeout(() => {
          setIsLongPressing(true);
          triggerHapticFeedback('medium');
          onLongPress();
        }, longPressDelay);
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      // Cancel long press if user moves finger
      if (longPressTimer.current) {
        clearTimeout(longPressTimer.current);
        longPressTimer.current = null;
      }
    };

    const handleTouchEnd = (e: TouchEvent) => {
      // Clear long press timer
      if (longPressTimer.current) {
        clearTimeout(longPressTimer.current);
        longPressTimer.current = null;
      }

      if (isLongPressing) {
        setIsLongPressing(false);
        return;
      }

      if (!touchStart) return;

      const touch = e.changedTouches[0];
      const deltaX = touch.clientX - touchStart.x;
      const deltaY = touch.clientY - touchStart.y;
      const deltaTime = Date.now() - touchStart.time;

      // Check for swipe gestures
      const absDeltaX = Math.abs(deltaX);
      const absDeltaY = Math.abs(deltaY);

      if (absDeltaX > swipeThreshold || absDeltaY > swipeThreshold) {
        if (absDeltaX > absDeltaY) {
          // Horizontal swipe
          if (deltaX > 0 && onSwipeRight) {
            triggerHapticFeedback('light');
            onSwipeRight();
          } else if (deltaX < 0 && onSwipeLeft) {
            triggerHapticFeedback('light');
            onSwipeLeft();
          }
        } else {
          // Vertical swipe
          if (deltaY > 0 && onSwipeDown) {
            triggerHapticFeedback('light');
            onSwipeDown();
          } else if (deltaY < 0 && onSwipeUp) {
            triggerHapticFeedback('light');
            onSwipeUp();
          }
        }
      } else if (deltaTime < 300 && absDeltaX < 10 && absDeltaY < 10) {
        // Check for double tap
        const now = Date.now();
        if (onDoubleTap && now - lastTap < 300) {
          triggerHapticFeedback('medium');
          onDoubleTap();
        }
        setLastTap(now);
      }

      setTouchStart(null);
    };

    // Mouse events for desktop testing
    const handleMouseDown = (e: MouseEvent) => {
      setTouchStart({
        x: e.clientX,
        y: e.clientY,
        time: Date.now()
      });

      if (onLongPress) {
        longPressTimer.current = window.setTimeout(() => {
          setIsLongPressing(true);
          onLongPress();
        }, longPressDelay);
      }
    };

    const handleMouseMove = () => {
      if (longPressTimer.current) {
        clearTimeout(longPressTimer.current);
        longPressTimer.current = null;
      }
    };

    const handleMouseUp = (e: MouseEvent) => {
      if (longPressTimer.current) {
        clearTimeout(longPressTimer.current);
        longPressTimer.current = null;
      }

      if (isLongPressing) {
        setIsLongPressing(false);
        return;
      }

      if (!touchStart) return;

      const deltaX = e.clientX - touchStart.x;
      const deltaY = e.clientY - touchStart.y;
      const deltaTime = Date.now() - touchStart.time;

      const absDeltaX = Math.abs(deltaX);
      const absDeltaY = Math.abs(deltaY);

      if (absDeltaX > swipeThreshold || absDeltaY > swipeThreshold) {
        if (absDeltaX > absDeltaY) {
          if (deltaX > 0 && onSwipeRight) {
            onSwipeRight();
          } else if (deltaX < 0 && onSwipeLeft) {
            onSwipeLeft();
          }
        } else {
          if (deltaY > 0 && onSwipeDown) {
            onSwipeDown();
          } else if (deltaY < 0 && onSwipeUp) {
            onSwipeUp();
          }
        }
      } else if (deltaTime < 300 && absDeltaX < 10 && absDeltaY < 10) {
        const now = Date.now();
        if (onDoubleTap && now - lastTap < 300) {
          onDoubleTap();
        }
        setLastTap(now);
      }

      setTouchStart(null);
    };

    // Add event listeners
    element.addEventListener('touchstart', handleTouchStart, { passive: true });
    element.addEventListener('touchmove', handleTouchMove, { passive: true });
    element.addEventListener('touchend', handleTouchEnd, { passive: true });
    element.addEventListener('mousedown', handleMouseDown);
    element.addEventListener('mousemove', handleMouseMove);
    element.addEventListener('mouseup', handleMouseUp);

    return () => {
      element.removeEventListener('touchstart', handleTouchStart);
      element.removeEventListener('touchmove', handleTouchMove);
      element.removeEventListener('touchend', handleTouchEnd);
      element.removeEventListener('mousedown', handleMouseDown);
      element.removeEventListener('mousemove', handleMouseMove);
      element.removeEventListener('mouseup', handleMouseUp);

      if (longPressTimer.current) {
        clearTimeout(longPressTimer.current);
      }
    };
  }, [
    touchStart,
    lastTap,
    isLongPressing,
    onSwipeLeft,
    onSwipeRight,
    onSwipeUp,
    onSwipeDown,
    onLongPress,
    onDoubleTap,
    enableHapticFeedback,
    swipeThreshold,
    longPressDelay
  ]);

  return (
    <div
      ref={elementRef}
      className={`transition-transform duration-100 ${className}`}
      style={{
        touchAction: 'manipulation',
        userSelect: 'none',
        WebkitUserSelect: 'none',
        WebkitTouchCallout: 'none'
      }}
    >
      {children}
    </div>
  );
}

// Native-like Page Transition Component
interface PageTransitionProps {
  children: ReactNode;
  direction?: 'left' | 'right' | 'up' | 'down';
  duration?: number;
  className?: string;
}

export function PageTransition({
  children,
  direction = 'right',
  duration = 300,
  className = ''
}: PageTransitionProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Trigger entrance animation
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 50);

    return () => clearTimeout(timer);
  }, []);

  const getTransformClasses = () => {
    const baseClasses = 'transition-all ease-out';
    const durationClass = `duration-${duration}`;
    
    if (!isVisible) {
      switch (direction) {
        case 'left':
          return `${baseClasses} ${durationClass} transform -translate-x-full opacity-0`;
        case 'right':
          return `${baseClasses} ${durationClass} transform translate-x-full opacity-0`;
        case 'up':
          return `${baseClasses} ${durationClass} transform -translate-y-full opacity-0`;
        case 'down':
          return `${baseClasses} ${durationClass} transform translate-y-full opacity-0`;
        default:
          return `${baseClasses} ${durationClass} opacity-0`;
      }
    }

    return `${baseClasses} ${durationClass} transform translate-x-0 translate-y-0 opacity-100`;
  };

  return (
    <div className={`${getTransformClasses()} ${className}`}>
      {children}
    </div>
  );
}

// Native-like Bottom Sheet Component
interface BottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
  snapPoints?: number[];
  initialSnap?: number;
  className?: string;
}

export function BottomSheet({
  isOpen,
  onClose,
  children,
  snapPoints = [0.3, 0.6, 0.9],
  initialSnap = 0,
  className = ''
}: BottomSheetProps) {
  const [currentSnap, setCurrentSnap] = useState(initialSnap);
  const [isDragging, setIsDragging] = useState(false);
  const sheetRef = useRef<HTMLDivElement>(null);

  const handleDragStart = () => {
    setIsDragging(true);
  };

  const handleDragEnd = () => {
    setIsDragging(false);
  };

  const handleSwipeDown = () => {
    if (currentSnap > 0) {
      setCurrentSnap(currentSnap - 1);
    } else {
      onClose();
    }
  };

  const handleSwipeUp = () => {
    if (currentSnap < snapPoints.length - 1) {
      setCurrentSnap(currentSnap + 1);
    }
  };

  if (!isOpen) return null;

  const heightPercentage = snapPoints[currentSnap] * 100;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 transition-opacity"
        onClick={onClose}
      />

      {/* Bottom Sheet */}
      <div
        ref={sheetRef}
        className={`fixed bottom-0 left-0 right-0 z-50 bg-white rounded-t-3xl shadow-2xl transition-all duration-300 ${
          isDragging ? 'transition-none' : ''
        } ${className}`}
        style={{ height: `${heightPercentage}vh` }}
      >
        <NativeGestures
          onSwipeUp={handleSwipeUp}
          onSwipeDown={handleSwipeDown}
          className="h-full"
        >
          {/* Handle */}
          <div className="flex justify-center py-3">
            <div className="w-12 h-1 bg-neutral-300 rounded-full" />
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto px-4 pb-4">
            {children}
          </div>
        </NativeGestures>
      </div>
    </>
  );
}

// Native-like Pull to Refresh Component
interface PullToRefreshProps {
  onRefresh: () => Promise<void>;
  children: ReactNode;
  threshold?: number;
  className?: string;
}

export function PullToRefresh({
  onRefresh,
  children,
  threshold = 80,
  className = ''
}: PullToRefreshProps) {
  const [pullDistance, setPullDistance] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [canRefresh, setCanRefresh] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleTouchStart = (e: TouchEvent) => {
    if (containerRef.current?.scrollTop === 0) {
      const touch = e.touches[0];
      (containerRef.current as any).startY = touch.clientY;
    }
  };

  const handleTouchMove = (e: TouchEvent) => {
    if (!containerRef.current || containerRef.current.scrollTop > 0) return;

    const touch = e.touches[0];
    const startY = (containerRef.current as any).startY;
    
    if (startY && touch.clientY > startY) {
      const distance = Math.min((touch.clientY - startY) * 0.5, threshold * 1.5);
      setPullDistance(distance);
      setCanRefresh(distance >= threshold);
      
      if (distance > 0) {
        e.preventDefault();
      }
    }
  };

  const handleTouchEnd = async () => {
    if (canRefresh && !isRefreshing) {
      setIsRefreshing(true);
      try {
        await onRefresh();
      } finally {
        setIsRefreshing(false);
      }
    }
    
    setPullDistance(0);
    setCanRefresh(false);
    
    if (containerRef.current) {
      (containerRef.current as any).startY = null;
    }
  };

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    container.addEventListener('touchstart', handleTouchStart, { passive: false });
    container.addEventListener('touchmove', handleTouchMove, { passive: false });
    container.addEventListener('touchend', handleTouchEnd);

    return () => {
      container.removeEventListener('touchstart', handleTouchStart);
      container.removeEventListener('touchmove', handleTouchMove);
      container.removeEventListener('touchend', handleTouchEnd);
    };
  }, [canRefresh, isRefreshing]);

  return (
    <div
      ref={containerRef}
      className={`relative overflow-y-auto ${className}`}
      style={{
        transform: `translateY(${pullDistance}px)`,
        transition: pullDistance === 0 ? 'transform 0.3s ease-out' : 'none'
      }}
    >
      {/* Pull to Refresh Indicator */}
      {pullDistance > 0 && (
        <div
          className="absolute top-0 left-0 right-0 flex items-center justify-center py-4 text-primary-600"
          style={{ transform: `translateY(-100%)` }}
        >
          <div className={`transition-transform ${isRefreshing ? 'animate-spin' : canRefresh ? 'rotate-180' : ''}`}>
            {isRefreshing ? '⟳' : '↓'}
          </div>
          <span className="ml-2 text-sm font-medium">
            {isRefreshing ? 'Đang làm mới...' : canRefresh ? 'Thả để làm mới' : 'Kéo để làm mới'}
          </span>
        </div>
      )}

      {children}
    </div>
  );
}