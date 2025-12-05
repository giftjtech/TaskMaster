import api from './api';
import { handleError } from '../utils/errorHandler';

export interface Tag {
  id: string;
  name: string;
  color?: string;
  createdAt?: string;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  status: 'todo' | 'in_progress' | 'in_review' | 'done';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  dueDate?: string;
  projectId?: string;
  assigneeId?: string;
  assignee?: {
    id: string;
    firstName: string;
    lastName: string;
    avatar?: string;
  };
  createdBy?: {
    id: string;
    firstName: string;
    lastName: string;
  };
  project?: {
    id: string;
    name: string;
  };
  tags?: Tag[];
  comments?: Array<{
    id: string;
    content: string;
    userId: string;
    createdAt: string;
  }>;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTaskDto {
  title: string;
  description?: string;
  status?: Task['status'];
  priority?: Task['priority'];
  dueDate?: string;
  projectId?: string;
  assigneeId?: string;
  tags?: string[];
}

export interface FilterTaskDto {
  page?: number;
  limit?: number;
  status?: Task['status'];
  priority?: Task['priority'];
  projectId?: string;
  assigneeId?: string;
  tags?: string[];
}

export const taskService = {
  async getAll(filters?: FilterTaskDto) {
    try {
      const response = await api.get('/tasks', { params: filters });
      const result = response.data?.data || response.data;
      return result;
    } catch (error) {
      handleError(error);
      throw error;
    }
  },

  async getById(id: string) {
    try {
      const response = await api.get(`/tasks/${id}`);
      return response.data;
    } catch (error) {
      handleError(error);
      throw error;
    }
  },

  async create(data: CreateTaskDto) {
    try {
      const response = await api.post('/tasks', data);
      return response.data;
    } catch (error) {
      handleError(error);
      throw error;
    }
  },

  async update(id: string, data: Partial<CreateTaskDto>) {
    try {
      const response = await api.patch(`/tasks/${id}`, data);
      return response.data;
    } catch (error) {
      handleError(error);
      throw error;
    }
  },

  async delete(id: string) {
    try {
      const response = await api.delete(`/tasks/${id}`);
      return response.data;
    } catch (error) {
      handleError(error);
      throw error;
    }
  },
};

