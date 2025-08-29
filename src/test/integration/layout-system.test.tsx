import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import AdaptiveLayout from '@/components/layout/AdaptiveLayout';
import ResponsiveGrid from '@/components/layout/ResponsiveGrid';
import MobileBottomNav from '@/components/layout/MobileBottomNav';
import TabletSidebar from '@/components/layout/TabletSidebar';

// Mock device detection
vi.mock('@/hooks/useDeviceDetection', () => ({
  useDeviceDetection: vi.fn(() => ({
    deviceType: 'mobile',
    isMobile: true,
    isTablet: false,
    isDesktop: false,
    orientation: 'portrait',
    screenSize: { width: 375, height: 667 }
  }))
}));

describe('Layout System Integration', () => {
  it('should render complete mobile layout', () => {
    const navItems = [
      { id: 'home', label: 'Home', icon: '🏠' },
      { id: 'map', label: 'Map', icon: '🗺️' },
      { id: 'profile', label: 'Profile', icon: '👤' }
    ];

    const gridItems = [
      { id: '1', content: <div>Item 1</div>, size: 'medium' as const },
      { id: '2', content: <div>Item 2</div>, size: 'medium' as const },
      { id: '3', content: <div>Item 3</div>, size: 'medium' as const }
    ];

    render(
      <AdaptiveLayout
        bottomNav={
          <MobileBottomNav
            activeIndex={0}
            onItemClick={() => {}}
          />
        }
      >
        <ResponsiveGrid
          columns={{ mobile: 1, tablet: 2, desktop: 3 }}
          gap={16}
        />
      </AdaptiveLayout>
    );

    // Check layout structure
    expect(screen.getByRole('main')).toHaveClass('layout-mobile');
    expect(screen.getByRole('navigation')).toBeInTheDocument();
    expect(screen.getByRole('grid')).toBeInTheDocument();
    
    // Check navigation items
    expect(screen.getByText('Home')).toBeInTheDocument();
    expect(screen.getByText('Map')).toBeInTheDocument();
    expect(screen.getByText('Profile')).toBeInTheDocument();
    
    // Check grid items
    expect(screen.getByText('Item 1')).toBeInTheDocument();
    expect(screen.getByText('Item 2')).toBeInTheDocument();
    expect(screen.getByText('Item 3')).toBeInTheDocument();
  });

  it('should render complete tablet layout', () => {
    const { useDeviceDetection } = require('@/hooks/useDeviceDetection');
    useDeviceDetection.mockReturnValue({
      deviceType: 'tablet',
      isMobile: false,
      isTablet: true,
      isDesktop: false,
      orientation: 'landscape',
      screenSize: { width: 1024, height: 768 }
    });

    const sidebarItems = [
      { id: 'dashboard', label: 'Dashboard', icon: '📊' },
      { id: 'settings', label: 'Settings', icon: '⚙️' }
    ];

    render(
      <AdaptiveLayout
        sidebar={
          <TabletSidebar
            isOpen={true}
            onClose={() => {}}
            />
        }
      >
        <div>Tablet Content</div>
      </AdaptiveLayout>
    );

    expect(screen.getByRole('main')).toHaveClass('layout-tablet');
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Settings')).toBeInTheDocument();
    expect(screen.getByText('Tablet Content')).toBeInTheDocument();
  });

  it('should handle responsive breakpoint changes', () => {
    const { useDeviceDetection } = require('@/hooks/useDeviceDetection');
    
    // Start with mobile
    useDeviceDetection.mockReturnValue({
      deviceType: 'mobile',
      isMobile: true,
      screenSize: { width: 375, height: 667 }
    });

    const { rerender } = render(
      <AdaptiveLayout>
        <ResponsiveGrid
          items={[{ id: '1', content: <div>Item</div>, size: 'medium' as const }]}
          columns={{ mobile: 1, tablet: 2, desktop: 3 }}
          gap={16}
        />
      </AdaptiveLayout>
    );

    let layout = screen.getByRole('main');
    let grid = screen.getByRole('grid');
    
    expect(layout).toHaveClass('layout-mobile');
    expect(grid).toHaveClass('cols-mobile-1');

    // Change to tablet
    useDeviceDetection.mockReturnValue({
      deviceType: 'tablet',
      isTablet: true,
      screenSize: { width: 768, height: 1024 }
    });

    rerender(
      <AdaptiveLayout>
        <ResponsiveGrid
          items={[{ id: '1', content: <div>Item</div>, size: 'medium' as const }]}
          columns={{ mobile: 1, tablet: 2, desktop: 3 }}
          gap={16}
        />
      </AdaptiveLayout>
    );

    layout = screen.getByRole('main');
    grid = screen.getByRole('grid');
    
    expect(layout).toHaveClass('layout-tablet');
    expect(grid).toHaveClass('cols-tablet-2');
  });

  it('should handle navigation interactions', () => {
    const handleNavClick = vi.fn();
    const navItems = [
      { id: 'home', label: 'Home', icon: '🏠' },
      { id: 'map', label: 'Map', icon: '🗺️' }
    ];

    render(
      <AdaptiveLayout
        bottomNav={
          <MobileBottomNav
            activeIndex={0}
            onItemClick={handleNavClick}
          />
        }
      >
        <div>Content</div>
      </AdaptiveLayout>
    );

    const mapButton = screen.getByText('Map');
    fireEvent.click(mapButton);
    
    expect(handleNavClick).toHaveBeenCalledWith(1);
  });

  it('should maintain layout consistency across components', () => {
    render(
      <AdaptiveLayout className="test-layout">
        <ResponsiveGrid
          items={[
            { id: '1', content: <div>Grid Item 1</div>, size: 'medium' as const },
            { id: '2', content: <div>Grid Item 2</div>, size: 'medium' as const }
          ]}
          columns={{ mobile: 1, tablet: 2, desktop: 3 }}
          gap={16}
          className="test-grid"
        />
      </AdaptiveLayout>
    );

    const layout = screen.getByRole('main');
    const grid = screen.getByRole('grid');
    
    expect(layout).toHaveClass('test-layout', 'adaptive-layout');
    expect(grid).toHaveClass('test-grid', 'responsive-grid');
    
    // Check consistent spacing
    expect(grid).toHaveStyle({ gap: '16px' });
  });

  it('should handle safe area adjustments', () => {
    // Mock safe area values
    Object.defineProperty(window, 'CSS', {
      value: {
        supports: vi.fn().mockReturnValue(true)
      }
    });

    render(
      <AdaptiveLayout>
        <div>Safe Area Content</div>
      </AdaptiveLayout>
    );

    const layout = screen.getByRole('main');
    expect(layout).toHaveClass('safe-area-aware');
  });
});