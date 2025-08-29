import { useState, useCallback, useRef } from 'react';
import { useHapticFeedback } from './useHapticFeedback';
import type { ContextMenuItem } from '../components/gestures/ContextMenu';

interface ContextMenuState {
  isOpen: boolean;
  position: { x: number; y: number };
  targetElement: HTMLElement | null;
}

interface UseContextMenuOptions {
  items: ContextMenuItem[] | ((target: HTMLElement) => ContextMenuItem[]);
  longPressDuration?: number;
  disabled?: boolean;
  onOpen?: (target: HTMLElement) => void;
  onClose?: () => void;
}

export const useContextMenu = ({
  items,
  longPressDuration = 500,
  disabled = false,
  onOpen,
  onClose
}: UseContextMenuOptions) => {
  const haptic = useHapticFeedback();
  const [state, setState] = useState<ContextMenuState>({
    isOpen: false,
    position: { x: 0, y: 0 },
    targetElement: null
  });
  const longPressTimerRef = useRef<NodeJS.Timeout | null>(null);

  const clearTimer = useCallback(() => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
  }, []);

  const openMenu = useCallback((x: number, y: number, target: HTMLElement) => {
    if (disabled) return;

    // Calculate position to keep menu in viewport
    const menuWidth = 200;
    const menuHeight = 300; // Approximate max height
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    let adjustedX = x;
    let adjustedY = y;

    if (x + menuWidth > viewportWidth) {
      adjustedX = viewportWidth - menuWidth - 16;
    }
    if (adjustedX < 16) {
      adjustedX = 16;
    }

    if (y + menuHeight > viewportHeight) {
      adjustedY = y - menuHeight;
    }
    if (adjustedY < 16) {
      adjustedY = 16;
    }

    setState({
      isOpen: true,
      position: { x: adjustedX, y: adjustedY },
      targetElement: target
    });

    haptic.medium();
    onOpen?.(target);
  }, [disabled, haptic, onOpen]);

  const closeMenu = useCallback(() => {
    setState(prev => ({ ...prev, isOpen: false }));
    clearTimer();
    onClose?.();
  }, [clearTimer, onClose]);

  const getMenuItems = useCallback((): ContextMenuItem[] => {
    if (!state.targetElement) return [];
    
    if (typeof items === 'function') {
      return items(state.targetElement);
    }
    return items;
  }, [items, state.targetElement]);

  const handleLongPress = useCallback((event: React.TouchEvent | React.MouseEvent, target: HTMLElement) => {
    if (disabled) return;

    const clientX = 'touches' in event ? event.touches[0].clientX : event.clientX;
    const clientY = 'touches' in event ? event.touches[0].clientY : event.clientY;

    longPressTimerRef.current = setTimeout(() => {
      openMenu(clientX, clientY, target);
    }, longPressDuration);
  }, [disabled, longPressDuration, openMenu]);

  const handleContextMenu = useCallback((event: React.MouseEvent, target: HTMLElement) => {
    event.preventDefault();
    if (disabled) return;

    openMenu(event.clientX, event.clientY, target);
  }, [disabled, openMenu]);

  const bindTrigger = useCallback((element: HTMLElement | null) => {
    if (!element) return {};

    return {
      onMouseDown: (event: React.MouseEvent) => handleLongPress(event, element),
      onMouseUp: clearTimer,
      onMouseLeave: clearTimer,
      onTouchStart: (event: React.TouchEvent) => handleLongPress(event, element),
      onTouchEnd: clearTimer,
      onTouchCancel: clearTimer,
      onContextMenu: (event: React.MouseEvent) => handleContextMenu(event, element)
    };
  }, [handleLongPress, handleContextMenu, clearTimer]);

  return {
    isOpen: state.isOpen,
    position: state.position,
    targetElement: state.targetElement,
    menuItems: getMenuItems(),
    openMenu,
    closeMenu,
    bindTrigger
  };
};

// Hook for POI-specific context menus
export const usePOIContextMenu = (poi: any) => {
  const haptic = useHapticFeedback();

  const menuItems: ContextMenuItem[] = [
    {
      id: 'view-details',
      label: 'View Details',
      icon: '👁️',
      action: () => {
        // Navigate to POI details
        console.log('View details for:', poi.name);
      }
    },
    {
      id: 'get-directions',
      label: 'Get Directions',
      icon: '🧭',
      action: () => {
        // Open directions
        const url = `https://www.google.com/maps/dir/?api=1&destination=${poi.latitude},${poi.longitude}`;
        window.open(url, '_blank');
      }
    },
    {
      id: 'add-to-favorites',
      label: 'Add to Favorites',
      icon: '❤️',
      action: () => {
        // Add to favorites
        haptic.success();
        console.log('Added to favorites:', poi.name);
      }
    },
    {
      id: 'share',
      label: 'Share',
      icon: '📤',
      action: () => {
        // Share POI
        if (navigator.share) {
          navigator.share({
            title: poi.name,
            text: poi.description,
            url: window.location.href
          });
        } else {
          // Fallback to clipboard
          navigator.clipboard.writeText(window.location.href);
          haptic.success();
        }
      }
    }
  ];

  return useContextMenu({
    items: menuItems,
    longPressDuration: 600
  });
};