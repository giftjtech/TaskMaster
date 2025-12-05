import api from './api';
import { handleError } from '../utils/errorHandler';

export interface LoginDto {
  email: string;
  password: string;
}

export interface RegisterDto {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    avatar?: string;
    role: string;
  };
}

export const authService = {
  async login(data: LoginDto): Promise<AuthResponse> {
    try {
      const response = await api.post('/auth/login', data);
      // Handle both wrapped { success, data } and direct response
      return response.data?.data || response.data;
    } catch (error: any) {
      // Don't show toast for login errors - let the component handle it
      // Preserve the original error structure so response data is accessible
      // Update the error message if needed
      if (error?.response?.data?.message) {
        error.message = error.response.data.message;
      } else if (!error?.message || error.message.includes('status code')) {
        error.message = error?.response?.data?.message || 
                       error?.response?.data?.error || 
                       'Invalid email or password. Please try again.';
      }
      throw error;
    }
  },

  async register(data: RegisterDto): Promise<AuthResponse> {
    try {
      const response = await api.post('/auth/register', data);
      // Handle both wrapped { success, data } and direct response
      return response.data?.data || response.data;
    } catch (error) {
      handleError(error);
      throw error;
    }
  },

  async refreshToken(refreshToken: string): Promise<AuthResponse> {
    try {
      const response = await api.post('/auth/refresh', { refreshToken });
      return response.data;
    } catch (error) {
      handleError(error);
      throw error;
    }
  },

  async getProfile() {
    try {
      const response = await api.get('/auth/profile');
      // Handle both wrapped { success, data } and direct response
      return response.data?.data || response.data;
    } catch (error) {
      handleError(error);
      throw error;
    }
  },

  async forgotPassword(email: string) {
    try {
      const response = await api.post('/auth/forgot-password', { email });
      // Handle both wrapped { success, data } and direct response
      return response.data?.data || response.data;
    } catch (error) {
      handleError(error);
      throw error;
    }
  },

  async resetPassword(token: string, password: string) {
    try {
      const response = await api.post('/auth/reset-password', { token, password });
      // Handle both wrapped { success, data } and direct response
      return response.data?.data || response.data;
    } catch (error) {
      handleError(error);
      throw error;
    }
  },

  async logout(): Promise<void> {
    try {
      await api.post('/auth/logout');
    } catch (error) {
      // Even if logout fails, we should clear local storage
      console.error('Logout request failed:', error);
    }
  },
};

