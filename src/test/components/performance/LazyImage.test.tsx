import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { LazyImage } from '@/components/performance/LazyImage';

// Mock IntersectionObserver
const mockIntersectionObserver = vi.fn();
mockIntersectionObserver.mockReturnValue({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
});

global.IntersectionObserver = mockIntersectionObserver;

describe('LazyImage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render placeholder initially', () => {
    render(
      <LazyImage
        src="test-image.jpg"
        alt="Test image"
        placeholderSrc="Loading..."
      />
    );
    
    expect(screen.getByText('Loading...')).toBeInTheDocument();
    expect(screen.queryByAltText('Test image')).not.toBeInTheDocument();
  });

  it('should load image when in viewport', async () => {
    const mockObserve = vi.fn();
    mockIntersectionObserver.mockReturnValue({
      observe: mockObserve,
      unobserve: vi.fn(),
      disconnect: vi.fn(),
    });

    render(
      <LazyImage
        src="test-image.jpg"
        alt="Test image"
        placeholderSrc="Loading..."
      />
    );
    
    expect(mockObserve).toHaveBeenCalled();
    
    // Simulate intersection
    const [callback] = mockObserve.mock.calls[0];
    callback([{ isIntersecting: true }]);
    
    await waitFor(() => {
      expect(screen.getByAltText('Test image')).toBeInTheDocument();
    });
  });

  it('should handle loading states', async () => {
    render(
      <LazyImage
        src="test-image.jpg"
        alt="Test image"
        placeholderSrc="Loading..."
      />
    );
    
    const container = screen.getByTestId('lazy-image-container');
    expect(container).toHaveClass('loading');
    
    // Simulate image load
    const img = container.querySelector('img');
    if (img) {
      Object.defineProperty(img, 'complete', { value: true });
      img.dispatchEvent(new Event('load'));
    }
    
    await waitFor(() => {
      expect(container).toHaveClass('loaded');
    });
  });

  it('should handle error states', async () => {
    render(
      <LazyImage
        src="invalid-image.jpg"
        alt="Test image"
        placeholderSrc="Loading..."
        
      />
    );
    
    const container = screen.getByTestId('lazy-image-container');
    
    // Simulate image error
    const img = container.querySelector('img');
    if (img) {
      img.dispatchEvent(new Event('error'));
    }
    
    await waitFor(() => {
      expect(screen.getByText('Failed to load')).toBeInTheDocument();
      expect(container).toHaveClass('error');
    });
  });

  it('should apply blur effect during loading', () => {
    render(
      <LazyImage
        src="test-image.jpg"
        alt="Test image"
        
      />
    );
    
    const container = screen.getByTestId('lazy-image-container');
    expect(container).toHaveClass('blur-effect');
  });

  it('should handle different aspect ratios', () => {
    render(
      <LazyImage
        src="test-image.jpg"
        alt="Test image"
        aspectRatio={16/9}
      />
    );
    
    const container = screen.getByTestId('lazy-image-container');
    expect(container).toHaveStyle({ aspectRatio: '16/9' });
  });

  it('should support custom loading threshold', () => {
    const mockObserve = vi.fn();
    mockIntersectionObserver.mockReturnValue({
      observe: mockObserve,
      unobserve: vi.fn(),
      disconnect: vi.fn(),
    });

    render(
      <LazyImage
        src="test-image.jpg"
        alt="Test image"
        threshold={0.5}
      />
    );
    
    expect(mockIntersectionObserver).toHaveBeenCalledWith(
      expect.any(Function),
      expect.objectContaining({ threshold: 0.5 })
    );
  });

  it('should cleanup observer on unmount', () => {
    const mockDisconnect = vi.fn();
    mockIntersectionObserver.mockReturnValue({
      observe: vi.fn(),
      unobserve: vi.fn(),
      disconnect: mockDisconnect,
    });

    const { unmount } = render(
      <LazyImage src="test-image.jpg" alt="Test image" />
    );
    
    unmount();
    expect(mockDisconnect).toHaveBeenCalled();
  });

  it('should have proper accessibility attributes', () => {
    render(
      <LazyImage
        src="test-image.jpg"
        alt="Test image"
        placeholderSrc="Loading..."
      />
    );
    
    const container = screen.getByTestId('lazy-image-container');
    expect(container).toHaveAttribute('aria-busy', 'true');
    expect(container).toHaveAttribute('aria-label', 'Loading image');
  });
});