import React, { useEffect, useState } from 'react';
import { 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  Info, 
  X 
} from 'lucide-react';
import { cn } from '@/utils/cn';

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
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        handleClose();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [duration]);

  const handleClose = () => {
    setIsExiting(true);
    setTimeout(() => {
      setIsVisible(false);
      onClose?.();
    }, 300);
  };

  const getIcon = () => {
    switch (type) {
      case 'success': return <CheckCircle className="w-5 h-5" />;
      case 'error': return <XCircle className="w-5 h-5" />;
      case 'warning': return <AlertTriangle className="w-5 h-5" />;
      default: return <Info className="w-5 h-5" />;
    }
  };

  const getStyles = () => {
    switch (type) {
      case 'success': 
        return {
          container: 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-200 text-green-800',
          icon: 'text-green-600',
          closeButton: 'text-green-500 hover:text-green-700 hover:bg-green-100'
        };
      case 'error': 
        return {
          container: 'bg-gradient-to-r from-red-50 to-rose-50 border-red-200 text-red-800',
          icon: 'text-red-600',
          closeButton: 'text-red-500 hover:text-red-700 hover:bg-red-100'
        };
      case 'warning': 
        return {
          container: 'bg-gradient-to-r from-yellow-50 to-amber-50 border-yellow-200 text-yellow-800',
          icon: 'text-yellow-600',
          closeButton: 'text-yellow-500 hover:text-yellow-700 hover:bg-yellow-100'
        };
      default: 
        return {
          container: 'bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200 text-blue-800',
          icon: 'text-blue-600',
          closeButton: 'text-blue-500 hover:text-blue-700 hover:bg-blue-100'
        };
    }
  };

  const styles = getStyles();

  if (!isVisible) return null;

  return (
    <div 
      className={cn(
        "fixed top-6 left-1/2 transform -translate-x-1/2 z-[300] min-w-[280px] max-w-[90vw]",
        "px-4 py-3 rounded-xl shadow-lg border backdrop-blur-sm",
        "transition-all duration-300 ease-out",
        styles.container,
        isExiting 
          ? "opacity-0 scale-95 -translate-y-2" 
          : "opacity-100 scale-100 translate-y-0"
      )}
    >
      <div className="flex items-start gap-3">
        <div className={cn("flex-shrink-0 mt-0.5", styles.icon)}>
          {getIcon()}
        </div>
        
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium leading-relaxed break-words">
            {message}
          </p>
        </div>
        
        <button 
          onClick={handleClose}
          className={cn(
            "flex-shrink-0 p-1 rounded-lg transition-colors duration-200",
            "focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-current",
            styles.closeButton
          )}
          aria-label="Đóng thông báo"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
