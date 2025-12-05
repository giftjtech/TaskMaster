import { useState, useEffect, useRef } from 'react';
import { notificationService, Notification } from '../services/notification.service';
import { useWebSocket } from '../context/WebSocketContext';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export const useNotifications = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const notificationsRef = useRef<Notification[]>([]);
  const { socket } = useWebSocket();
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    // Only load notifications if authenticated AND token exists
    const token = localStorage.getItem('accessToken');
    if (isAuthenticated && token) {
      // Small delay to ensure token is fully set and ready
      const timer = setTimeout(() => {
        loadNotifications();
      }, 100);
      return () => clearTimeout(timer);
    }
    setLoading(false);
  }, [isAuthenticated]);

  useEffect(() => {
    if (socket) {
      const handleNotification = (notification: Notification) => {
        // Ensure notification is marked as unread when received via WebSocket
        const unreadNotification = { ...notification, read: false };
      setNotifications((prev) => {
        // Check if notification already exists (avoid duplicates)
        const exists = prev.some((n) => n.id === notification.id);
        if (exists) {
          return prev;
        }
        const updated = [unreadNotification, ...prev];
        // Recalculate count from updated list
        const unreadCount = updated.filter((n: Notification) => !n.read).length;
        setUnreadCount(unreadCount);
        notificationsRef.current = updated;
        return updated;
      });
        
        // Only show toast for important notifications (assignments, mentions)
        // Skip toasts for task status updates to avoid duplicate messages when user moves tasks
        const isStatusUpdate = notification.type === 'task_updated' && 
          notification.message?.includes('status changed');
        
        if (!isStatusUpdate) {
          toast.success(notification.title);
        }
      };

      socket.on('notification', handleNotification);

      return () => {
        socket.off('notification', handleNotification);
      };
    }
  }, [socket]);

  const loadNotifications = async () => {
    try {
      setLoading(true);
      const data = await notificationService.getAll();
      const notificationsList = data || [];
      
      // Merge with existing notifications to preserve any WebSocket notifications
      // that might not be in the server response yet
      setNotifications((prev) => {
        const serverIds = new Set(notificationsList.map((n: Notification) => n.id));
        const websocketOnly = prev.filter((n) => !serverIds.has(n.id));
        const merged = [...notificationsList, ...websocketOnly].sort((a, b) => 
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        
        // Recalculate unread count from the merged list
        const unread = merged.filter((n: Notification) => !n.read).length;
        setUnreadCount(unread);
        notificationsRef.current = merged;
        
        return merged;
      });
    } catch (error) {
      console.error('Failed to load notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id: string) => {
    // Check current state using ref to avoid closure issues
    const currentNotification = notificationsRef.current.find((n) => n.id === id);
    
    // Only proceed if notification exists and is unread
    if (!currentNotification || currentNotification.read) {
      return;
    }
    
    // Optimistic update - happens synchronously
    setNotifications((prev) => {
      const notification = prev.find((n) => n.id === id);
      
      // Double check it's still unread (might have changed)
      if (!notification || notification.read) {
        return prev;
      }
      
      // Update notification to read
      const updated = prev.map((n: Notification) => 
        n.id === id ? { ...n, read: true } : n
      ) as Notification[];
      
      // Recalculate count from updated list - this happens synchronously
      const unreadCount = updated.filter((n: Notification) => !n.read).length;
      setUnreadCount(unreadCount);
      notificationsRef.current = updated;
      
      return updated;
    });

    // Update on server in background (don't block UI)
    notificationService.markAsRead(id).catch((error) => {
      console.error('Failed to mark notification as read:', error);
      // Revert optimistic update on error
      setNotifications((prev) => {
        const reverted = prev.map((n: Notification) => 
          n.id === id ? { ...n, read: false } : n
        ) as Notification[];
        
        // Recalculate count from reverted list
        const unreadCount = reverted.filter((n: Notification) => !n.read).length;
        setUnreadCount(unreadCount);
        notificationsRef.current = reverted;
        
        return reverted;
      });
    });
  };

  const markAllAsRead = async () => {
    // Optimistic update
    setNotifications((prev) => {
      const updated = prev.map((n: Notification) => ({ ...n, read: true }));
      setUnreadCount(0);
      notificationsRef.current = updated;
      return updated;
    });

    // Then update on server
    try {
      await notificationService.markAllAsRead();
    } catch (error) {
      console.error('Failed to mark all as read:', error);
      // Revert on error - reload notifications to get correct state
      loadNotifications();
    }
  };

  return {
    notifications,
    unreadCount,
    loading,
    loadNotifications,
    markAsRead,
    markAllAsRead,
  };
};

