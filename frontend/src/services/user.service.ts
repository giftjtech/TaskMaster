import api from './api';
import { handleError } from '../utils/errorHandler';

export interface NotificationPreferences {
  emailNotifications?: boolean;
  taskAssignments?: boolean;
  taskUpdates?: boolean;
  projectUpdates?: boolean;
  comments?: boolean;
}

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  avatar?: string;
  role: string;
  createdAt: string;
  notificationPreferences?: NotificationPreferences;
}

export interface CreateUserData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role?: 'user' | 'admin';
}

export const userService = {
  async getAll() {
    try {
      const response = await api.get('/users');
      // Handle both wrapped { success, data } and direct response
      return response.data?.data || response.data;
    } catch (error) {
      handleError(error);
      throw error;
    }
  },

  async getById(id: string) {
    try {
      const response = await api.get(`/users/${id}`);
      return response.data;
    } catch (error) {
      handleError(error);
      throw error;
    }
  },

  async create(data: CreateUserData) {
    try {
      const response = await api.post('/users', data);
      return response.data;
    } catch (error) {
      handleError(error);
      throw error;
    }
  },

  async update(id: string, data: Partial<User>) {
    try {
      const response = await api.patch(`/users/${id}`, data);
      return response.data;
    } catch (error) {
      handleError(error);
      throw error;
    }
  },

  async updateNotificationPreferences(id: string, preferences: NotificationPreferences) {
    try {
      const response = await api.patch(`/users/${id}/notification-preferences`, preferences);
      return response.data;
    } catch (error) {
      handleError(error);
      throw error;
    }
  },
};

