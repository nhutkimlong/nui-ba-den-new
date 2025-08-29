import React, { forwardRef } from 'react';
import { cn } from '@/utils/cn';

export interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  blur?: 'sm' | 'md' | 'lg' | 'xl';
  opacity?: 'light' | 'medium' | 'strong';
  hover?: boolean;
  padding?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  children: React.ReactNode;
}

const GlassCard = forwardRef<HTMLDivElement, GlassCardProps>(
  ({
    children,
    blur = 'md',
    opacity = 'light',
    hover = true,
    padding = 'md',
    className,
    ...props
  }, ref) => {
    const baseClasses = [
      // Base glass styling
      'relative overflow-hidden',
      'border border-white/20',
      'transition-all duration-300 ease-out',
      // Modern rounded corners
      'rounded-2xl',
      // Floating appearance
      'shadow-lg',
    ].join(' ');

    const blurClasses = {
      sm: 'backdrop-blur-sm',
      md: 'backdrop-blur-md',
      lg: 'backdrop-blur-lg',
      xl: 'backdrop-blur-xl'
    };

    const opacityClasses = {
      light: 'bg-white/10',
      medium: 'bg-white/15',
      strong: 'bg-white/25'
    };

    const paddingClasses = {
      none: '',
      sm: 'p-4',
      md: 'p-6',
      lg: 'p-8',
      xl: 'p-10'
    };

    const hoverClasses = hover ? [
      'hover:transform hover:-translate-y-1',
      'hover:shadow-xl hover:shadow-black/10',
      'hover:bg-white/20 hover:border-white/30',
      // Enhanced backdrop blur on hover
      'hover:backdrop-blur-lg'
    ].join(' ') : '';

    return (
      <div
        ref={ref}
        className={cn(
          baseClasses,
          blurClasses[blur],
          opacityClasses[opacity],
          paddingClasses[padding],
          hoverClasses,
          className
        )}
        {...props}
      >
        {/* Subtle gradient overlay for depth */}
        <div 
          className="absolute inset-0 rounded-2xl opacity-50"
          style={{
            background: 'linear-gradient(145deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)'
          }}
          aria-hidden="true"
        />
        
        {/* Content container */}
        <div className="relative z-10">
          {children}
        </div>
        
        {/* Subtle border highlight */}
        <div 
          className="absolute inset-0 rounded-2xl pointer-events-none"
          style={{
            background: 'linear-gradient(145deg, rgba(255,255,255,0.2) 0%, transparent 50%, rgba(255,255,255,0.1) 100%)',
            mask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
            maskComposite: 'xor',
            WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
            WebkitMaskComposite: 'xor',
            padding: '1px'
          }}
          aria-hidden="true"
        />
      </div>
    );
  }
);

GlassCard.displayName = 'GlassCard';

export default GlassCard;