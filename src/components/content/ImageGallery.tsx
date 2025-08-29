import React, { useState, useRef, useEffect, useCallback } from 'react';
import { cn } from '@/utils/cn';
import { ChevronLeft, ChevronRight, X, ZoomIn, ZoomOut, Download, Share2, Heart } from 'lucide-react';

export interface GalleryImage {
  id: string;
  src: string;
  alt: string;
  title?: string;
  description?: string;
  photographer?: string;
  tags?: string[];
  thumbnail?: string;
}

export interface ImageGalleryProps {
  images: GalleryImage[];
  initialIndex?: number;
  showThumbnails?: boolean;
  showControls?: boolean;
  enableZoom?: boolean;
  enableSwipe?: boolean;
  enableKeyboard?: boolean;
  autoPlay?: boolean;
  autoPlayInterval?: number;
  className?: string;
  onImageChange?: (index: number, image: GalleryImage) => void;
  onClose?: () => void;
}

interface TouchState {
  startX: number;
  startY: number;
  currentX: number;
  currentY: number;
  isDragging: boolean;
  isPinching: boolean;
  initialDistance: number;
  scale: number;
  translateX: number;
  translateY: number;
}

const ImageGallery: React.FC<ImageGalleryProps> = ({
  images,
  initialIndex = 0,
  showThumbnails = true,
  showControls = true,
  enableZoom = true,
  enableSwipe = true,
  enableKeyboard = true,
  autoPlay = false,
  autoPlayInterval = 5000,
  className,
  onImageChange,
  onClose
}) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [isLoading, setIsLoading] = useState(true);
  const [touchState, setTouchState] = useState<TouchState>({
    startX: 0,
    startY: 0,
    currentX: 0,
    currentY: 0,
    isDragging: false,
    isPinching: false,
    initialDistance: 0,
    scale: 1,
    translateX: 0,
    translateY: 0
  });
  const [showUI, setShowUI] = useState(true);
  
  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const autoPlayRef = useRef<NodeJS.Timeout>();
  const hideUITimeoutRef = useRef<NodeJS.Timeout>();

  const currentImage = images[currentIndex];

  // Auto-hide UI
  const resetHideUITimer = useCallback(() => {
    if (hideUITimeoutRef.current) {
      clearTimeout(hideUITimeoutRef.current);
    }
    setShowUI(true);
    hideUITimeoutRef.current = setTimeout(() => {
      setShowUI(false);
    }, 3000);
  }, []);

  // Navigation functions
  const goToNext = useCallback(() => {
    const nextIndex = (currentIndex + 1) % images.length;
    setCurrentIndex(nextIndex);
    onImageChange?.(nextIndex, images[nextIndex]);
    resetHideUITimer();
  }, [currentIndex, images, onImageChange, resetHideUITimer]);

  const goToPrevious = useCallback(() => {
    const prevIndex = currentIndex === 0 ? images.length - 1 : currentIndex - 1;
    setCurrentIndex(prevIndex);
    onImageChange?.(prevIndex, images[prevIndex]);
    resetHideUITimer();
  }, [currentIndex, images, onImageChange, resetHideUITimer]);

  const goToIndex = useCallback((index: number) => {
    if (index >= 0 && index < images.length) {
      setCurrentIndex(index);
      onImageChange?.(index, images[index]);
      resetHideUITimer();
    }
  }, [images, onImageChange, resetHideUITimer]);

  // Zoom functions
  const zoomIn = useCallback(() => {
    setTouchState(prev => ({
      ...prev,
      scale: Math.min(prev.scale * 1.5, 4)
    }));
  }, []);

  const zoomOut = useCallback(() => {
    setTouchState(prev => ({
      ...prev,
      scale: Math.max(prev.scale / 1.5, 1),
      translateX: prev.scale <= 1 ? 0 : prev.translateX,
      translateY: prev.scale <= 1 ? 0 : prev.translateY
    }));
  }, []);

  const resetZoom = useCallback(() => {
    setTouchState(prev => ({
      ...prev,
      scale: 1,
      translateX: 0,
      translateY: 0
    }));
  }, []);

  // Touch event handlers
  const getDistance = (touch1: Touch, touch2: Touch) => {
    return Math.sqrt(
      Math.pow(touch2.clientX - touch1.clientX, 2) +
      Math.pow(touch2.clientY - touch1.clientY, 2)
    );
  };

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (!enableSwipe && !enableZoom) return;

    const touches = e.touches;
    
    if (touches.length === 1) {
      // Single touch - start swipe
      setTouchState(prev => ({
        ...prev,
        startX: (touches[0] as any).clientX,
        startY: (touches[0] as any).clientY,
        currentX: (touches[0] as any).clientX,
        currentY: (touches[0] as any).clientY,
        isDragging: true,
        isPinching: false
      }));
    } else if (touches.length === 2 && enableZoom) {
      // Two touches - start pinch
      const distance = getDistance(touches[0] as any, (touches[1] as any));
      setTouchState(prev => ({
        ...prev,
        isPinching: true,
        isDragging: false,
        initialDistance: distance
      }));
    }

    resetHideUITimer();
  }, [enableSwipe, enableZoom, resetHideUITimer]);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    e.preventDefault();
    const touches = e.touches;

    if (touches.length === 1 && touchState.isDragging) {
      // Single touch - handle swipe or pan
      const deltaX = (touches[0] as any).clientX - touchState.startX;
      const deltaY = (touches[0] as any).clientY - touchState.startY;

      if (touchState.scale > 1) {
        // Pan when zoomed
        setTouchState(prev => ({
          ...prev,
          translateX: prev.translateX + ((touches[0] as any).clientX - prev.currentX),
          translateY: prev.translateY + ((touches[0] as any).clientY - prev.currentY),
          currentX: (touches[0] as any).clientX,
          currentY: (touches[0] as any).clientY
        }));
      } else {
        // Swipe when not zoomed
        setTouchState(prev => ({
          ...prev,
          currentX: (touches[0] as any).clientX,
          currentY: (touches[0] as any).clientY
        }));
      }
    } else if (touches.length === 2 && touchState.isPinching && enableZoom) {
      // Two touches - handle pinch zoom
      const distance = getDistance(touches[0] as any, (touches[1] as any));
      const scale = Math.max(1, Math.min(4, touchState.scale * (distance / touchState.initialDistance)));
      
      setTouchState(prev => ({
        ...prev,
        scale
      }));
    }
  }, [touchState, enableZoom]);

  const handleTouchEnd = useCallback(() => {
    if (touchState.isDragging && touchState.scale <= 1) {
      const deltaX = touchState.currentX - touchState.startX;
      const threshold = 50;

      if (Math.abs(deltaX) > threshold) {
        if (deltaX > 0) {
          goToPrevious();
        } else {
          goToNext();
        }
      }
    }

    setTouchState(prev => ({
      ...prev,
      isDragging: false,
      isPinching: false,
      startX: 0,
      startY: 0,
      currentX: 0,
      currentY: 0
    }));
  }, [touchState, goToNext, goToPrevious]);

  // Keyboard navigation
  useEffect(() => {
    if (!enableKeyboard) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowLeft':
          e.preventDefault();
          goToPrevious();
          break;
        case 'ArrowRight':
          e.preventDefault();
          goToNext();
          break;
        case 'Escape':
          e.preventDefault();
          onClose?.();
          break;
        case '+':
        case '=':
          e.preventDefault();
          zoomIn();
          break;
        case '-':
          e.preventDefault();
          zoomOut();
          break;
        case '0':
          e.preventDefault();
          resetZoom();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [enableKeyboard, goToNext, goToPrevious, onClose, zoomIn, zoomOut, resetZoom]);

  // Auto-play
  useEffect(() => {
    if (!autoPlay) return;

    autoPlayRef.current = setInterval(goToNext, autoPlayInterval);
    return () => {
      if (autoPlayRef.current) {
        clearInterval(autoPlayRef.current);
      }
    };
  }, [autoPlay, autoPlayInterval, goToNext]);

  // Reset zoom when image changes
  useEffect(() => {
    resetZoom();
    setIsLoading(true);
  }, [currentIndex, resetZoom]);

  // Initialize hide UI timer
  useEffect(() => {
    resetHideUITimer();
    return () => {
      if (hideUITimeoutRef.current) {
        clearTimeout(hideUITimeoutRef.current);
      }
    };
  }, [resetHideUITimer]);

  const handleImageLoad = () => {
    setIsLoading(false);
  };

  const handleMouseMove = () => {
    resetHideUITimer();
  };

  return (
    <div
      ref={containerRef}
      className={cn(
        'relative w-full h-full bg-black overflow-hidden',
        'select-none touch-none',
        className
      )}
      onMouseMove={handleMouseMove}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Main Image */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div
          className="relative transition-transform duration-200 ease-out"
          style={{
            transform: `scale(${touchState.scale}) translate(${touchState.translateX}px, ${touchState.translateY}px)`
          }}
        >
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            </div>
          )}
          
          <img
            ref={imageRef}
            src={currentImage.src}
            alt={currentImage.alt}
            className={cn(
              'max-w-full max-h-full object-contain transition-opacity duration-300',
              isLoading ? 'opacity-0' : 'opacity-100'
            )}
            onLoad={handleImageLoad}
            draggable={false}
          />
        </div>
      </div>

      {/* Navigation Controls */}
      {showControls && showUI && images.length > 1 && (
        <>
          <button
            onClick={goToPrevious}
            className={cn(
              'absolute left-4 top-1/2 -translate-y-1/2 z-10',
              'p-3 rounded-full bg-black/50 text-white',
              'hover:bg-black/70 transition-all duration-200',
              'backdrop-blur-sm border border-white/20'
            )}
            aria-label="Previous image"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>

          <button
            onClick={goToNext}
            className={cn(
              'absolute right-4 top-1/2 -translate-y-1/2 z-10',
              'p-3 rounded-full bg-black/50 text-white',
              'hover:bg-black/70 transition-all duration-200',
              'backdrop-blur-sm border border-white/20'
            )}
            aria-label="Next image"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </>
      )}

      {/* Top Controls */}
      {showUI && (
        <div className="absolute top-0 left-0 right-0 z-10 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {/* Image Counter */}
              <div className="px-3 py-1 rounded-full bg-black/50 text-white text-sm backdrop-blur-sm border border-white/20">
                {currentIndex + 1} / {images.length}
              </div>
              
              {/* Image Title */}
              {currentImage.title && (
                <h3 className="text-white font-medium text-lg">
                  {currentImage.title}
                </h3>
              )}
            </div>

            <div className="flex items-center gap-2">
              {/* Zoom Controls */}
              {enableZoom && (
                <>
                  <button
                    onClick={zoomOut}
                    disabled={touchState.scale <= 1}
                    className={cn(
                      'p-2 rounded-full bg-black/50 text-white',
                      'hover:bg-black/70 transition-all duration-200',
                      'backdrop-blur-sm border border-white/20',
                      'disabled:opacity-50 disabled:cursor-not-allowed'
                    )}
                    aria-label="Zoom out"
                  >
                    <ZoomOut className="w-5 h-5" />
                  </button>

                  <button
                    onClick={zoomIn}
                    disabled={touchState.scale >= 4}
                    className={cn(
                      'p-2 rounded-full bg-black/50 text-white',
                      'hover:bg-black/70 transition-all duration-200',
                      'backdrop-blur-sm border border-white/20',
                      'disabled:opacity-50 disabled:cursor-not-allowed'
                    )}
                    aria-label="Zoom in"
                  >
                    <ZoomIn className="w-5 h-5" />
                  </button>
                </>
              )}

              {/* Action Buttons */}
              <button
                onClick={() => console.log('Download image')}
                className={cn(
                  'p-2 rounded-full bg-black/50 text-white',
                  'hover:bg-black/70 transition-all duration-200',
                  'backdrop-blur-sm border border-white/20'
                )}
                aria-label="Download image"
              >
                <Download className="w-5 h-5" />
              </button>

              <button
                onClick={() => console.log('Share image')}
                className={cn(
                  'p-2 rounded-full bg-black/50 text-white',
                  'hover:bg-black/70 transition-all duration-200',
                  'backdrop-blur-sm border border-white/20'
                )}
                aria-label="Share image"
              >
                <Share2 className="w-5 h-5" />
              </button>

              <button
                onClick={() => console.log('Like image')}
                className={cn(
                  'p-2 rounded-full bg-black/50 text-white',
                  'hover:bg-black/70 transition-all duration-200',
                  'backdrop-blur-sm border border-white/20'
                )}
                aria-label="Like image"
              >
                <Heart className="w-5 h-5" />
              </button>

              {/* Close Button */}
              {onClose && (
                <button
                  onClick={onClose}
                  className={cn(
                    'p-2 rounded-full bg-black/50 text-white',
                    'hover:bg-black/70 transition-all duration-200',
                    'backdrop-blur-sm border border-white/20'
                  )}
                  aria-label="Close gallery"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Bottom Info */}
      {showUI && currentImage.description && (
        <div className="absolute bottom-0 left-0 right-0 z-10 p-4">
          <div className="bg-black/50 backdrop-blur-sm border border-white/20 rounded-2xl p-4">
            <p className="text-white text-sm leading-relaxed">
              {currentImage.description}
            </p>
            {currentImage.photographer && (
              <p className="text-white/70 text-xs mt-2">
                Photo by {currentImage.photographer}
              </p>
            )}
            {currentImage.tags && currentImage.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-3">
                {currentImage.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="px-2 py-1 text-xs bg-white/20 text-white rounded-full"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Thumbnails */}
      {showThumbnails && showUI && images.length > 1 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10">
          <div className="flex gap-2 p-2 bg-black/50 backdrop-blur-sm border border-white/20 rounded-2xl">
            {images.map((image, index) => (
              <button
                key={image.id}
                onClick={() => goToIndex(index)}
                className={cn(
                  'w-12 h-12 rounded-lg overflow-hidden transition-all duration-200',
                  'border-2',
                  index === currentIndex
                    ? 'border-white scale-110'
                    : 'border-white/30 hover:border-white/60 hover:scale-105'
                )}
              >
                <img
                  src={image.thumbnail || image.src}
                  alt={image.alt}
                  className="w-full h-full object-cover"
                />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Swipe Indicator */}
      {enableSwipe && touchState.isDragging && touchState.scale <= 1 && (
        <div className="absolute inset-0 pointer-events-none">
          <div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 transition-transform duration-100"
            style={{
              transform: `translate(-50%, -50%) translateX(${(touchState.currentX - touchState.startX) * 0.1}px)`
            }}
          >
            <div className="w-2 h-16 bg-white/50 rounded-full" />
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageGallery;