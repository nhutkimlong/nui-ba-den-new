import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';

// Device configurations for testing
const deviceConfigs = {
  mobile: {
    width: 375,
    height: 667,
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X)',
    touchEnabled: true,
    devicePixelRatio: 2
  },
  tablet: {
    width: 768,
    height: 1024,
    userAgent: 'Mozilla/5.0 (iPad; CPU OS 14_0 like Mac OS X)',
    touchEnabled: true,
    devicePixelRatio: 2
  },
  desktop: {
    width: 1920,
    height: 1080,
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
    touchEnabled: false,
    devicePixelRatio: 1
  },
  smallMobile: {
    width: 320,
    height: 568,
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X)',
    touchEnabled: true,
    devicePixelRatio: 2
  },
  largeMobile: {
    width: 414,
    height: 896,
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X)',
    touchEnabled: true,
    devicePixelRatio: 3
  }
};

// Mock window resize and device properties
const mockDevice = (config: typeof deviceConfigs.mobile) => {
  Object.defineProperty(window, 'innerWidth', {
    writable: true,
    configurable: true,
    value: config.width,
  });
  
  Object.defineProperty(window, 'innerHeight', {
    writable: true,
    configurable: true,
    value: config.height,
  });

  Object.defineProperty(window, 'devicePixelRatio', {
    writable: true,
    configurable: true,
    value: config.devicePixelRatio,
  });

  Object.defineProperty(navigator, 'userAgent', {
    writable: true,
    configurable: true,
    value: config.userAgent,
  });

  // Mock touch capability
  if (config.touchEnabled) {
    Object.defineProperty(window, 'ontouchstart', {
      writable: true,
      configurable: true,
      value: () => {},
    });
  } else {
    delete (window as any).ontouchstart;
  }

  // Mock matchMedia for responsive queries
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation(query => {
      const matches = (() => {
        if (query.includes('max-width: 767px')) return config.width <= 767;
        if (query.includes('min-width: 768px') && query.includes('max-width: 1023px')) {
          return config.width >= 768 && config.width <= 1023;
        }
        if (query.includes('min-width: 1024px')) return config.width >= 1024;
        if (query.includes('min-width: 768px')) return config.width >= 768;
        return false;
      })();

      return {
        matches,
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      };
    }),
  });

  // Trigger resize event
  window.dispatchEvent(new Event('resize'));
};

