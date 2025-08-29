import { useState, useCallback } from 'react';

interface PullToRefreshState {
  isRefreshing: boolean;
  lastRefreshTime: number | null;
  refreshCount: number;
}

interface UsePullToRefreshOptions {
  onRefresh: () => Promise<void> | void;
  cooldownMs?: number;
  enableAutoRefresh?: boolean;
  autoRefreshInterval?: number;
}

export const usePullToRefresh = ({
  onRefresh,
  cooldownMs = 1000,
  enableAutoRefresh = false,
  autoRefreshInterval = 30000
}: UsePullToRefreshOptions) => {
  const [state, setState] = useState<PullToRefreshState>({
    isRefreshing: false,
    lastRefreshTime: null,
    refreshCount: 0
  });

  const handleRefresh = useCallback(async () => {
    const now = Date.now();
    
    // Check cooldown
    if (state.lastRefreshTime && (now - state.lastRefreshTime) < cooldownMs) {
      return;
    }

    setState(prev => ({ ...prev, isRefreshing: true }));

    try {
      await onRefresh();
      setState(prev => ({
        ...prev,
        isRefreshing: false,
        lastRefreshTime: now,
        refreshCount: prev.refreshCount + 1
      }));
    } catch (error) {
      setState(prev => ({ ...prev, isRefreshing: false }));
      throw error;
    }
  }, [onRefresh, cooldownMs, state.lastRefreshTime]);

  const canRefresh = useCallback(() => {
    if (state.isRefreshing) return false;
    if (!state.lastRefreshTime) return true;
    
    const now = Date.now();
    return (now - state.lastRefreshTime) >= cooldownMs;
  }, [state.isRefreshing, state.lastRefreshTime, cooldownMs]);

  // Auto refresh functionality
  const startAutoRefresh = useCallback(() => {
    if (!enableAutoRefresh) return;

    const interval = setInterval(() => {
      if (canRefresh()) {
        handleRefresh();
      }
    }, autoRefreshInterval);

    return () => clearInterval(interval);
  }, [enableAutoRefresh, autoRefreshInterval, canRefresh, handleRefresh]);

  return {
    isRefreshing: state.isRefreshing,
    lastRefreshTime: state.lastRefreshTime,
    refreshCount: state.refreshCount,
    handleRefresh,
    canRefresh: canRefresh(),
    startAutoRefresh
  };
};

// Hook for managing multiple refresh sources
export const useMultiSourceRefresh = (sources: Array<() => Promise<void>>) => {
  const [refreshingStates, setRefreshingStates] = useState<boolean[]>(
    new Array(sources.length).fill(false)
  );

  const refreshAll = useCallback(async () => {
    setRefreshingStates(new Array(sources.length).fill(true));

    try {
      await Promise.all(sources.map(source => source()));
    } finally {
      setRefreshingStates(new Array(sources.length).fill(false));
    }
  }, [sources]);

  const refreshSource = useCallback(async (index: number) => {
    if (index < 0 || index >= sources.length) return;

    setRefreshingStates(prev => {
      const newStates = [...prev];
      newStates[index] = true;
      return newStates;
    });

    try {
      await sources[index]();
    } finally {
      setRefreshingStates(prev => {
        const newStates = [...prev];
        newStates[index] = false;
        return newStates;
      });
    }
  }, [sources]);

  return {
    refreshingStates,
    isAnyRefreshing: refreshingStates.some(state => state),
    isAllRefreshing: refreshingStates.every(state => state),
    refreshAll,
    refreshSource
  };
};