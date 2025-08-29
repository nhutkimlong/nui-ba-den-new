import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import ResponsiveGrid from '@/components/layout/ResponsiveGrid';

// Mock ResizeObserver
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

describe('ResponsiveGrid', () => {
  const mockItems = [
    { id: '1', content: <div data-testid="item-1">Item 1</div>, size: 'medium' as const },
    { id: '2', content: <div data-testid="item-2">Item 2</div>, size: 'medium' as const },
    { id: '3', content: <div data-testid="item-3">Item 3</div>, size: 'medium' as const },
  ];

  it('should render all grid items', () => {
    render(
      <ResponsiveGrid
        items={mockItems}
        columns={{ mobile: 1, tablet: 2, desktop: 3 }}
        gap={16}
      />
    );
    
    expect(screen.getByTestId('item-1')).toBeInTheDocument();
    expect(screen.getByTestId('item-2')).toBeInTheDocument();
    expect(screen.getByTestId('item-3')).toBeInTheDocument();
  });

  it('should apply correct grid classes', () => {
    render(
      <ResponsiveGrid
        items={mockItems}
        columns={{ mobile: 1, tablet: 2, desktop: 3 }}
        gap={16}
      />
    );
    
    const grid = screen.getByRole('grid');
    expect(grid).toHaveClass('responsive-grid');
    expect(grid).toHaveStyle({ gap: '16px' });
  });

  it('should handle masonry variant', () => {
    render(
      <ResponsiveGrid
        items={mockItems}
        columns={{ mobile: 1, tablet: 2, desktop: 3 }}
        gap={16}
        variant="masonry"
      />
    );
    
    const grid = screen.getByRole('grid');
    expect(grid).toHaveClass('masonry');
  });

  it('should handle bento variant', () => {
    render(
      <ResponsiveGrid
        items={mockItems}
        columns={{ mobile: 1, tablet: 2, desktop: 3 }}
        gap={16}
        variant="bento"
      />
    );
    
    const grid = screen.getByRole('grid');
    expect(grid).toHaveClass('bento');
  });

  it('should handle standard variant', () => {
    render(
      <ResponsiveGrid
        items={mockItems}
        columns={{ mobile: 1, tablet: 2, desktop: 3 }}
        gap={16}
        variant="standard"
      />
    );
    
    const grid = screen.getByRole('grid');
    expect(grid).toHaveClass('standard');
  });

  it('should apply custom className', () => {
    render(
      <ResponsiveGrid
        items={mockItems}
        columns={{ mobile: 1, tablet: 2, desktop: 3 }}
        gap={16}
        className="custom-grid"
      />
    );
    
    const grid = screen.getByRole('grid');
    expect(grid).toHaveClass('custom-grid');
  });

  it('should handle empty items array', () => {
    render(
      <ResponsiveGrid
        items={[]}
        columns={{ mobile: 1, tablet: 2, desktop: 3 }}
        gap={16}
      />
    );
    
    const grid = screen.getByRole('grid');
    expect(grid).toBeInTheDocument();
    expect(grid.children).toHaveLength(0);
  });

  it('should apply responsive column classes', () => {
    render(
      <ResponsiveGrid
        items={mockItems}
        columns={{ mobile: 1, tablet: 2, desktop: 4 }}
        gap={16}
      />
    );
    
    const grid = screen.getByRole('grid');
    expect(grid).toHaveClass('cols-mobile-1', 'cols-tablet-2', 'cols-desktop-4');
  });

  it('should handle auto-resize when enabled', () => {
    render(
      <ResponsiveGrid
        items={mockItems}
        columns={{ mobile: 1, tablet: 2, desktop: 3 }}
        gap={16}
        autoResize
      />
    );
    
    const grid = screen.getByRole('grid');
    expect(grid).toHaveClass('auto-resize');
  });

  it('should have proper ARIA attributes', () => {
    render(
      <ResponsiveGrid
        items={mockItems}
        columns={{ mobile: 1, tablet: 2, desktop: 3 }}
        gap={16}
      />
    );
    
    const grid = screen.getByRole('grid');
    expect(grid).toHaveAttribute('role', 'grid');
  });
});