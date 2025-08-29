import { useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useGestures } from './useGestures';
import { useHapticFeedback } from './useHapticFeedback';
import type { SwipeEvent, GestureConfig } from '../types/gestures';

interface NavigationRoute {
  path: string;
  name: string;
  swipeDirection?: 'left' | 'right' | 'up' | 'down';
}

interface GestureNavigationConfig extends GestureConfig {
  routes?: NavigationRoute[];
  enableBackGesture?: boolean;
  enableForwardGesture?: boolean;
  customNavigation?: {
    onSwipeLeft?: () => void;
    onSwipeRight?: () => void;
    onSwipeUp?: () => void;
    onSwipeDown?: () => void;
  };
}

const defaultRoutes: NavigationRoute[] = [
  { path: '/', name: 'Home', swipeDirection: 'right' },
  { path: '/map', name: 'Map', swipeDirection: 'left' },
  { path: '/tours', name: 'Tours', swipeDirection: 'left' },
  { path: '/accommodations', name: 'Accommodations', swipeDirection: 'left' },
  { path: '/restaurants', name: 'Restaurants', swipeDirection: 'left' },
  { path: '/specialties', name: 'Specialties', swipeDirection: 'left' }
];

export const useGestureNavigation = (config: GestureNavigationConfig = {}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const haptic = useHapticFeedback();

  const {
    routes = defaultRoutes,
    enableBackGesture = true,
    enableForwardGesture = true,
    customNavigation,
    ...gestureConfig
  } = config;

  const getCurrentRouteIndex = useCallback(() => {
    return routes.findIndex(route => route.path === location.pathname);
  }, [routes, location.pathname]);

  const navigateToRoute = useCallback((routeIndex: number) => {
    if (routeIndex >= 0 && routeIndex < routes.length) {
      const route = routes[routeIndex];
      navigate(route.path);
      haptic.success();
    }
  }, [routes, navigate, haptic]);

  const handleSwipeLeft = useCallback((event: SwipeEvent) => {
    if (customNavigation?.onSwipeLeft) {
      customNavigation.onSwipeLeft();
      return;
    }

    if (enableForwardGesture) {
      const currentIndex = getCurrentRouteIndex();
      const nextIndex = currentIndex + 1;
      
      if (nextIndex < routes.length) {
        navigateToRoute(nextIndex);
      } else {
        // Wrap around to first route
        navigateToRoute(0);
      }
    }
  }, [customNavigation, enableForwardGesture, getCurrentRouteIndex, navigateToRoute, routes.length]);

  const handleSwipeRight = useCallback((event: SwipeEvent) => {
    if (customNavigation?.onSwipeRight) {
      customNavigation.onSwipeRight();
      return;
    }

    if (enableBackGesture) {
      const currentIndex = getCurrentRouteIndex();
      const prevIndex = currentIndex - 1;
      
      if (prevIndex >= 0) {
        navigateToRoute(prevIndex);
      } else {
        // Wrap around to last route
        navigateToRoute(routes.length - 1);
      }
    }
  }, [customNavigation, enableBackGesture, getCurrentRouteIndex, navigateToRoute, routes.length]);

  const handleSwipeUp = useCallback((event: SwipeEvent) => {
    if (customNavigation?.onSwipeUp) {
      customNavigation.onSwipeUp();
    }
  }, [customNavigation]);

  const handleSwipeDown = useCallback((event: SwipeEvent) => {
    if (customNavigation?.onSwipeDown) {
      customNavigation.onSwipeDown();
    }
  }, [customNavigation]);

  const gestureRef = useGestures({
    onSwipeLeft: handleSwipeLeft,
    onSwipeRight: handleSwipeRight,
    onSwipeUp: handleSwipeUp,
    onSwipeDown: handleSwipeDown
  }, {
    swipe: {
      threshold: 100,
      velocity: 0.5,
      direction: 'horizontal',
      ...gestureConfig.swipe
    },
    ...gestureConfig
  });

  return {
    gestureRef,
    currentRoute: routes[getCurrentRouteIndex()],
    routes,
    navigateToRoute,
    getCurrentRouteIndex
  };
};

// Hook for simple back/forward navigation
export const useSwipeNavigation = () => {
  const navigate = useNavigate();
  const haptic = useHapticFeedback();

  const gestureRef = useGestures({
    onSwipeRight: () => {
      navigate(-1);
      haptic.light();
    }
  }, {
    swipe: {
      threshold: 80,
      velocity: 0.4,
      direction: 'horizontal'
    }
  });

  return gestureRef;
};