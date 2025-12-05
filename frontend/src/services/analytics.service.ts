import api from './api';
import { handleError } from '../utils/errorHandler';

export const analyticsService = {
  async getTaskStats() {
    try {
      const response = await api.get('/analytics/task-stats');
      // Handle both wrapped { success, data } and direct response
      return response.data?.data || response.data;
    } catch (error) {
      handleError(error);
      throw error;
    }
  },

  async getCompletionRate(days?: number) {
    try {
      const response = await api.get('/analytics/completion-rate', {
        params: { days },
      });
      return response.data;
    } catch (error) {
      handleError(error);
      throw error;
    }
  },

  async getTasksByPriority() {
    try {
      const response = await api.get('/analytics/tasks-by-priority');
      return response.data;
    } catch (error) {
      handleError(error);
      throw error;
    }
  },

  async getProjectStats() {
    try {
      const response = await api.get('/analytics/project-stats');
      return response.data;
    } catch (error) {
      handleError(error);
      throw error;
    }
  },

  async getRecentActivity(limit?: number) {
    try {
      const response = await api.get('/analytics/recent-activity', {
        params: { limit },
      });
      return response.data;
    } catch (error) {
      handleError(error);
      throw error;
    }
  },
};

