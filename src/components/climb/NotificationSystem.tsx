import React, { useState, useEffect } from 'react';
import { Notification, NotificationType } from '../../types/climb';

const NOTIFICATION_TYPES: Record<string, NotificationType> = {
  weather: { 
    name: 'Cảnh báo thời tiết', 
    icon: 'fa-cloud-rain', 
    bgColor: 'bg-blue-100', 
    borderColor: 'border-blue-500', 
    textColor: 'text-blue-900',
    iconColor: 'text-blue-600'
  },
  maintenance: { 
    name: 'Bảo trì', 
    icon: 'fa-tools', 
    bgColor: 'bg-yellow-100', 
    borderColor: 'border-yellow-500', 
    textColor: 'text-yellow-900',
    iconColor: 'text-yellow-600'
  },
  announcement: { 
    name: 'Thông báo chung', 
    icon: 'fa-bullhorn', 
    bgColor: 'bg-green-100', 
    borderColor: 'border-green-500', 
    textColor: 'text-green-900',
    iconColor: 'text-green-600'
  },
  emergency: { 
    name: 'Khẩn cấp', 
    icon: 'fa-exclamation-triangle', 
    bgColor: 'bg-red-100', 
    borderColor: 'border-red-500', 
    textColor: 'text-red-900',
    iconColor: 'text-red-600'
  }
};

interface NotificationSystemProps {
  notifications: Notification[];
}

export const NotificationSystem: React.FC<NotificationSystemProps> = ({ notifications }) => {
  const [visibleNotifications, setVisibleNotifications] = useState<Notification[]>([]);
  const [seenNotifications, setSeenNotifications] = useState<string[]>([]);

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
    // Mark as seen
    const newSeenNotifications = [...seenNotifications, notificationId];
    setSeenNotifications(newSeenNotifications);
    localStorage.setItem('seenNotifications', JSON.stringify(newSeenNotifications));
    
    // Remove from visible
    setVisibleNotifications(prev => prev.filter(n => n.id !== notificationId));
  };

  const createNotificationHTML = (notification: Notification) => {
    const typeInfo = NOTIFICATION_TYPES[notification.type] || NOTIFICATION_TYPES.announcement;
    
    return (
      <div 
        key={notification.id}
        className={`notification-item notification-enter bg-white border-l-4 ${typeInfo.borderColor} rounded-lg shadow-lg p-4`}
        data-notification-id={notification.id}
      >
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-3 flex-1">
            <div className="flex-shrink-0 mt-1">
              <div className={`w-10 h-10 rounded-full ${typeInfo.bgColor} flex items-center justify-center`}>
                <i className={`fas ${typeInfo.icon} ${typeInfo.iconColor} text-lg`}></i>
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-2">
                <h4 className={`font-semibold ${typeInfo.textColor} text-base leading-tight`}>
                  {notification.title}
                </h4>
                <span className={`px-3 py-1 text-xs font-medium ${typeInfo.bgColor} ${typeInfo.textColor} rounded-full`}>
                  {typeInfo.name}
                </span>
              </div>
              <p className={`text-sm ${typeInfo.textColor} opacity-90 leading-relaxed`}>
                {notification.message}
              </p>
            </div>
          </div>
          <button 
            onClick={() => dismissNotification(notification.id)}
            className="flex-shrink-0 ml-3 text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-full hover:bg-gray-100"
          >
            <i className="fas fa-times text-sm"></i>
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
