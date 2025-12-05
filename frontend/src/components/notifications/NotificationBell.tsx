import React, { useState, useRef } from 'react';
import { Bell } from 'lucide-react';
import { useNotifications } from '../../hooks/useNotifications';
import { useClickOutside } from '../../hooks/useClickOutside';
import { NotificationDropdown } from './NotificationDropdown';
import { Button } from '../ui/Button';

export const NotificationBell: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { unreadCount, notifications, markAsRead, markAllAsRead } = useNotifications();

  useClickOutside(dropdownRef, () => setIsOpen(false));

  return (
    <div className="relative z-50" ref={dropdownRef}>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        className="relative"
      >
        <Bell size={20} className="text-gray-700 dark:text-gray-200" />
        <span className={`absolute -top-0.5 -right-0.5 text-white text-[10px] font-semibold rounded-full h-4 w-4 flex items-center justify-center ${
          unreadCount > 0 ? 'bg-error' : 'bg-gray-400 dark:bg-gray-500'
        }`}>
          {unreadCount > 9 ? '9+' : unreadCount}
        </span>
      </Button>
      {isOpen && (
        <NotificationDropdown 
          onClose={() => setIsOpen(false)}
          notifications={notifications}
          markAsRead={markAsRead}
          markAllAsRead={markAllAsRead}
        />
      )}
    </div>
  );
};

