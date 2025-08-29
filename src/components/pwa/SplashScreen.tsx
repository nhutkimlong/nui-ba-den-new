// Splash Screen Component for PWA

import React, { useState, useEffect } from 'react';

interface SplashScreenProps {
  onComplete?: () => void;
  minDuration?: number;
  maxDuration?: number;
}

export function SplashScreen({ 
  onComplete, 
  minDuration = 1500,
  maxDuration = 3000 
}: SplashScreenProps) {
  const [isVisible, setIsVisible] = useState(true);
  const [progress, setProgress] = useState(0);
  const [loadingText, setLoadingText] = useState('Đang khởi động...');

  useEffect(() => {
    const loadingSteps = [
      { text: 'Đang khởi động...', duration: 300 },
      { text: 'Đang tải dữ liệu...', duration: 500 },
      { text: 'Đang chuẩn bị giao diện...', duration: 400 },
      { text: 'Sẵn sàng!', duration: 300 }
    ];

    let currentStep = 0;
    let currentProgress = 0;
    const totalSteps = loadingSteps.length;

    const updateProgress = () => {
      if (currentStep < totalSteps) {
        const step = loadingSteps[currentStep];
        setLoadingText(step.text);
        
        const stepProgress = (currentStep + 1) / totalSteps * 100;
        const progressInterval = setInterval(() => {
          currentProgress += 2;
          setProgress(Math.min(currentProgress, stepProgress));
          
          if (currentProgress >= stepProgress) {
            clearInterval(progressInterval);
            currentStep++;
            
            setTimeout(() => {
              if (currentStep < totalSteps) {
                updateProgress();
              } else {
                // Complete loading
                setTimeout(() => {
                  setIsVisible(false);
                  onComplete?.();
                }, 200);
              }
            }, step.duration);
          }
        }, 50);
      }
    };

    // Start loading sequence
    const startTimer = setTimeout(updateProgress, 100);

    // Ensure minimum duration
    const minTimer = setTimeout(() => {
      if (progress < 100) {
        setProgress(100);
        setLoadingText('Sẵn sàng!');
        setTimeout(() => {
          setIsVisible(false);
          onComplete?.();
        }, 300);
      }
    }, minDuration);

    // Maximum duration fallback
    const maxTimer = setTimeout(() => {
      setIsVisible(false);
      onComplete?.();
    }, maxDuration);

    return () => {
      clearTimeout(startTimer);
      clearTimeout(minTimer);
      clearTimeout(maxTimer);
    };
  }, [onComplete, minDuration, maxDuration]);

  if (!isVisible) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[9999] bg-gradient-to-br from-primary-50 via-white to-primary-100 flex flex-col items-center justify-center">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%2310b981' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
        }}></div>
      </div>

      {/* Logo and Branding */}
      <div className="relative z-10 text-center">
        {/* App Icon */}
        <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-primary-500 to-primary-600 rounded-3xl shadow-2xl flex items-center justify-center transform animate-pulse">
          <div className="text-4xl text-white">🏔️</div>
        </div>

        {/* App Name */}
        <h1 className="text-2xl font-bold text-neutral-900 mb-2">
          Núi Bà Đen
        </h1>
        <p className="text-neutral-600 mb-8">
          Nóc nhà Nam Bộ
        </p>

        {/* Loading Progress */}
        <div className="w-64 mx-auto">
          {/* Progress Bar */}
          <div className="w-full h-1 bg-neutral-200 rounded-full overflow-hidden mb-4">
            <div 
              className="h-full bg-gradient-to-r from-primary-500 to-primary-600 rounded-full transition-all duration-300 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>

          {/* Loading Text */}
          <p className="text-sm text-neutral-500 animate-pulse">
            {loadingText}
          </p>
        </div>
      </div>

      {/* Bottom Branding */}
      <div className="absolute bottom-8 left-0 right-0 text-center">
        <p className="text-xs text-neutral-400">
          Ứng dụng du lịch số
        </p>
      </div>

      {/* Animated Elements */}
      <div className="absolute top-20 left-20 w-2 h-2 bg-primary-300 rounded-full animate-bounce" style={{ animationDelay: '0s' }} />
      <div className="absolute top-32 right-24 w-1 h-1 bg-primary-400 rounded-full animate-bounce" style={{ animationDelay: '0.5s' }} />
      <div className="absolute bottom-32 left-16 w-1.5 h-1.5 bg-primary-300 rounded-full animate-bounce" style={{ animationDelay: '1s' }} />
      <div className="absolute bottom-24 right-20 w-1 h-1 bg-primary-400 rounded-full animate-bounce" style={{ animationDelay: '1.5s' }} />
    </div>
  );
}

// Hook for managing splash screen
export function useSplashScreen() {
  const [isShowing, setIsShowing] = useState(false);

  useEffect(() => {
    // Show splash screen only for PWA or first visit
    const isPWA = window.matchMedia('(display-mode: standalone)').matches ||
                  window.matchMedia('(display-mode: fullscreen)').matches ||
                  (window.navigator as any).standalone === true;

    const isFirstVisit = !localStorage.getItem('app-visited');

    if (isPWA || isFirstVisit) {
      setIsShowing(true);
      if (isFirstVisit) {
        localStorage.setItem('app-visited', 'true');
      }
    }
  }, []);

  const hideSplashScreen = () => {
    setIsShowing(false);
  };

  return {
    isShowing,
    hideSplashScreen
  };
}