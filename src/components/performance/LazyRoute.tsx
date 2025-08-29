import React, { Suspense, lazy, ComponentType } from 'react';
import { ErrorBoundary } from '../common/ErrorBoundary';

interface LazyRouteProps {
  fallback?: React.ReactNode;
  errorFallback?: React.ComponentType<{ error: Error; retry: () => void }>;
  children: React.ReactNode;
}

// Default loading component
const DefaultLoadingFallback = () => (
  <div className="flex items-center justify-center min-h-[200px]">
    <div className="flex flex-col items-center space-y-4">
      <div className="w-8 h-8 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
      <p className="text-sm text-gray-600">Loading...</p>
    </div>
  </div>
);

// Default error component
const DefaultErrorFallback = ({ error, retry }: { error: Error; retry: () => void }) => (
  <div className="flex items-center justify-center min-h-[200px]">
    <div className="text-center space-y-4">
      <div className="w-12 h-12 mx-auto text-red-500">
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
          />
        </svg>
      </div>
      <div>
        <h3 className="text-lg font-semibold text-gray-900">Something went wrong</h3>
        <p className="text-sm text-gray-600 mt-1">{error.message}</p>
      </div>
      <button
        onClick={retry}
        className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors"
      >
        Try again
      </button>
    </div>
  </div>
);

export function LazyRoute({
  fallback = <DefaultLoadingFallback />,
  errorFallback = DefaultErrorFallback,
  children
}: LazyRouteProps) {
  return (
    <ErrorBoundary fallback={<div>Error loading component</div>}>
      <Suspense fallback={fallback}>
        {children}
      </Suspense>
    </ErrorBoundary>
  );
}

// Utility function to create lazy components with better error handling
export function createLazyComponent<T extends ComponentType<any>>(
  importFn: () => Promise<{ default: T }>,
  options: {
    fallback?: React.ReactNode;
    errorFallback?: React.ComponentType<{ error: Error; retry: () => void }>;
    retryDelay?: number;
    maxRetries?: number;
  } = {}
) {
  const {
    fallback = <DefaultLoadingFallback />,
    errorFallback = DefaultErrorFallback,
    retryDelay = 1000,
    maxRetries = 3
  } = options;

  // Enhanced import function with retry logic
  const enhancedImportFn = async (): Promise<{ default: T }> => {
    let lastError: Error;
    
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        return await importFn();
      } catch (error) {
        lastError = error as Error;
        
        if (attempt < maxRetries) {
          // Wait before retrying
          await new Promise(resolve => setTimeout(resolve, retryDelay * (attempt + 1)));
        }
      }
    }
    
    throw lastError!;
  };

  const LazyComponent = lazy(enhancedImportFn);

  return function WrappedLazyComponent(props: React.ComponentProps<T>) {
    return (
      <LazyRoute fallback={fallback} errorFallback={errorFallback}>
        <LazyComponent {...props} />
      </LazyRoute>
    );
  };
}

// Preload utility for better UX
export function preloadComponent<T extends ComponentType<any>>(
  importFn: () => Promise<{ default: T }>
): Promise<{ default: T }> {
  return importFn();
}

// Hook for preloading components on hover/focus
export function usePreloadComponent<T extends ComponentType<any>>(
  importFn: () => Promise<{ default: T }>,
  trigger: 'hover' | 'focus' | 'immediate' = 'hover'
) {
  const [isPreloaded, setIsPreloaded] = React.useState(false);

  const preload = React.useCallback(() => {
    if (!isPreloaded) {
      importFn().then(() => setIsPreloaded(true));
    }
  }, [importFn, isPreloaded]);

  React.useEffect(() => {
    if (trigger === 'immediate') {
      preload();
    }
  }, [trigger, preload]);

  const handlers = React.useMemo(() => {
    if (trigger === 'hover') {
      return {
        onMouseEnter: preload,
        onFocus: preload
      };
    }
    if (trigger === 'focus') {
      return {
        onFocus: preload
      };
    }
    return {};
  }, [trigger, preload]);

  return { handlers, isPreloaded };
}

// Progressive loading component for complex pages
interface ProgressivePageProps {
  children: React.ReactNode;
  stages: Array<{
    component: React.ComponentType;
    priority: number;
    delay?: number;
  }>;
}

export function ProgressivePage({ children, stages }: ProgressivePageProps) {
  const [loadedStages, setLoadedStages] = React.useState<Set<number>>(new Set([0]));

  React.useEffect(() => {
    // Sort stages by priority
    const sortedStages = [...stages].sort((a, b) => a.priority - b.priority);

    // Load stages progressively
    sortedStages.forEach((stage, index) => {
      const delay = stage.delay || index * 100;
      
      setTimeout(() => {
        setLoadedStages(prev => new Set([...prev, stage.priority]));
      }, delay);
    });
  }, [stages]);

  return (
    <div>
      {children}
      {stages.map((stage, index) => {
        const Component = stage.component;
        const isLoaded = loadedStages.has(stage.priority);
        
        return (
          <div
            key={index}
            className={`transition-opacity duration-300 ${
              isLoaded ? 'opacity-100' : 'opacity-0'
            }`}
          >
            {isLoaded && <Component />}
          </div>
        );
      })}
    </div>
  );
}