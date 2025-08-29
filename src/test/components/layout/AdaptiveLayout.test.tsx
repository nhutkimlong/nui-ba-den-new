import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import AdaptiveLayout from '@/components/layout/AdaptiveLayout';

// Mock the device detection hook
vi.mock('@/hooks/useDeviceDetection', () => ({
  useDeviceDetection: vi.fn(() => ({
    deviceType: 'desktop',
    isMobile: false,
    isTablet: false,
    isDesktop: true,
    orientation: 'landscape',
    screenSize: { width: 1920, height: 1080 }
  }))
}));

describe('AdaptiveLayout', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render children correctly', () => {
    render(
      <AdaptiveLayout>
        <div data-testid="child-content">Test Content</div>
      </AdaptiveLayout>
    );
    
    expect(screen.getByTestId('child-content')).toBeInTheDocument();
  });

  it('should apply correct layout class for desktop', () => {
    const { useDeviceDetection } = require('@/hooks/useDeviceDetection');
    useDeviceDetection.mockReturnValue({
      deviceType: 'desktop',
      isMobile: false,
      isTablet: false,
      isDesktop: true
    });

    render(
      <AdaptiveLayout>
        <div>Content</div>
      </AdaptiveLayout>
    );
    
    const layout = screen.getByRole('main');
    expect(layout).toHaveClass('layout-desktop');
  });

  it('should apply correct layout class for tablet', () => {
    const { useDeviceDetection } = require('@/hooks/useDeviceDetection');
    useDeviceDetection.mockReturnValue({
      deviceType: 'tablet',
      isMobile: false,
      isTablet: true,
      isDesktop: false
    });

    render(
      <AdaptiveLayout>
        <div>Content</div>
      </AdaptiveLayout>
    );
    
    const layout = screen.getByRole('main');
    expect(layout).toHaveClass('layout-tablet');
  });

  it('should apply correct layout class for mobile', () => {
    const { useDeviceDetection } = require('@/hooks/useDeviceDetection');
    useDeviceDetection.mockReturnValue({
      deviceType: 'mobile',
      isMobile: true,
      isTablet: false,
      isDesktop: false
    });

    render(
      <AdaptiveLayout>
        <div>Content</div>
      </AdaptiveLayout>
    );
    
    const layout = screen.getByRole('main');
    expect(layout).toHaveClass('layout-mobile');
  });

  it('should render sidebar when provided', () => {
    render(
      <AdaptiveLayout sidebar={<div data-testid="sidebar">Sidebar</div>}>
        <div>Content</div>
      </AdaptiveLayout>
    );
    
    expect(screen.getByTestId('sidebar')).toBeInTheDocument();
  });

  it('should render bottom navigation when provided', () => {
    render(
      <AdaptiveLayout bottomNav={<div data-testid="bottom-nav">Bottom Nav</div>}>
        <div>Content</div>
      </AdaptiveLayout>
    );
    
    expect(screen.getByTestId('bottom-nav')).toBeInTheDocument();
  });

  it('should apply custom className', () => {
    render(
      <AdaptiveLayout className="custom-layout">
        <div>Content</div>
      </AdaptiveLayout>
    );
    
    const layout = screen.getByRole('main');
    expect(layout).toHaveClass('custom-layout');
  });

  it('should handle orientation changes', () => {
    const { useDeviceDetection } = require('@/hooks/useDeviceDetection');
    useDeviceDetection.mockReturnValue({
      deviceType: 'mobile',
      isMobile: true,
      orientation: 'portrait'
    });

    const { rerender } = render(
      <AdaptiveLayout>
        <div>Content</div>
      </AdaptiveLayout>
    );
    
    let layout = screen.getByRole('main');
    expect(layout).toHaveClass('orientation-portrait');

    // Simulate orientation change
    useDeviceDetection.mockReturnValue({
      deviceType: 'mobile',
      isMobile: true,
      orientation: 'landscape'
    });

    rerender(
      <AdaptiveLayout>
        <div>Content</div>
      </AdaptiveLayout>
    );
    
    layout = screen.getByRole('main');
    expect(layout).toHaveClass('orientation-landscape');
  });

  it('should have proper semantic structure', () => {
    render(
      <AdaptiveLayout>
        <div>Content</div>
      </AdaptiveLayout>
    );
    
    expect(screen.getByRole('main')).toBeInTheDocument();
  });
});