import React, { useState, useRef, useEffect } from 'react';
import { useLazyImage } from '../../hooks/useLazyLoading';
import { cn } from '../../utils/cn';

interface LazyImageProps {
  src: string;
  alt: string;
  className?: string;
  placeholderSrc?: string;
  blurDataURL?: string;
  width?: number;
  height?: number;
  aspectRatio?: 'square' | 'video' | 'auto' | number;
  objectFit?: 'cover' | 'contain' | 'fill' | 'scale-down';
  onLoad?: () => void;
  onError?: () => void;
  threshold?: number;
  rootMargin?: string;
  progressive?: boolean;
}

export function LazyImage({
  src,
  alt,
  className,
  placeholderSrc,
  blurDataURL,
  width,
  height,
  aspectRatio = 'auto',
  objectFit = 'cover',
  onLoad,
  onError,
  threshold = 0.1,
  rootMargin = '50px',
  progressive = true
}: LazyImageProps) {
  const { elementRef, imageSrc, isLoaded, isError } = useLazyImage(src, {
    threshold,
    rootMargin
  });

  const [showPlaceholder, setShowPlaceholder] = useState(true);

  useEffect(() => {
    if (isLoaded) {
      setShowPlaceholder(false);
      onLoad?.();
    }
    if (isError) {
      onError?.();
    }
  }, [isLoaded, isError, onLoad, onError]);

  // Calculate aspect ratio styles
  const aspectRatioStyle = (() => {
    if (aspectRatio === 'auto') return {};
    if (aspectRatio === 'square') return { aspectRatio: '1 / 1' };
    if (aspectRatio === 'video') return { aspectRatio: '16 / 9' };
    if (typeof aspectRatio === 'number') return { aspectRatio: aspectRatio.toString() };
    return {};
  })();

  return (
    <div
      ref={elementRef as any}
      className={cn(
        'relative overflow-hidden bg-gray-100',
        className
      )}
      style={{
        width,
        height,
        ...aspectRatioStyle
      }}
    >
      {/* Blur placeholder */}
      {showPlaceholder && blurDataURL && (
        <img
          src={blurDataURL}
          alt=""
          className={cn(
            'absolute inset-0 w-full h-full transition-opacity duration-300',
            `object-${objectFit}`,
            isLoaded ? 'opacity-0' : 'opacity-100'
          )}
          style={{ filter: 'blur(10px)', transform: 'scale(1.1)' }}
        />
      )}

      {/* Low quality placeholder */}
      {showPlaceholder && placeholderSrc && !blurDataURL && (
        <img
          src={placeholderSrc}
          alt=""
          className={cn(
            'absolute inset-0 w-full h-full transition-opacity duration-300',
            `object-${objectFit}`,
            isLoaded ? 'opacity-0' : 'opacity-100'
          )}
        />
      )}

      {/* Skeleton placeholder */}
      {showPlaceholder && !placeholderSrc && !blurDataURL && (
        <div className="absolute inset-0 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 animate-pulse" />
      )}

      {/* Main image */}
      {imageSrc && (
        <img
          src={imageSrc}
          alt={alt}
          className={cn(
            'absolute inset-0 w-full h-full transition-opacity duration-300',
            `object-${objectFit}`,
            isLoaded ? 'opacity-100' : 'opacity-0'
          )}
          loading="lazy"
          decoding="async"
        />
      )}

      {/* Error state */}
      {isError && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 text-gray-400">
          <svg
            className="w-8 h-8"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
        </div>
      )}

      {/* Progressive enhancement indicator */}
      {progressive && !isLoaded && !isError && (
        <div className="absolute bottom-2 right-2">
          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
        </div>
      )}
    </div>
  );
}

// Higher-order component for lazy loading any component
interface LazyComponentWrapperProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  threshold?: number;
  rootMargin?: string;
  className?: string;
}

export function LazyComponentWrapper({
  children,
  fallback,
  threshold = 0.1,
  rootMargin = '50px',
  className
}: LazyComponentWrapperProps) {
  const { elementRef, shouldLoad } = useLazyImage('', {
    threshold,
    rootMargin
  });

  return (
    <div ref={elementRef as any} className={className}>
      {shouldLoad ? children : (fallback || <div className="h-32 bg-gray-100 animate-pulse rounded" />)}
    </div>
  );
}