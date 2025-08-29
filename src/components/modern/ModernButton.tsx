import React, { forwardRef } from 'react';
import { cn } from '@/utils/cn';
import { Loader2 } from 'lucide-react';

export interface ModernButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'glass';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  icon?: React.ReactNode;
  children: React.ReactNode;
  fullWidth?: boolean;
}

const ModernButton = forwardRef<HTMLButtonElement, ModernButtonProps>(
  ({
    children,
    variant = 'primary',
    size = 'md',
    loading = false,
    icon,
    fullWidth = false,
    className,
    disabled,
    ...props
  }, ref) => {
    const baseClasses = [
      // Base styling
      'inline-flex items-center justify-center font-medium',
      'transition-all duration-200 ease-out',
      'focus:outline-none focus:ring-2 focus:ring-offset-2',
      'disabled:opacity-50 disabled:cursor-not-allowed',
      'touch-target haptic-feedback',
      'relative overflow-hidden',
      // Modern rounded corners
      'rounded-xl',
      // Smooth hover transform
      'hover:transform hover:-translate-y-0.5',
      'active:transform active:translate-y-0 active:scale-98'
    ].join(' ');

    const variantClasses = {
      primary: [
        'bg-gradient-to-r from-primary-500 to-primary-600',
        'text-white shadow-lg',
        'hover:from-primary-600 hover:to-primary-700',
        'hover:shadow-xl hover:shadow-primary-500/25',
        'focus:ring-primary-500',
        'active:from-primary-700 active:to-primary-800',
        // Subtle inner glow
        'before:absolute before:inset-0 before:rounded-xl',
        'before:bg-gradient-to-r before:from-white/10 before:to-transparent',
        'before:opacity-0 hover:before:opacity-100 before:transition-opacity'
      ].join(' '),

      secondary: [
        'bg-gradient-to-r from-neutral-100 to-neutral-200',
        'text-neutral-700 border border-neutral-300',
        'hover:from-neutral-200 hover:to-neutral-300',
        'hover:shadow-lg hover:border-neutral-400',
        'focus:ring-neutral-500',
        'active:from-neutral-300 active:to-neutral-400'
      ].join(' '),

      ghost: [
        'text-neutral-700 bg-transparent',
        'hover:bg-neutral-100/80',
        'focus:ring-neutral-500',
        'active:bg-neutral-200/80'
      ].join(' '),

      glass: [
        'bg-white/90 text-neutral-700 border border-gray-200',
        'hover:bg-white',
        'focus:ring-primary-500/50',
        'border border-gray-200',
        // Enhanced glass effect on hover
        'hover:border-white/30 hover:shadow-lg'
      ].join(' ')
    };

    const sizeClasses = {
      sm: 'px-4 py-2 text-sm gap-2 min-h-[36px]',
      md: 'px-6 py-3 text-base gap-2.5 min-h-[44px]',
      lg: 'px-8 py-4 text-lg gap-3 min-h-[52px]'
    };

    const widthClasses = fullWidth ? 'w-full' : '';

    return (
      <button
        ref={ref}
        className={cn(
          baseClasses,
          variantClasses[variant],
          sizeClasses[size],
          widthClasses,
          className
        )}
        disabled={disabled || loading}
        aria-busy={loading}
        aria-disabled={disabled || loading}
        {...props}
      >
        {loading && (
          <Loader2
            className="w-4 h-4 animate-spin"
            aria-hidden="true"
          />
        )}
        {!loading && icon && (
          <span className="flex-shrink-0" aria-hidden="true">
            {icon}
          </span>
        )}
        <span className="flex-shrink-0">
          {children}
        </span>

        {/* Ripple effect overlay */}
        <span
          className="absolute inset-0 rounded-xl opacity-0 hover:opacity-100 transition-opacity duration-300"
          style={{
            background: 'radial-gradient(circle at center, rgba(255,255,255,0.1) 0%, transparent 70%)'
          }}
          aria-hidden="true"
        />
      </button>
    );
  }
);

ModernButton.displayName = 'ModernButton';

export default ModernButton;