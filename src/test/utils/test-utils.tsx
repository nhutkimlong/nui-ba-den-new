import { vi } from 'vitest';
import { ReactElement } from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';

// Mock providers for testing
const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
  return (
    <BrowserRouter>
      {children}
    </BrowserRouter>
  );
};

const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>,
) => render(ui, { wrapper: AllTheProviders, ...options });

export * from '@testing-library/react';
export { customRender as render };

// Mock device detection for tests
export const mockDeviceDetection = (deviceType: 'mobile' | 'tablet' | 'desktop') => {
  const mockReturn = {
    mobile: {
      deviceType: 'mobile',
      isMobile: true,
      isTablet: false,
      isDesktop: false,
      orientation: 'portrait',
      screenSize: { width: 375, height: 667 }
    },
    tablet: {
      deviceType: 'tablet',
      isMobile: false,
      isTablet: true,
      isDesktop: false,
      orientation: 'landscape',
      screenSize: { width: 768, height: 1024 }
    },
    desktop: {
      deviceType: 'desktop',
      isMobile: false,
      isTablet: false,
      isDesktop: true,
      orientation: 'landscape',
      screenSize: { width: 1920, height: 1080 }
    }
  };

  return mockReturn[deviceType];
};

// Accessibility testing helpers
export const checkAccessibility = async (container: HTMLElement) => {
  const { axe } = await import('jest-axe');
  const results = await axe(container);
  return results;
};

// Performance testing helpers
export const measureRenderTime = (renderFn: () => void) => {
  const start = performance.now();
  renderFn();
  const end = performance.now();
  return end - start;
};

// Mock intersection observer for lazy loading tests
export const mockIntersectionObserver = () => {
  const mockIntersectionObserver = vi.fn();
  mockIntersectionObserver.mockReturnValue({
    observe: vi.fn(),
    unobserve: vi.fn(),
    disconnect: vi.fn(),
  });
  
  Object.defineProperty(window, 'IntersectionObserver', {
    writable: true,
    configurable: true,
    value: mockIntersectionObserver,
  });
  
  return mockIntersectionObserver;
};

// Mock resize observer for responsive tests
export const mockResizeObserver = () => {
  const mockResizeObserver = vi.fn();
  mockResizeObserver.mockReturnValue({
    observe: vi.fn(),
    unobserve: vi.fn(),
    disconnect: vi.fn(),
  });
  
  Object.defineProperty(window, 'ResizeObserver', {
    writable: true,
    configurable: true,
    value: mockResizeObserver,
  });
  
  return mockResizeObserver;
};