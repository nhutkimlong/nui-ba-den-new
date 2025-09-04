export interface SwipeEvent {
  direction: 'left' | 'right' | 'up' | 'down';
  distance: number;
  velocity: number;
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  deltaX: number;
  deltaY: number;
  timestamp: number;
}

export interface GestureConfig {
  swipe?: {
    threshold?: number;
    velocity?: number;
    directional?: boolean;
    preventScroll?: boolean;
  };
  tap?: {
    maxDistance?: number;
    maxDuration?: number;
  };
  longPress?: {
    duration?: number;
    maxDistance?: number;
  };
}

export interface GestureHandlers {
  onSwipe?: (event: SwipeEvent) => void;
  onSwipeLeft?: (event: SwipeEvent) => void;
  onSwipeRight?: (event: SwipeEvent) => void;
  onSwipeUp?: (event: SwipeEvent) => void;
  onSwipeDown?: (event: SwipeEvent) => void;
  onTap?: (event: TouchEvent | MouseEvent) => void;
  onLongPress?: (event: TouchEvent | MouseEvent) => void;
}

export interface TouchPoint {
  x: number;
  y: number;
  timestamp: number;
}

export interface GestureState {
  isTracking: boolean;
  startPoint: TouchPoint | null;
  currentPoint: TouchPoint | null;
  lastPoint: TouchPoint | null;
}