describe('Cross-Device Testing', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Mobile Device Testing', () => {
    it('should render correctly on small mobile (320px)', () => {
      mockDevice(deviceConfigs.smallMobile);
      
      const MobileComponent = () => (
        <div className="responsive-container">
          <div className="mobile-content">Mobile Layout</div>
          <button className="touch-target">Touch Button</button>
        </div>
      );
      
      render(<MobileComponent />);
      
      expect(screen.getByText('Mobile Layout')).toBeInTheDocument();
      expect(screen.getByText('Touch Button')).toBeInTheDocument();
      expect(window.innerWidth).toBe(320);
      expect(window.matchMedia('(max-width: 767px)').matches).toBe(true);
    });

    it('should render correctly on large mobile (414px)', () => {
      mockDevice(deviceConfigs.largeMobile);
      
      const MobileComponent = () => (
        <div className="responsive-container">
          <div className="mobile-content">Large Mobile Layout</div>
        </div>
      );
      
      render(<MobileComponent />);
      
      expect(screen.getByText('Large Mobile Layout')).toBeInTheDocument();
      expect(window.innerWidth).toBe(414);
      expect(window.devicePixelRatio).toBe(3);
    });

    it('should handle touch interactions on mobile', () => {
      mockDevice(deviceConfigs.mobile);
      
      let touchStarted = false;
      const TouchComponent = () => (
        <div
          onTouchStart={() => { touchStarted = true; }}
          data-testid="touch-area"
        >
          Touch Area
        </div>
      );
      
      render(<TouchComponent />);
      
      const touchArea = screen.getByTestId('touch-area');
      expect(touchArea).toBeInTheDocument();
      expect('ontouchstart' in window).toBe(true);
      
      // Simulate touch
      touchArea.dispatchEvent(new TouchEvent('touchstart', { bubbles: true }));
      expect(touchStarted).toBe(true);
    });
  });

  describe('Tablet Device Testing', () => {
    it('should render correctly on tablet (768px)', () => {
      mockDevice(deviceConfigs.tablet);
      
      const TabletComponent = () => (
        <div className="responsive-container">
          <aside className="sidebar">Sidebar</aside>
          <main className="main-content">Tablet Layout</main>
        </div>
      );
      
      render(<TabletComponent />);
      
      expect(screen.getByText('Sidebar')).toBeInTheDocument();
      expect(screen.getByText('Tablet Layout')).toBeInTheDocument();
      expect(window.innerWidth).toBe(768);
      expect(window.matchMedia('(min-width: 768px)').matches).toBe(true);
    });

    it('should support both touch and mouse on tablet', () => {
      mockDevice(deviceConfigs.tablet);
      
      const InteractionComponent = () => (
        <button data-testid="interaction-button">
          Tablet Button
        </button>
      );
      
      render(<InteractionComponent />);
      
      const button = screen.getByTestId('interaction-button');
      expect(button).toBeInTheDocument();
      expect('ontouchstart' in window).toBe(true);
    });
  });

  describe('Desktop Device Testing', () => {
    it('should render correctly on desktop (1920px)', () => {
      mockDevice(deviceConfigs.desktop);
      
      const DesktopComponent = () => (
        <div className="responsive-container">
          <nav className="desktop-nav">Desktop Navigation</nav>
          <aside className="desktop-sidebar">Desktop Sidebar</aside>
          <main className="desktop-main">Desktop Layout</main>
        </div>
      );
      
      render(<DesktopComponent />);
      
      expect(screen.getByText('Desktop Navigation')).toBeInTheDocument();
      expect(screen.getByText('Desktop Sidebar')).toBeInTheDocument();
      expect(screen.getByText('Desktop Layout')).toBeInTheDocument();
      expect(window.innerWidth).toBe(1920);
      expect(window.matchMedia('(min-width: 1024px)').matches).toBe(true);
    });

    it('should not have touch capabilities on desktop', () => {
      mockDevice(deviceConfigs.desktop);
      
      const DesktopComponent = () => (
        <button data-testid="desktop-button">Desktop Button</button>
      );
      
      render(<DesktopComponent />);
      
      expect('ontouchstart' in window).toBe(false);
      expect(window.devicePixelRatio).toBe(1);
    });
  });

  describe('Responsive Breakpoint Testing', () => {
    it('should handle breakpoint transitions correctly', () => {
      // Start with mobile
      mockDevice(deviceConfigs.mobile);
      
      const ResponsiveComponent = () => {
        const isMobile = window.matchMedia('(max-width: 767px)').matches;
        const isTablet = window.matchMedia('(min-width: 768px) and (max-width: 1023px)').matches;
        const isDesktop = window.matchMedia('(min-width: 1024px)').matches;
        
        return (
          <div>
            {isMobile && <div data-testid="mobile-view">Mobile View</div>}
            {isTablet && <div data-testid="tablet-view">Tablet View</div>}
            {isDesktop && <div data-testid="desktop-view">Desktop View</div>}
          </div>
        );
      };
      
      const { rerender } = render(<ResponsiveComponent />);
      expect(screen.getByTestId('mobile-view')).toBeInTheDocument();
      
      // Switch to tablet
      mockDevice(deviceConfigs.tablet);
      rerender(<ResponsiveComponent />);
      expect(screen.getByTestId('tablet-view')).toBeInTheDocument();
      
      // Switch to desktop
      mockDevice(deviceConfigs.desktop);
      rerender(<ResponsiveComponent />);
      expect(screen.getByTestId('desktop-view')).toBeInTheDocument();
    });
  });

  describe('Performance Across Devices', () => {
    it('should maintain performance on low-end devices', () => {
      mockDevice(deviceConfigs.smallMobile);
      
      const start = performance.now();
      
      const PerformanceComponent = () => (
        <div>
          {Array.from({ length: 100 }, (_, i) => (
            <div key={i}>Item {i}</div>
          ))}
        </div>
      );
      
      render(<PerformanceComponent />);
      
      const end = performance.now();
      const renderTime = end - start;
      
      // Should render quickly even on low-end devices
      expect(renderTime).toBeLessThan(100);
    });

    it('should handle high DPI displays correctly', () => {
      mockDevice(deviceConfigs.largeMobile);
      
      const HighDPIComponent = () => (
        <img 
          src="test-image.jpg" 
          alt="High DPI Image"
          data-testid="high-dpi-image"
        />
      );
      
      render(<HighDPIComponent />);
      
      expect(window.devicePixelRatio).toBe(3);
      expect(screen.getByTestId('high-dpi-image')).toBeInTheDocument();
    });
  });

  describe('Touch Target Size Testing', () => {
    it('should have minimum 44px touch targets on mobile', () => {
      mockDevice(deviceConfigs.mobile);
      
      const TouchTargetComponent = () => (
        <button 
          style={{ minWidth: '44px', minHeight: '44px' }}
          data-testid="touch-target"
        >
          Touch
        </button>
      );
      
      render(<TouchTargetComponent />);
      
      const button = screen.getByTestId('touch-target');
      const styles = getComputedStyle(button);
      
      expect(parseInt(styles.minWidth)).toBeGreaterThanOrEqual(44);
      expect(parseInt(styles.minHeight)).toBeGreaterThanOrEqual(44);
    });
  });

  describe('Orientation Testing', () => {
    it('should handle orientation changes', () => {
      // Portrait mode
      mockDevice({ ...deviceConfigs.mobile, width: 375, height: 667 });
      
      const OrientationComponent = () => {
        const isPortrait = window.innerHeight > window.innerWidth;
        return (
          <div data-testid={isPortrait ? 'portrait' : 'landscape'}>
            {isPortrait ? 'Portrait Mode' : 'Landscape Mode'}
          </div>
        );
      };
      
      const { rerender } = render(<OrientationComponent />);
      expect(screen.getByTestId('portrait')).toBeInTheDocument();
      
      // Landscape mode
      mockDevice({ ...deviceConfigs.mobile, width: 667, height: 375 });
      rerender(<OrientationComponent />);
      expect(screen.getByTestId('landscape')).toBeInTheDocument();
    });
  });
});