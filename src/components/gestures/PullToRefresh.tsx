import React, { useState, useRef, useCallback, useEffect } from 'react';
import { useHapticFeedback } from '../../hooks/useHapticFeedback';

interface PullToRefreshProps {
  children: React.ReactNode;
  onRefresh: () => Promise<void> | void;
  threshold?: number;
  maxPullDistance?: number;
  refreshingText?: string;
  pullText?: string;
  releaseText?: string;
  disabled?: boolean;
  className?: string;
}

interface PullState {
  isPulling: boolean;
  isRefreshing: boolean;
  pullDistance: number;
  canRefresh: boolean;
  startY: number;
  currentY: number;
}

export const PullToRefresh: React.FC<PullToRefreshProps> = ({
  children,
  onRefresh,
  threshold = 80,
  maxPullDistance = 120,
  refreshingText = 'Refreshing...',
  pullText = 'Pull to refresh',
  releaseText = 'Release to refresh',
  disabled = false,
  className = ''
}) => {
  const haptic = useHapticFeedback();
  const containerRef = useRef<HTMLDivElement>(null);
  const [pullState, setPullState] = useState<PullState>({
    isPulling: false,
    isRefreshing: false,
    pullDistance: 0,
    canRefresh: false,
    startY: 0,
    currentY: 0
  });

  const isAtTop = useCallback(() => {
    const container = containerRef.current;
    if (!container) return false;
    return container.scrollTop === 0;
  }, []);

  const handleTouchStart = useCallback((event: TouchEvent) => {
    if (disabled || !isAtTop()) return;

    const touch = event.touches[0];
    setPullState(prev => ({
      ...prev,
      startY: touch.clientY,
      currentY: touch.clientY,
      isPulling: false
    }));
  }, [disabled, isAtTop]);

  const handleTouchMove = useCallback((event: TouchEvent) => {
    if (disabled || pullState.isRefreshing) return;

    const touch = event.touches[0];
    const deltaY = touch.clientY - pullState.startY;

    // Only handle downward pulls when at top
    if (deltaY > 0 && isAtTop()) {
      event.preventDefault();
      
      // Calculate pull distance with resistance
      const resistance = 0.5;
      const pullDistance = Math.min(
        deltaY * resistance,
        maxPullDistance
      );

      const canRefresh = pullDistance >= threshold;
      
      // Trigger haptic feedback when threshold is reached
      if (canRefresh && !pullState.canRefresh) {
        haptic.medium();
      }

      setPullState(prev => ({
        ...prev,
        isPulling: true,
        pullDistance,
        canRefresh,
        currentY: touch.clientY
      }));
    }
  }, [disabled, pullState.startY, pullState.canRefresh, pullState.isRefreshing, isAtTop, threshold, maxPullDistance, haptic]);

  const handleTouchEnd = useCallback(async () => {
    if (disabled || pullState.isRefreshing) return;

    if (pullState.canRefresh && pullState.isPulling) {
      setPullState(prev => ({
        ...prev,
        isRefreshing: true,
        isPulling: false
      }));

      haptic.success();

      try {
        await onRefresh();
      } catch (error) {
        console.error('Refresh failed:', error);
        haptic.error();
      } finally {
        // Add a small delay for better UX
        setTimeout(() => {
          setPullState(prev => ({
            ...prev,
            isRefreshing: false,
            pullDistance: 0,
            canRefresh: false
          }));
        }, 300);
      }
    } else {
      // Reset state if not refreshing
      setPullState(prev => ({
        ...prev,
        isPulling: false,
        pullDistance: 0,
        canRefresh: false
      }));
    }
  }, [disabled, pullState.canRefresh, pullState.isPulling, pullState.isRefreshing, onRefresh, haptic]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    container.addEventListener('touchstart', handleTouchStart, { passive: false });
    container.addEventListener('touchmove', handleTouchMove, { passive: false });
    container.addEventListener('touchend', handleTouchEnd, { passive: false });

    return () => {
      container.removeEventListener('touchstart', handleTouchStart);
      container.removeEventListener('touchmove', handleTouchMove);
      container.removeEventListener('touchend', handleTouchEnd);
    };
  }, [handleTouchStart, handleTouchMove, handleTouchEnd]);

  const getRefreshText = () => {
    if (pullState.isRefreshing) return refreshingText;
    if (pullState.canRefresh) return releaseText;
    return pullText;
  };

  const getRefreshProgress = () => {
    return Math.min(pullState.pullDistance / threshold, 1);
  };

  return (
    <div
      ref={containerRef}
      className={`pull-to-refresh-container ${className}`}
      style={{
        position: 'relative',
        height: '100%',
        overflow: 'auto',
        WebkitOverflowScrolling: 'touch'
      }}
    >
      {/* Pull indicator */}
      <div
        className="pull-indicator"
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: Math.max(pullState.pullDistance, pullState.isRefreshing ? 60 : 0),
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(to bottom, rgba(16, 185, 129, 0.1), rgba(16, 185, 129, 0.05))',
          transform: `translateY(${pullState.isRefreshing ? 0 : -60}px)`,
          transition: pullState.isPulling ? 'none' : 'all 0.3s ease-out',
          zIndex: 10
        }}
      >
        <div className="flex items-center space-x-3">
          {/* Refresh icon */}
          <div
            className="refresh-icon"
            style={{
              width: 24,
              height: 24,
              transform: `rotate(${getRefreshProgress() * 360}deg)`,
              transition: pullState.isPulling ? 'none' : 'transform 0.3s ease-out'
            }}
          >
            {pullState.isRefreshing ? (
              <div className="animate-spin">
                <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6 text-primary-600">
                  <circle
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeDasharray="60"
                    strokeDashoffset="30"
                  />
                </svg>
              </div>
            ) : (
              <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6 text-primary-600">
                <path
                  d="M4 12a8 8 0 0 1 8-8V2.5"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M12 4V2.5L10.5 4L12 5.5"
                  fill="currentColor"
                />
                <circle
                  cx="12"
                  cy="12"
                  r="8"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeOpacity={getRefreshProgress()}
                />
              </svg>
            )}
          </div>

          {/* Text */}
          <span
            className="text-sm font-medium text-primary-700"
            style={{
              opacity: Math.max(getRefreshProgress(), pullState.isRefreshing ? 1 : 0)
            }}
          >
            {getRefreshText()}
          </span>
        </div>

        {/* Progress bar */}
        <div
          className="absolute bottom-0 left-0 h-1 bg-primary-500 transition-all duration-200"
          style={{
            width: `${getRefreshProgress() * 100}%`,
            opacity: pullState.isPulling ? 1 : 0
          }}
        />
      </div>

      {/* Content */}
      <div
        style={{
          transform: `translateY(${Math.max(pullState.pullDistance, pullState.isRefreshing ? 60 : 0)}px)`,
          transition: pullState.isPulling ? 'none' : 'transform 0.3s ease-out'
        }}
      >
        {children}
      </div>
    </div>
  );
};