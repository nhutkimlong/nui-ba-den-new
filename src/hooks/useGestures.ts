import { useRef, useCallback, useEffect } from 'react';
import type { GestureConfig, GestureHandlers, SwipeEvent, TouchPoint, GestureState } from '../types/gestures';

const DEFAULT_CONFIG: Required<GestureConfig> = {
  swipe: {
    threshold: 50,
    velocity: 0.3,
    directional: true,
    preventScroll: false
  },
  tap: {
    maxDistance: 10,
    maxDuration: 300
  },
  longPress: {
    duration: 500,
    maxDistance: 10
  }
};

export function useGestures(
  handlers: GestureHandlers,
  config: GestureConfig = {}
) {
  const elementRef = useRef<HTMLElement>(null);
  const gestureState = useRef<GestureState>({
    isTracking: false,
    startPoint: null,
    currentPoint: null,
    lastPoint: null
  });
  const longPressTimer = useRef<NodeJS.Timeout>();

  const mergedConfig = { ...DEFAULT_CONFIG, ...config };

  const createTouchPoint = useCallback((event: TouchEvent | MouseEvent): TouchPoint => {
    const touch = 'touches' in event ? event.touches[0] : event;
    return {
      x: touch.clientX,
      y: touch.clientY,
      timestamp: Date.now()
    };
  }, []);

  const calculateSwipeEvent = useCallback((start: TouchPoint, end: TouchPoint): SwipeEvent => {
    const deltaX = end.x - start.x;
    const deltaY = end.y - start.y;
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
    const duration = end.timestamp - start.timestamp;
    const velocity = distance / duration;

    let direction: SwipeEvent['direction'];
    if (Math.abs(deltaX) > Math.abs(deltaY)) {
      direction = deltaX > 0 ? 'right' : 'left';
    } else {
      direction = deltaY > 0 ? 'down' : 'up';
    }

    return {
      direction,
      distance,
      velocity,
      startX: start.x,
      startY: start.y,
      endX: end.x,
      endY: end.y,
      deltaX,
      deltaY,
      timestamp: end.timestamp
    };
  }, []);

  const handleStart = useCallback((event: TouchEvent | MouseEvent) => {
    const point = createTouchPoint(event);
    gestureState.current = {
      isTracking: true,
      startPoint: point,
      currentPoint: point,
      lastPoint: point
    };

    // Start long press timer
    if (handlers.onLongPress) {
      longPressTimer.current = setTimeout(() => {
        const { startPoint, currentPoint } = gestureState.current;
        if (startPoint && currentPoint) {
          const distance = Math.sqrt(
            Math.pow(currentPoint.x - startPoint.x, 2) + 
            Math.pow(currentPoint.y - startPoint.y, 2)
          );
          if (distance <= mergedConfig.longPress.maxDistance) {
            handlers.onLongPress!(event);
          }
        }
      }, mergedConfig.longPress.duration);
    }
  }, [handlers, mergedConfig, createTouchPoint]);

  const handleMove = useCallback((event: TouchEvent | MouseEvent) => {
    if (!gestureState.current.isTracking) return;

    const point = createTouchPoint(event);
    gestureState.current.currentPoint = point;

    // Prevent scroll if configured
    if (mergedConfig.swipe.preventScroll && 'touches' in event) {
      event.preventDefault();
    }
  }, [mergedConfig, createTouchPoint]);

  const handleEnd = useCallback((event: TouchEvent | MouseEvent) => {
    if (!gestureState.current.isTracking) return;

    const { startPoint, currentPoint } = gestureState.current;
    if (!startPoint || !currentPoint) return;

    // Clear long press timer
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
    }

    const distance = Math.sqrt(
      Math.pow(currentPoint.x - startPoint.x, 2) + 
      Math.pow(currentPoint.y - startPoint.y, 2)
    );
    const duration = currentPoint.timestamp - startPoint.timestamp;

    // Check for tap
    if (distance <= mergedConfig.tap.maxDistance && duration <= mergedConfig.tap.maxDuration) {
      handlers.onTap?.(event);
    }
    // Check for swipe
    else if (distance >= mergedConfig.swipe.threshold) {
      const swipeEvent = calculateSwipeEvent(startPoint, currentPoint);
      
      if (swipeEvent.velocity >= mergedConfig.swipe.velocity) {
        handlers.onSwipe?.(swipeEvent);
        
        // Directional handlers
        switch (swipeEvent.direction) {
          case 'left':
            handlers.onSwipeLeft?.(swipeEvent);
            break;
          case 'right':
            handlers.onSwipeRight?.(swipeEvent);
            break;
          case 'up':
            handlers.onSwipeUp?.(swipeEvent);
            break;
          case 'down':
            handlers.onSwipeDown?.(swipeEvent);
            break;
        }
      }
    }

    // Reset state
    gestureState.current = {
      isTracking: false,
      startPoint: null,
      currentPoint: null,
      lastPoint: null
    };
  }, [handlers, mergedConfig, calculateSwipeEvent]);

  const handleCancel = useCallback(() => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
    }
    gestureState.current = {
      isTracking: false,
      startPoint: null,
      currentPoint: null,
      lastPoint: null
    };
  }, []);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    // Touch events
    element.addEventListener('touchstart', handleStart, { passive: false });
    element.addEventListener('touchmove', handleMove, { passive: false });
    element.addEventListener('touchend', handleEnd, { passive: true });
    element.addEventListener('touchcancel', handleCancel, { passive: true });

    // Mouse events (for desktop testing)
    element.addEventListener('mousedown', handleStart);
    element.addEventListener('mousemove', handleMove);
    element.addEventListener('mouseup', handleEnd);
    element.addEventListener('mouseleave', handleCancel);

    return () => {
      element.removeEventListener('touchstart', handleStart);
      element.removeEventListener('touchmove', handleMove);
      element.removeEventListener('touchend', handleEnd);
      element.removeEventListener('touchcancel', handleCancel);
      element.removeEventListener('mousedown', handleStart);
      element.removeEventListener('mousemove', handleMove);
      element.removeEventListener('mouseup', handleEnd);
      element.removeEventListener('mouseleave', handleCancel);
    };
  }, [handleStart, handleMove, handleEnd, handleCancel]);

  return {
    ref: elementRef,
    isTracking: gestureState.current.isTracking
  };
}