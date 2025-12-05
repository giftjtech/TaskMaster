import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Notification } from '../../services/notification.service';
import { formatDateTime } from '../../utils/helpers';

interface NotificationDropdownProps {
  onClose?: () => void;
  notifications: Notification[];
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
}

export const NotificationDropdown: React.FC<NotificationDropdownProps> = ({
  onClose,
  notifications,
  markAsRead,
  markAllAsRead,
}) => {
  const navigate = useNavigate();

  const handleNotificationClick = async (e: React.MouseEvent, notification: Notification) => {
    e.stopPropagation();
    e.preventDefault();
    
    // Mark as read if unread - this will update the count immediately
    if (!notification.read) {
      // Call markAsRead which does optimistic update
      markAsRead(notification.id).catch((error) => {
        console.error('Failed to mark notification as read:', error);
      });
    }

    // Navigate to task if taskId exists in metadata
    const taskId = notification.metadata?.taskId;
    if (taskId) {
      // Close the dropdown after a small delay to allow state update
      setTimeout(() => {
        if (onClose) {
          onClose();
        }
        navigate(`/tasks?taskId=${taskId}`);
      }, 100);
    } else {
      // If no navigation, just close the dropdown
      if (onClose) {
        setTimeout(() => onClose(), 100);
      }
    }
  };

  return (
    <div 
      className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-800 rounded-lg shadow-lg z-[9999] max-h-96 overflow-y-auto border border-gray-200 dark:border-gray-700"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
        <h3 className="font-semibold text-gray-900 dark:text-white">Notifications</h3>
        {notifications.some((n) => !n.read) && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              markAllAsRead();
            }}
            className="text-sm text-primary-600 hover:underline"
          >
            Mark all as read
          </button>
        )}
      </div>
      <div className="divide-y divide-gray-200 dark:divide-gray-700">
        {notifications.length > 0 ? (
          notifications.map((notification) => (
            <div
              key={notification.id}
              className={`p-4 cursor-pointer transition-all duration-200 ${
                !notification.read 
                  ? 'bg-blue-50 dark:bg-blue-900/30 border-l-4 border-blue-500 hover:bg-blue-100 dark:hover:bg-blue-900/40' 
                  : 'bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 border-l-4 border-transparent opacity-75'
              }`}
              onClick={(e) => handleNotificationClick(e, notification)}
            >
              <div className="flex justify-between items-start gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-start gap-2">
                    {!notification.read && (
                      <div className="mt-1.5 h-2 w-2 bg-blue-600 dark:bg-blue-400 rounded-full flex-shrink-0"></div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className={`font-medium ${
                        !notification.read 
                          ? 'text-gray-900 dark:text-white font-semibold' 
                          : 'text-gray-600 dark:text-gray-400'
                      }`}>
                        {notification.title}
                      </p>
                      <p className={`text-sm mt-1 ${
                        !notification.read 
                          ? 'text-gray-700 dark:text-gray-300' 
                          : 'text-gray-500 dark:text-gray-500'
                      }`}>
                        {notification.message}
                      </p>
                      <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">
                        {formatDateTime(notification.createdAt)}
                      </p>
                    </div>
                  </div>
                </div>
                {!notification.read && (
                  <div className="flex-shrink-0 mt-1">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                      New
                    </span>
                  </div>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="p-8 text-center text-gray-500">
            No notifications
          </div>
        )}
      </div>
    </div>
  );
};

