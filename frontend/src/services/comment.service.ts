import api from './api';
import { handleError } from '../utils/errorHandler';

export interface Comment {
  id: string;
  content: string;
  taskId: string;
  userId: string;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    avatar?: string;
  };
  mentions?: string[]; // Array of mentioned user IDs
  createdAt: string;
  updatedAt: string;
}

export interface CreateCommentDto {
  content: string;
  taskId: string;
}

export const commentService = {
  async getByTaskId(taskId: string) {
    try {
      const response = await api.get('/comments', { params: { taskId } });
      return response.data;
    } catch (error) {
      handleError(error);
      throw error;
    }
  },

  async create(data: CreateCommentDto) {
    try {
      const response = await api.post('/comments', data);
      return response.data;
    } catch (error) {
      handleError(error);
      throw error;
    }
  },

  async update(id: string, content: string) {
    try {
      const response = await api.patch(`/comments/${id}`, { content });
      return response.data;
    } catch (error) {
      handleError(error);
      throw error;
    }
  },

  async delete(id: string) {
    try {
      const response = await api.delete(`/comments/${id}`);
      return response.data;
    } catch (error) {
      handleError(error);
      throw error;
    }
  },
};

