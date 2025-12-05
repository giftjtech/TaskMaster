import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { API_URL } from '../utils/constants';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: any) => void;
  reject: (error?: any) => void;
}> = [];

// Helper to get last login time
const getLastLoginTime = () => {
  if (typeof window !== 'undefined' && (window as any).__lastLoginTime) {
    return (window as any).__lastLoginTime;
  }
  return 0;
};

const processQueue = (error: AxiosError | null, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    // Ensure token is not empty or just whitespace
    const trimmedToken = token.trim();
    if (trimmedToken) {
      config.headers.Authorization = `Bearer ${trimmedToken}`;
      // Debug: log token presence (first 20 chars only for security)
     
    } else {
      console.warn('[API] Token is empty or whitespace');
    }
  } else {
    // If no token and this is a protected endpoint, don't make the request
    const isProtectedEndpoint = !config.url?.includes('/auth/login') && 
                                !config.url?.includes('/auth/register') &&
                                !config.url?.includes('/auth/refresh') &&
                                !config.url?.includes('/auth/forgot-password') &&
                                !config.url?.includes('/auth/reset-password');
    if (isProtectedEndpoint) {
      console.warn('[API] No access token found for protected endpoint:', config.url);
    }
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    // Only handle 401 errors, and skip if this is a login/register/forgot-password/reset-password request
    const isAuthRequest = originalRequest?.url?.includes('/auth/login') || 
                         originalRequest?.url?.includes('/auth/register') ||
                         originalRequest?.url?.includes('/auth/forgot-password') ||
                         originalRequest?.url?.includes('/auth/reset-password');
    
    if (error.response?.status === 401 && originalRequest && !originalRequest._retry && !isAuthRequest) {
      // If we're already refreshing, queue this request
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${token}`;
            }
            return api(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const refreshToken = localStorage.getItem('refreshToken');
      
      // Try to refresh the token
      if (refreshToken) {
        try {
          // Use direct axios call to avoid interceptor recursion
          const response = await axios.post(`${API_URL}/auth/refresh`, { refreshToken });
          const data = response.data?.data || response.data;
          const { accessToken, refreshToken: newRefreshToken } = data;
          
          localStorage.setItem('accessToken', accessToken);
          if (newRefreshToken) {
            localStorage.setItem('refreshToken', newRefreshToken);
          }
          
          // Update the original request with new token
          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          }
          
          processQueue(null, accessToken);
          isRefreshing = false;
          
          // Retry the original request
          return api(originalRequest);
        } catch (refreshError) {
          // Refresh failed, clear tokens and redirect to login
          processQueue(refreshError as AxiosError, null);
          isRefreshing = false;
          
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          
      // Only redirect if not already on login/register page and not an auth endpoint
      const isAuthEndpoint = originalRequest.url?.includes('/auth/login') || 
                            originalRequest.url?.includes('/auth/register') ||
                            originalRequest.url?.includes('/auth/refresh') ||
                            originalRequest.url?.includes('/auth/forgot-password') ||
                            originalRequest.url?.includes('/auth/reset-password');
      
      // Don't redirect if we just logged in (within last 5 seconds)
      const timeSinceLogin = Date.now() - getLastLoginTime();
      const justLoggedIn = timeSinceLogin < 5000;
      
      if (!isAuthEndpoint && 
          !justLoggedIn &&
          window.location.pathname !== '/login' && 
          window.location.pathname !== '/register') {
        // Use replace to prevent back button issues
        window.location.replace('/login');
      }
          
          return Promise.reject(refreshError);
        }
      } else {
        // No refresh token, clear everything and redirect
        isRefreshing = false;
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        
        const isAuthEndpoint = originalRequest.url?.includes('/auth/login') || 
                                originalRequest.url?.includes('/auth/register') ||
                                originalRequest.url?.includes('/auth/refresh') ||
                                originalRequest.url?.includes('/auth/forgot-password') ||
                                originalRequest.url?.includes('/auth/reset-password');
        
        // Don't redirect if we just logged in (within last 5 seconds)
        const timeSinceLogin = Date.now() - getLastLoginTime();
        const justLoggedIn = timeSinceLogin < 5000;
        
        if (!isAuthEndpoint && 
            !justLoggedIn &&
            window.location.pathname !== '/login' && 
            window.location.pathname !== '/register') {
          window.location.replace('/login');
        }
        
        return Promise.reject(error);
      }
    }

    return Promise.reject(error);
  }
);

export default api;

