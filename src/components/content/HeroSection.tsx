import React, { useState, useEffect, useRef } from 'react';
import { cn } from '@/utils/cn';
import ModernButton from '@/components/modern/ModernButton';
import { ChevronDown, MapPin, Calendar, Users } from 'lucide-react';

export interface ActionButton {
  label: string;
  variant?: 'primary' | 'secondary' | 'ghost' | 'glass';
  icon?: React.ReactNode;
  onClick: () => void;
  loading?: boolean;
}

export interface HeroSectionProps {
  title: string;
  subtitle?: string;
  description?: string;
  backgroundImage?: string;
  backgroundVideo?: string;
  actions?: ActionButton[];
  parallax?: boolean;
  overlay?: boolean;
  height?: 'sm' | 'md' | 'lg' | 'xl' | 'screen';
  className?: string;
  children?: React.ReactNode;
}

const HeroSection: React.FC<HeroSectionProps> = ({
  title,
  subtitle,
  description,
  backgroundImage,
  backgroundVideo,
  actions = [],
  parallax = true,
  overlay = true,
  height = 'lg',
  className,
  children
}) => {
  const [scrollY, setScrollY] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);
  const heroRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  // Parallax scroll effect
  useEffect(() => {
    if (!parallax) return;

    const handleScroll = () => {
      const scrolled = window.scrollY;
      const rate = scrolled * -0.5;
      setScrollY(rate);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [parallax]);

  // Lazy loading for background image
  useEffect(() => {
    if (!backgroundImage) {
      setIsLoaded(true);
      return;
    }

    const img = new Image();
    img.onload = () => setIsLoaded(true);
    img.src = backgroundImage;
  }, [backgroundImage]);

  const heightClasses = {
    sm: 'h-64 md:h-80',
    md: 'h-80 md:h-96',
    lg: 'h-96 md:h-[32rem]',
    xl: 'h-[32rem] md:h-[40rem]',
    screen: 'h-screen'
  };

  const scrollToContent = () => {
    const nextSection = heroRef.current?.nextElementSibling;
    if (nextSection) {
      nextSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section
      ref={heroRef}
      className={cn(
        'relative overflow-hidden flex items-center justify-center',
        heightClasses[height],
        className
      )}
      role="banner"
      aria-label="Hero section"
    >
      {/* Background Media */}
      <div className="absolute inset-0 z-0">
        {backgroundVideo ? (
          <video
            className="w-full h-full object-cover"
            autoPlay
            muted
            loop
            playsInline
            style={{
              transform: parallax ? `translateY(${scrollY}px)` : undefined
            }}
          >
            <source src={backgroundVideo} type="video/mp4" />
          </video>
        ) : backgroundImage ? (
          <div
            className={cn(
              'w-full h-full bg-cover bg-center bg-no-repeat transition-opacity duration-1000',
              isLoaded ? 'opacity-100' : 'opacity-0'
            )}
            style={{
              backgroundImage: `url(${backgroundImage})`,
              transform: parallax ? `translateY(${scrollY}px)` : undefined
            }}
            role="img"
            aria-label="Hero background"
          />
        ) : (
          <div
            className="w-full h-full bg-gradient-to-br from-primary-500 via-accent-500 to-primary-600"
            style={{
              transform: parallax ? `translateY(${scrollY}px)` : undefined
            }}
          />
        )}

        {/* Loading placeholder */}
        {!isLoaded && backgroundImage && (
          <div className="absolute inset-0 bg-gradient-to-br from-neutral-200 to-neutral-300 animate-pulse" />
        )}
      </div>

      {/* Overlay */}
      {overlay && (
        <div className="absolute inset-0 z-10 bg-gradient-to-b from-black/30 via-black/20 to-black/40" />
      )}

      {/* Content */}
      <div className="relative z-20 container mx-auto px-4 text-center text-white">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Subtitle */}
          {subtitle && (
            <div className="animate-fade-in">
                              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/90 border border-gray-200 text-sm font-medium">
                <MapPin className="w-4 h-4" />
                {subtitle}
              </span>
            </div>
          )}

          {/* Main Title */}
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight animate-slide-up">
            <span className="bg-gradient-to-r from-white via-white to-white/80 bg-clip-text text-transparent">
              {title}
            </span>
          </h1>

          {/* Description */}
          {description && (
            <p className="text-lg md:text-xl text-white/90 max-w-2xl mx-auto leading-relaxed animate-slide-up">
              {description}
            </p>
          )}

          {/* Action Buttons */}
          {actions.length > 0 && (
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4 animate-slide-up">
              {actions.map((action, index) => (
                <ModernButton
                  key={index}
                  variant={action.variant || 'primary'}
                  size="lg"
                  icon={action.icon}
                  onClick={action.onClick}
                  loading={action.loading}
                  className="min-w-[160px]"
                >
                  {action.label}
                </ModernButton>
              ))}
            </div>
          )}

          {/* Custom Children */}
          {children && (
            <div className="pt-6 animate-slide-up">
              {children}
            </div>
          )}
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce-gentle">
          <button
            onClick={scrollToContent}
                            className="p-2 rounded-full bg-white/90 border border-gray-200 hover:bg-white transition-all duration-200"
            aria-label="Scroll to content"
          >
            <ChevronDown className="w-6 h-6 text-white" />
          </button>
        </div>
      </div>

      {/* Floating Stats (Optional Enhancement) */}
      <div className="absolute bottom-0 left-0 right-0 z-20 p-6 hidden lg:block">
        <div className="container mx-auto">
          <div className="flex justify-center">
                          <div className="flex gap-8 px-8 py-4 rounded-2xl bg-white/90 border border-gray-200">
              <div className="flex items-center gap-2 text-white">
                <MapPin className="w-5 h-5 text-primary-300" />
                <div>
                  <div className="text-sm opacity-80">Địa điểm</div>
                  <div className="font-semibold">50+</div>
                </div>
              </div>
              <div className="flex items-center gap-2 text-white">
                <Calendar className="w-5 h-5 text-accent-300" />
                <div>
                  <div className="text-sm opacity-80">Sự kiện</div>
                  <div className="font-semibold">12+</div>
                </div>
              </div>
              <div className="flex items-center gap-2 text-white">
                <Users className="w-5 h-5 text-success-300" />
                <div>
                  <div className="text-sm opacity-80">Du khách</div>
                  <div className="font-semibold">10K+</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;