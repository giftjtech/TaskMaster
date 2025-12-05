import api from './api';
import { handleError } from '../utils/errorHandler';
import { Tag } from './task.service';

export const tagService = {
  async getAll(): Promise<Tag[]> {
    try {
      const response = await api.get('/tags');
      return response.data?.data || response.data || [];
    } catch (error) {
      handleError(error);
      throw error;
    }
  },
};

