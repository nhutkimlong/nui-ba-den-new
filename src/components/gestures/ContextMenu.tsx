import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useHapticFeedback } from '../../hooks/useHapticFeedback';

export interface ContextMenuItem {
  id: string;
  label: string;
  icon?: React.ReactNode;
  action: () => void;
  disabled?: boolean;
  destructive?: boolean;
  shortcut?: string;
}

export interface ContextMenuProps {
  items: ContextMenuItem[];
  children: React.ReactNode;
  disabled?: boolean;
  longPressDuration?: number;
  className?: string;
  menuClassName?: string;
  onOpen?: () => void;
  onClose?: () => void;
}

interface MenuPosition {
  x: number;
  y: number;
  visible: boolean;
}

export const ContextMenu: React.FC<ContextMenuProps> = ({
  items,
  children,
  disabled = false,
  longPressDuration = 500,
  className = '',
  menuClassName = '',
  onOpen,
  onClose
}) => {
  const haptic = useHapticFeedback();
  const containerRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const longPressTimerRef = useRef<NodeJS.Timeout | null>(null);
  const [menuPosition, setMenuPosition] = useState<MenuPosition>({
    x: 0,
    y: 0,
    visible: false
  });
  const [focusedIndex, setFocusedIndex] = useState<number>(-1);

  const clearLongPressTimer = useCallback(() => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
  }, []);

  const closeMenu = useCallback(() => {
    setMenuPosition(prev => ({ ...prev, visible: false }));
    setFocusedIndex(-1);
    clearLongPressTimer();
    onClose?.();
  }, [clearLongPressTimer, onClose]);

  const openMenu = useCallback((x: number, y: number) => {
    if (disabled || items.length === 0) return;

    // Calculate menu position to keep it within viewport
    const menuWidth = 200; // Approximate menu width
    const menuHeight = items.length * 48 + 16; // Approximate menu height
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    let adjustedX = x;
    let adjustedY = y;

    // Adjust horizontal position
    if (x + menuWidth > viewportWidth) {
      adjustedX = viewportWidth - menuWidth - 16;
    }
    if (adjustedX < 16) {
      adjustedX = 16;
    }

    // Adjust vertical position
    if (y + menuHeight > viewportHeight) {
      adjustedY = y - menuHeight;
    }
    if (adjustedY < 16) {
      adjustedY = 16;
    }

    setMenuPosition({
      x: adjustedX,
      y: adjustedY,
      visible: true
    });

    haptic.medium();
    onOpen?.();
  }, [disabled, items.length, haptic, onOpen]);

  const handleMouseDown = useCallback((event: React.MouseEvent) => {
    if (disabled || event.button !== 0) return;

    const startTime = Date.now();
    const startX = event.clientX;
    const startY = event.clientY;

    longPressTimerRef.current = setTimeout(() => {
      openMenu(startX, startY);
    }, longPressDuration);
  }, [disabled, longPressDuration, openMenu]);

  const handleMouseUp = useCallback(() => {
    clearLongPressTimer();
  }, [clearLongPressTimer]);

  const handleMouseMove = useCallback((event: React.MouseEvent) => {
    // Cancel long press if mouse moves too much
    const threshold = 10;
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;

    const deltaX = Math.abs(event.clientX - rect.left);
    const deltaY = Math.abs(event.clientY - rect.top);

    if (deltaX > threshold || deltaY > threshold) {
      clearLongPressTimer();
    }
  }, [clearLongPressTimer]);

  const handleTouchStart = useCallback((event: React.TouchEvent) => {
    if (disabled) return;

    const touch = event.touches[0];
    const startX = touch.clientX;
    const startY = touch.clientY;

    longPressTimerRef.current = setTimeout(() => {
      openMenu(startX, startY);
    }, longPressDuration);
  }, [disabled, longPressDuration, openMenu]);

  const handleTouchMove = useCallback((event: React.TouchEvent) => {
    // Cancel long press if touch moves too much
    const threshold = 10;
    const touch = event.touches[0];
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;

    const deltaX = Math.abs(touch.clientX - rect.left);
    const deltaY = Math.abs(touch.clientY - rect.top);

    if (deltaX > threshold || deltaY > threshold) {
      clearLongPressTimer();
    }
  }, [clearLongPressTimer]);

  const handleTouchEnd = useCallback(() => {
    clearLongPressTimer();
  }, [clearLongPressTimer]);

  const handleContextMenu = useCallback((event: React.MouseEvent) => {
    event.preventDefault();
    if (disabled) return;

    openMenu(event.clientX, event.clientY);
  }, [disabled, openMenu]);

  const handleMenuItemClick = useCallback((item: ContextMenuItem) => {
    if (item.disabled) return;

    haptic.light();
    item.action();
    closeMenu();
  }, [haptic, closeMenu]);

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (!menuPosition.visible) return;

    switch (event.key) {
      case 'Escape':
        event.preventDefault();
        closeMenu();
        break;
      case 'ArrowDown':
        event.preventDefault();
        setFocusedIndex(prev => {
          const nextIndex = prev + 1;
          return nextIndex >= items.length ? 0 : nextIndex;
        });
        break;
      case 'ArrowUp':
        event.preventDefault();
        setFocusedIndex(prev => {
          const prevIndex = prev - 1;
          return prevIndex < 0 ? items.length - 1 : prevIndex;
        });
        break;
      case 'Enter':
      case ' ':
        event.preventDefault();
        if (focusedIndex >= 0 && focusedIndex < items.length) {
          const item = items[focusedIndex];
          handleMenuItemClick(item);
        }
        break;
    }
  }, [menuPosition.visible, items, focusedIndex, closeMenu, handleMenuItemClick]);

  // Handle clicks outside menu
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuPosition.visible && menuRef.current && !menuRef.current.contains(event.target as Node)) {
        closeMenu();
      }
    };

    if (menuPosition.visible) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [menuPosition.visible, closeMenu, handleKeyDown]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      clearLongPressTimer();
    };
  }, [clearLongPressTimer]);

  return (
    <>
      <div
        ref={containerRef}
        className={`context-menu-trigger ${className}`}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onMouseMove={handleMouseMove}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onContextMenu={handleContextMenu}
        style={{ userSelect: 'none' }}
      >
        {children}
      </div>

      {/* Context Menu */}
      {menuPosition.visible && (
        <div
          ref={menuRef}
          className={`context-menu ${menuClassName}`}
          style={{
            position: 'fixed',
            left: menuPosition.x,
            top: menuPosition.y,
            zIndex: 9999
          }}
        >
          <div className="bg-white rounded-lg shadow-xl border border-gray-200 py-2 min-w-[200px] max-w-[300px]">
            {items.map((item, index) => (
              <button
                key={item.id}
                onClick={() => handleMenuItemClick(item)}
                disabled={item.disabled}
                className={`
                  w-full px-4 py-3 text-left flex items-center space-x-3 hover:bg-gray-50 
                  disabled:opacity-50 disabled:cursor-not-allowed transition-colors
                  ${focusedIndex === index ? 'bg-primary-50 text-primary-700' : 'text-gray-700'}
                  ${item.destructive ? 'hover:bg-red-50 hover:text-red-700' : ''}
                `}
              >
                {item.icon && (
                  <span className="flex-shrink-0 w-5 h-5 flex items-center justify-center">
                    {item.icon}
                  </span>
                )}
                <span className="flex-1 font-medium">{item.label}</span>
                {item.shortcut && (
                  <span className="text-xs text-gray-400 font-mono">
                    {item.shortcut}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Backdrop */}
      {menuPosition.visible && (
        <div
          className="fixed inset-0 z-[9998]"
          style={{ backgroundColor: 'transparent' }}
          onClick={closeMenu}
        />
      )}
    </>
  );
};