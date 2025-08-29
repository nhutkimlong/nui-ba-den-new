import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import userEvent from '@testing-library/user-event';
import ModernButton from '@/components/modern/ModernButton';

describe('ModernButton', () => {
  it('should render with correct variant styles', () => {
    render(<ModernButton variant="primary">Primary Button</ModernButton>);
    const button = screen.getByRole('button');
    expect(button).toHaveClass('modern-button', 'variant-primary');
  });

  it('should render all variants correctly', () => {
    const variants = ['primary', 'secondary', 'ghost', 'glass'] as const;
    
    variants.forEach(variant => {
      const { unmount } = render(<ModernButton variant={variant}>{variant}</ModernButton>);
      const button = screen.getByRole('button');
      expect(button).toHaveClass(`variant-${variant}`);
      unmount();
    });
  });

  it('should render all sizes correctly', () => {
    const sizes = ['sm', 'md', 'lg'] as const;
    
    sizes.forEach(size => {
      const { unmount } = render(<ModernButton size={size}>{size}</ModernButton>);
      const button = screen.getByRole('button');
      expect(button).toHaveClass(`size-${size}`);
      unmount();
    });
  });

  it('should handle loading state', () => {
    render(<ModernButton loading>Loading Button</ModernButton>);
    const button = screen.getByRole('button');
    expect(button).toBeDisabled();
    expect(button).toHaveClass('loading');
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('should handle disabled state', () => {
    render(<ModernButton disabled>Disabled Button</ModernButton>);
    const button = screen.getByRole('button');
    expect(button).toBeDisabled();
    expect(button).toHaveClass('disabled');
  });

  it('should render with icon', () => {
    const TestIcon = () => <span data-testid="test-icon">Icon</span>;
    render(<ModernButton icon={<TestIcon />}>Button with Icon</ModernButton>);
    expect(screen.getByTestId('test-icon')).toBeInTheDocument();
  });

  it('should handle click events', async () => {
    const handleClick = vi.fn();
    const user = userEvent.setup();
    
    render(<ModernButton onClick={handleClick}>Click me</ModernButton>);
    const button = screen.getByRole('button');
    
    await user.click(button);
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('should not trigger click when disabled', async () => {
    const handleClick = vi.fn();
    const user = userEvent.setup();
    
    render(<ModernButton disabled onClick={handleClick}>Disabled</ModernButton>);
    const button = screen.getByRole('button');
    
    await user.click(button);
    expect(handleClick).not.toHaveBeenCalled();
  });

  it('should not trigger click when loading', async () => {
    const handleClick = vi.fn();
    const user = userEvent.setup();
    
    render(<ModernButton loading onClick={handleClick}>Loading</ModernButton>);
    const button = screen.getByRole('button');
    
    await user.click(button);
    expect(handleClick).not.toHaveBeenCalled();
  });

  it('should support keyboard navigation', async () => {
    const handleClick = vi.fn();
    const user = userEvent.setup();
    
    render(<ModernButton onClick={handleClick}>Keyboard Button</ModernButton>);
    const button = screen.getByRole('button');
    
    button.focus();
    expect(button).toHaveFocus();
    
    await user.keyboard('{Enter}');
    expect(handleClick).toHaveBeenCalledTimes(1);
    
    await user.keyboard(' ');
    expect(handleClick).toHaveBeenCalledTimes(2);
  });

  it('should have proper ARIA attributes', () => {
    render(<ModernButton aria-label="Custom label">Button</ModernButton>);
    const button = screen.getByRole('button');
    expect(button).toHaveAttribute('aria-label', 'Custom label');
  });

  it('should have proper ARIA attributes when loading', () => {
    render(<ModernButton loading>Loading Button</ModernButton>);
    const button = screen.getByRole('button');
    expect(button).toHaveAttribute('aria-busy', 'true');
    expect(button).toHaveAttribute('aria-disabled', 'true');
  });

  it('should apply custom className', () => {
    render(<ModernButton className="custom-class">Custom Button</ModernButton>);
    const button = screen.getByRole('button');
    expect(button).toHaveClass('custom-class');
  });

  it('should forward ref correctly', () => {
    const ref = vi.fn();
    render(<ModernButton ref={ref}>Ref Button</ModernButton>);
    expect(ref).toHaveBeenCalled();
  });
});