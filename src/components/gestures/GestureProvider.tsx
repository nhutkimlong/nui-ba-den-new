import React, { createContext, useContext, ReactNode } from 'react';
import { useGestureNavigation } from '../../hooks/useGestureNavigation';

interface GestureConfig {
  enableBackGesture?: boolean;
  enableForwardGesture?: boolean;
}

interface GestureContextValue {
  gestureRef: React.MutableRefObject<HTMLElement | null>;
  isGestureEnabled: boolean;
  enableGestures: () => void;
  disableGestures: () => void;
}

const GestureContext = createContext<GestureContextValue | null>(null);

interface GestureProviderProps {
  children: ReactNode;
  config?: GestureConfig;
  enableNavigation?: boolean;
  className?: string;
}

export const GestureProvider: React.FC<GestureProviderProps> = ({
  children,
  config,
  enableNavigation = true,
  className = ''
}) => {
  const [isGestureEnabled, setIsGestureEnabled] = React.useState(true);
  
  const { gestureRef } = useGestureNavigation(
    enableNavigation ? config : { ...config, enableBackGesture: false, enableForwardGesture: false }
  );

  const enableGestures = React.useCallback(() => {
    setIsGestureEnabled(true);
  }, []);

  const disableGestures = React.useCallback(() => {
    setIsGestureEnabled(false);
  }, []);

  const contextValue: GestureContextValue = {
    gestureRef: gestureRef.ref,
    isGestureEnabled,
    enableGestures,
    disableGestures
  };

  return (
    <GestureContext.Provider value={contextValue}>
      <div 
        ref={gestureRef.ref as React.RefObject<HTMLDivElement>}
        className={`gesture-container ${className}`}
        style={{ 
          width: '100%', 
          height: '100%',
          touchAction: isGestureEnabled ? 'none' : 'auto'
        }}
      >
        {children}
      </div>
    </GestureContext.Provider>
  );
};

export const useGestureContext = (): GestureContextValue => {
  const context = useContext(GestureContext);
  if (!context) {
    throw new Error('useGestureContext must be used within a GestureProvider');
  }
  return context;
};