import React, { useEffect, useState } from 'react';

export type MessageType = 'success' | 'error' | 'warning' | 'info';

interface MessageBoxProps {
  message: string;
  type: MessageType;
  duration?: number;
  onClose?: () => void;
}

export const MessageBox: React.FC<MessageBoxProps> = ({ 
  message, 
  type, 
  duration = 6000, 
  onClose 
}) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        setIsVisible(false);
        onClose?.();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [duration, onClose]);

  const getIconClass = () => {
    switch (type) {
      case 'success': return 'fa-check-circle';
      case 'error': return 'fa-times-circle';
      case 'warning': return 'fa-exclamation-triangle';
      default: return 'fa-info-circle';
    }
  };

  const getColorClass = () => {
    switch (type) {
      case 'success': return 'bg-green-100 border-green-400 text-green-800';
      case 'error': return 'bg-red-100 border-red-400 text-red-800';
      case 'warning': return 'bg-yellow-100 border-yellow-400 text-yellow-800';
      default: return 'bg-blue-100 border-blue-400 text-blue-800';
    }
  };

  const handleClose = () => {
    setIsVisible(false);
    onClose?.();
  };

  if (!isVisible) return null;

  return (
    <div className={`fixed top-6 left-1/2 transform -translate-x-1/2 z-[300] min-w-[280px] max-w-[90vw] px-4 py-3 rounded-lg shadow-lg border ${getColorClass()} message-box transition-all duration-300 ${isVisible ? 'show' : ''}`}>
      <div className="flex items-center">
        <i className={`fa-solid ${getIconClass()} text-xl mr-3`}></i>
        <span className="flex-1">{message}</span>
        <button 
          onClick={handleClose}
          className="ml-4 text-lg text-gray-500 hover:text-gray-800 focus:outline-none" 
          aria-label="Đóng"
        >
          &times;
        </button>
      </div>
    </div>
  );
};
