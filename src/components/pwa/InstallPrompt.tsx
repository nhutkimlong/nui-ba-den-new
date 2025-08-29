// Install Prompt Component with improved UX

import React, { useState, useEffect } from 'react';
import { Download, X, Smartphone, Monitor, Tablet } from 'lucide-react';
import { usePWA } from '../../hooks/usePWA';
import ModernButton from '../modern/ModernButton';
import GlassCard from '../modern/GlassCard';

interface InstallPromptProps {
  onClose?: () => void;
  variant?: 'banner' | 'modal' | 'floating';
  showBenefits?: boolean;
}

export function InstallPrompt({ 
  onClose, 
  variant = 'banner',
  showBenefits = true 
}: InstallPromptProps) {
  const [pwaState, pwaActions] = usePWA();
  const [isVisible, setIsVisible] = useState(false);
  const [isInstalling, setIsInstalling] = useState(false);
  const [deviceType, setDeviceType] = useState<'mobile' | 'tablet' | 'desktop'>('mobile');

  useEffect(() => {
    // Show prompt only if installable and not already installed
    setIsVisible(pwaState.isInstallable && !pwaState.isInstalled);
  }, [pwaState.isInstallable, pwaState.isInstalled]);

  useEffect(() => {
    // Detect device type for appropriate messaging
    const width = window.innerWidth;
    if (width < 768) {
      setDeviceType('mobile');
    } else if (width < 1024) {
      setDeviceType('tablet');
    } else {
      setDeviceType('desktop');
    }
  }, []);

  const handleInstall = async () => {
    setIsInstalling(true);
    try {
      const success = await pwaActions.install();
      if (success) {
        setIsVisible(false);
        onClose?.();
      }
    } catch (error) {
      console.error('Installation failed:', error);
    } finally {
      setIsInstalling(false);
    }
  };

  const handleClose = () => {
    setIsVisible(false);
    onClose?.();
    
    // Don't show again for this session
    sessionStorage.setItem('install-prompt-dismissed', 'true');
  };

  const getDeviceIcon = () => {
    switch (deviceType) {
      case 'mobile':
        return <Smartphone className="w-6 h-6" />;
      case 'tablet':
        return <Tablet className="w-6 h-6" />;
      default:
        return <Monitor className="w-6 h-6" />;
    }
  };

  const getInstallMessage = () => {
    switch (deviceType) {
      case 'mobile':
        return 'Cài đặt ứng dụng về điện thoại để trải nghiệm tốt nhất';
      case 'tablet':
        return 'Cài đặt ứng dụng về máy tính bảng để sử dụng thuận tiện hơn';
      default:
        return 'Cài đặt ứng dụng để truy cập nhanh từ desktop';
    }
  };

  const benefits = [
    {
      icon: '⚡',
      title: 'Tải nhanh hơn',
      description: 'Khởi động tức thì, không cần chờ đợi'
    },
    {
      icon: '📱',
      title: 'Trải nghiệm native',
      description: 'Giao diện như ứng dụng di động thật'
    },
    {
      icon: '🔄',
      title: 'Hoạt động offline',
      description: 'Xem thông tin ngay cả khi không có mạng'
    },
    {
      icon: '🔔',
      title: 'Thông báo',
      description: 'Nhận cập nhật về tour và sự kiện mới'
    }
  ];

  if (!isVisible) {
    return null;
  }

  // Banner variant
  if (variant === 'banner') {
    return (
      <div className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              {getDeviceIcon()}
              <div>
                <p className="font-medium text-sm">
                  {getInstallMessage()}
                </p>
                <p className="text-xs text-primary-100">
                  Truy cập nhanh, hoạt động offline
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <ModernButton
                variant="ghost"
                size="sm"
                onClick={handleInstall}
                loading={isInstalling}
                className="text-white border-white/20 hover:bg-white/10"
              >
                <Download className="w-4 h-4 mr-1" />
                Cài đặt
              </ModernButton>
              
              <button
                onClick={handleClose}
                className="p-1 rounded-full hover:bg-white/10 transition-colors"
                aria-label="Đóng"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Floating variant
  if (variant === 'floating') {
    return (
      <div className="fixed bottom-4 right-4 z-50 max-w-sm">
        <GlassCard className="p-4">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center space-x-2">
              {getDeviceIcon()}
              <h3 className="font-semibold text-sm">Cài đặt ứng dụng</h3>
            </div>
            <button
              onClick={handleClose}
              className="p-1 rounded-full hover:bg-black/5 transition-colors"
              aria-label="Đóng"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          
          <p className="text-sm text-neutral-600 mb-4">
            {getInstallMessage()}
          </p>
          
          <div className="flex space-x-2">
            <ModernButton
              variant="primary"
              size="sm"
              onClick={handleInstall}
              loading={isInstalling}
              className="flex-1"
            >
              <Download className="w-4 h-4 mr-1" />
              Cài đặt
            </ModernButton>
            <ModernButton
              variant="ghost"
              size="sm"
              onClick={handleClose}
            >
              Để sau
            </ModernButton>
          </div>
        </GlassCard>
      </div>
    );
  }

  // Modal variant
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <GlassCard className="w-full max-w-md">
        <div className="p-6">
          <div className="text-center mb-6">
            <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-primary-500 to-primary-600 rounded-2xl flex items-center justify-center">
              {getDeviceIcon()}
            </div>
            <h2 className="text-xl font-bold text-neutral-900 mb-2">
              Cài đặt ứng dụng Núi Bà Đen
            </h2>
            <p className="text-neutral-600">
              {getInstallMessage()}
            </p>
          </div>

          {showBenefits && (
            <div className="space-y-3 mb-6">
              {benefits.map((benefit, index) => (
                <div key={index} className="flex items-start space-x-3">
                  <span className="text-lg">{benefit.icon}</span>
                  <div>
                    <h4 className="font-medium text-sm text-neutral-900">
                      {benefit.title}
                    </h4>
                    <p className="text-xs text-neutral-600">
                      {benefit.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="flex space-x-3">
            <ModernButton
              variant="primary"
              onClick={handleInstall}
              loading={isInstalling}
              className="flex-1"
            >
              <Download className="w-4 h-4 mr-2" />
              Cài đặt ngay
            </ModernButton>
            <ModernButton
              variant="ghost"
              onClick={handleClose}
            >
              Bỏ qua
            </ModernButton>
          </div>
        </div>
      </GlassCard>
    </div>
  );
}

// Hook for managing install prompt visibility
export function useInstallPrompt() {
  const [pwaState] = usePWA();
  const [shouldShow, setShouldShow] = useState(false);
  const [hasBeenDismissed, setHasBeenDismissed] = useState(false);

  useEffect(() => {
    // Check if user has dismissed the prompt in this session
    const dismissed = sessionStorage.getItem('install-prompt-dismissed');
    setHasBeenDismissed(!!dismissed);
  }, []);

  useEffect(() => {
    // Show prompt after user has interacted with the app
    if (pwaState.isInstallable && !pwaState.isInstalled && !hasBeenDismissed) {
      const timer = setTimeout(() => {
        setShouldShow(true);
      }, 10000); // Show after 10 seconds

      return () => clearTimeout(timer);
    }
  }, [pwaState.isInstallable, pwaState.isInstalled, hasBeenDismissed]);

  const hidePrompt = () => {
    setShouldShow(false);
    setHasBeenDismissed(true);
  };

  return {
    shouldShow,
    hidePrompt
  };
}