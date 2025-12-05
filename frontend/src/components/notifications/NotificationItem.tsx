import React from 'react';
import { Notification } from '../../services/notification.service';
import { formatDateTime } from '../../utils/helpers';

interface NotificationItemProps {
  notification: Notification;
  onMarkAsRead: (id: string) => void;
}

export const NotificationItem: React.FC<NotificationItemProps> = ({
  notification,
  onMarkAsRead,
}) => {
  return (
    <div
      className={`p-4 border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer ${
        !notification.read ? 'bg-primary-50 dark:bg-primary-900/20' : ''
      }`}
      onClick={() => !notification.read && onMarkAsRead(notification.id)}
    >
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <p className="font-medium text-gray-900 dark:text-white">{notification.title}</p>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            {notification.message}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
            {formatDateTime(notification.createdAt)}
          </p>
        </div>
        {!notification.read && (
          <div className="ml-2 h-2 w-2 bg-primary-600 rounded-full"></div>
        )}
      </div>
    </div>
  );
};

