import React, { useState } from 'react'
import { cn } from '@/utils/cn'
import { ImageOff } from 'lucide-react'

interface ResponsiveImageProps {
  src: string
  alt: string
  srcSet?: string
  sizes?: string
  className?: string
  fallbackSrc?: string
  loading?: 'lazy' | 'eager'
  aspectRatio?: 'square' | 'video' | 'auto' | number
  objectFit?: 'cover' | 'contain' | 'fill'
  placeholder?: React.ReactNode
  onLoad?: () => void
  onError?: () => void
}

const ResponsiveImage: React.FC<ResponsiveImageProps> = ({
  src,
  alt,
  srcSet,
  sizes,
  className,
  fallbackSrc,
  loading = 'lazy',
  aspectRatio = 'auto',
  objectFit = 'cover',
  placeholder,
  onLoad,
  onError
}) => {
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)
  const [currentSrc, setCurrentSrc] = useState(src)

  const handleLoad = () => {
    setIsLoading(false)
    onLoad?.()
  }

  const handleError = () => {
    if (fallbackSrc && currentSrc !== fallbackSrc) {
      setCurrentSrc(fallbackSrc)
      setHasError(false)
    } else {
      setHasError(true)
      setIsLoading(false)
    }
    onError?.()
  }

  const aspectRatioClasses = {
    square: 'aspect-square',
    video: 'aspect-video',
    auto: ''
  }

  const objectFitClasses = {
    cover: 'object-cover',
    contain: 'object-contain',
    fill: 'object-fill'
  }

  const aspectRatioStyle = typeof aspectRatio === 'number' 
    ? { aspectRatio: aspectRatio.toString() }
    : {}

  if (hasError) {
    return (
      <div className={cn(
        'flex items-center justify-center bg-gray-100 text-gray-400',
        aspectRatioClasses[aspectRatio as keyof typeof aspectRatioClasses],
        className
      )} style={aspectRatioStyle}>
        <div className="text-center">
          <ImageOff className="w-8 h-8 mx-auto mb-2" />
          <p className="text-xs">Không thể tải ảnh</p>
        </div>
      </div>
    )
  }

  return (
    <div className={cn('relative overflow-hidden', className)}>
      {/* Loading placeholder */}
      {isLoading && placeholder && (
        <div className="absolute inset-0 z-10">
          {placeholder}
        </div>
      )}

      {/* Loading skeleton */}
      {isLoading && !placeholder && (
        <div className="absolute inset-0 bg-gray-200 animate-pulse z-10" />
      )}

      {/* Image */}
      <img
        src={currentSrc}
        alt={alt}
        srcSet={srcSet}
        sizes={sizes}
        loading={loading}
        className={cn(
          'w-full h-full transition-opacity duration-300',
          objectFitClasses[objectFit],
          aspectRatioClasses[aspectRatio as keyof typeof aspectRatioClasses],
          isLoading ? 'opacity-0' : 'opacity-100'
        )}
        style={aspectRatioStyle}
        onLoad={handleLoad}
        onError={handleError}
      />
    </div>
  )
}

interface ImageGalleryProps {
  images: Array<{
    src: string
    alt: string
    srcSet?: string
  }>
  className?: string
  columns?: 1 | 2 | 3 | 4
  gap?: 'sm' | 'md' | 'lg'
}

const ImageGallery: React.FC<ImageGalleryProps> = ({
  images,
  className,
  columns = 2,
  gap = 'md'
}) => {
  const columnClasses = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 sm:grid-cols-2',
    3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4'
  }

  const gapClasses = {
    sm: 'gap-2',
    md: 'gap-3',
    lg: 'gap-4'
  }

  return (
    <div className={cn(
      'grid',
      columnClasses[columns],
      gapClasses[gap],
      className
    )}>
      {images.map((image, index) => (
        <ResponsiveImage
          key={index}
          src={image.src}
          alt={image.alt}
          srcSet={image.srcSet}
          aspectRatio="square"
          className="rounded-lg"
        />
      ))}
    </div>
  )
}

export { ResponsiveImage, ImageGallery }
