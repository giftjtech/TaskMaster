import api from './api';
import { handleError } from '../utils/errorHandler';

export interface Notification {
  id: string;
  userId: string;
  type: string;
  title: string;
  message: string;
  read: boolean;
  metadata?: any;
  createdAt: string;
}

export const notificationService = {
  async getAll() {
    try {
      const response = await api.get('/notifications');
      // Handle both wrapped { success, data } and direct response
      const data = response.data?.data || response.data;
      return Array.isArray(data) ? data : [];
    } catch (error) {
      handleError(error);
      throw error;
    }
  },

  async markAsRead(id: string) {
    try {
      const response = await api.patch(`/notifications/${id}/read`);
      return response.data;
    } catch (error) {
      handleError(error);
      throw error;
    }
  },

  async markAllAsRead() {
    try {
      const response = await api.patch('/notifications/read-all');
      return response.data;
    } catch (error) {
      handleError(error);
      throw error;
    }
  },
};

