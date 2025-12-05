import api from './api';
import { handleError } from '../utils/errorHandler';

export interface Project {
  id: string;
  name: string;
  description?: string;
  color?: string;
  ownerId: string;
  owner?: {
    id: string;
    firstName: string;
    lastName: string;
  };
  tasks?: any[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateProjectDto {
  name: string;
  description?: string;
  color?: string;
}

export const projectService = {
  async getAll() {
    try {
      const response = await api.get('/projects');
      // Handle both wrapped { success, data } and direct response
      return response.data?.data || response.data;
    } catch (error) {
      handleError(error);
      throw error;
    }
  },

  async getById(id: string) {
    try {
      const response = await api.get(`/projects/${id}`);
      return response.data;
    } catch (error) {
      handleError(error);
      throw error;
    }
  },

  async create(data: CreateProjectDto) {
    try {
      const response = await api.post('/projects', data);
      return response.data;
    } catch (error) {
      handleError(error);
      throw error;
    }
  },

  async update(id: string, data: Partial<CreateProjectDto>) {
    try {
      const response = await api.patch(`/projects/${id}`, data);
      return response.data;
    } catch (error) {
      handleError(error);
      throw error;
    }
  },

  async delete(id: string) {
    try {
      const response = await api.delete(`/projects/${id}`);
      return response.data;
    } catch (error) {
      handleError(error);
      throw error;
    }
  },
};

