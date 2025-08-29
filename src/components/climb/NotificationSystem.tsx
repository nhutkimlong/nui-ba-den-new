import React, { useState, useEffect } from 'react';
import { Notification, NotificationType } from '../../types/climb';
import { 
  CloudRain, 
  Wrench, 
  Megaphone, 
  AlertTriangle, 
  X,
  Bell
} from 'lucide-react';
import { cn } from '@/utils/cn';

const NOTIFICATION_TYPES: Record<string, NotificationType> = {
  weather: { 
    name: 'Cảnh báo thời tiết', 
    icon: "icon", 
    bgColor: 'bg-gradient-to-r from-blue-50 to-indigo-50', 
    borderColor: 'border-blue-200', 
    textColor: 'text-blue-900',
    iconColor: 'text-blue-600',

  },
  maintenance: { 
    name: 'Bảo trì', 
    icon: "icon", 
    bgColor: 'bg-gradient-to-r from-yellow-50 to-amber-50', 
    borderColor: 'border-yellow-200', 
    textColor: 'text-yellow-900',
    iconColor: 'text-yellow-600',

  },
  announcement: { 
    name: 'Thông báo chung', 
    icon: "icon", 
    bgColor: 'bg-gradient-to-r from-green-50 to-emerald-50', 
    borderColor: 'border-green-200', 
    textColor: 'text-green-900',
    iconColor: 'text-green-600',

  },
  emergency: { 
    name: 'Khẩn cấp', 
    icon: "icon", 
    bgColor: 'bg-gradient-to-r from-red-50 to-rose-50', 
    borderColor: 'border-red-200', 
    textColor: 'text-red-900',
    iconColor: 'text-red-600',

  }
};

interface NotificationSystemProps {
  notifications: Notification[];
}

export const NotificationSystem: React.FC<NotificationSystemProps> = ({ notifications }) => {
  const [visibleNotifications, setVisibleNotifications] = useState<Notification[]>([]);
  const [seenNotifications, setSeenNotifications] = useState<string[]>([]);
  const [exitingNotifications, setExitingNotifications] = useState<string[]>([]);

  useEffect(() => {
    // Load seen notifications from localStorage
    const stored = localStorage.getItem('seenNotifications');
    if (stored) {
      setSeenNotifications(JSON.parse(stored));
    }
  }, []);

  useEffect(() => {
    // Filter new notifications
    const newNotifications = notifications.filter(n => !seenNotifications.includes(n.id));
    const notificationsToShow = newNotifications.slice(0, 3); // Max 3 notifications
    
    setVisibleNotifications(notificationsToShow);
  }, [notifications, seenNotifications]);

  const dismissNotification = (notificationId: string) => {
    // Add to exiting list for animation
    setExitingNotifications(prev => [...prev, notificationId]);
    
    // Remove after animation
    setTimeout(() => {
      // Mark as seen
      const newSeenNotifications = [...seenNotifications, notificationId];
      setSeenNotifications(newSeenNotifications);
      localStorage.setItem('seenNotifications', JSON.stringify(newSeenNotifications));
      
      // Remove from visible and exiting
      setVisibleNotifications(prev => prev.filter(n => n.id !== notificationId));
      setExitingNotifications(prev => prev.filter(id => id !== notificationId));
    }, 300);
  };

  const createNotificationHTML = (notification: Notification) => {
    const typeInfo = NOTIFICATION_TYPES[notification.type] || NOTIFICATION_TYPES.announcement;
    const isExiting = exitingNotifications.includes(notification.id);
    
    return (
      <div 
        key={notification.id}
        className={cn(
          "notification-item bg-white border-l-4 rounded-xl shadow-lg p-4 backdrop-blur-sm",
          "transition-all duration-300 ease-out",
          typeInfo.borderColor,
          typeInfo.bgColor,
          isExiting 
            ? "opacity-0 scale-95 -translate-x-4" 
            : "opacity-100 scale-100 translate-x-0"
        )}
        data-notification-id={notification.id}
      >
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-4 flex-1">
            <div className="flex-shrink-0">
              <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center", "bg-blue-100")}>
                <div className="text-blue-600">
                  📢
                </div>
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-2">
                <h4 className={cn("font-semibold text-base leading-tight", typeInfo.textColor)}>
                  {notification.title}
                </h4>
                <span className={cn(
                  "px-3 py-1 text-xs font-medium rounded-full border",
                  typeInfo.bgColor,
                  typeInfo.borderColor,
                  typeInfo.textColor
                )}>
                  {typeInfo.name}
                </span>
              </div>
              <p className={cn("text-sm leading-relaxed opacity-90", typeInfo.textColor)}>
                {notification.message}
              </p>
            </div>
          </div>
          <button 
            onClick={() => dismissNotification(notification.id)}
            className={cn(
              "flex-shrink-0 ml-3 p-1 rounded-lg transition-colors duration-200",
              "hover:bg-white/50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-current",
              "text-gray-400 hover:text-gray-600"
            )}
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  };

  if (visibleNotifications.length === 0) {
    return null;
  }

  return (
    <div className="fixed top-20 left-4 right-4 z-[160] max-w-md mx-auto space-y-3">
      {visibleNotifications.map(createNotificationHTML)}
    </div>
  );
};
