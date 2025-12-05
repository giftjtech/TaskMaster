import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { authService, AuthResponse } from '../services/auth.service';
import toast from 'react-hot-toast';
import { useSessionCleanup } from '../hooks/useSessionCleanup';

interface AuthContextType {
  user: AuthResponse['user'] | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: any) => Promise<void>;
  logout: () => void;
  updateUser: (userData: Partial<AuthResponse['user']>) => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthContextProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<AuthResponse['user'] | null>(null);
  const [loading, setLoading] = useState(true);
  const hasInitializedRef = useRef(false);

  useEffect(() => {
    // Only run once on mount
    if (hasInitializedRef.current) {
      return;
    }
    hasInitializedRef.current = true;

    const token = localStorage.getItem('accessToken');
    if (token && !user) {
      // Only fetch profile if we have a token but no user (page refresh scenario)
      authService
        .getProfile()
        .then((data) => {
          // Handle response 
          const userData = data?.data || data;
          if (userData && (userData.id || userData.userId)) {
            setUser({
              id: userData.id || userData.userId,
              email: userData.email,
              firstName: userData.firstName || '',
              lastName: userData.lastName || '',
              avatar: userData.avatar,
              role: userData.role || 'user',
            });
          } else {
            console.warn('Invalid user data received:', userData);
            // If we have a token but can't get valid user data, clear tokens
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
            setUser(null);
          }
        })
        .catch((error) => {
          console.error('Failed to get profile:', error);
          // Clear tokens on any authentication-related error
          // This includes 401 (unauthorized), 403 (forbidden), or network errors
          // If the token is invalid or expired, we should clear it
          if (error?.response?.status === 401 || error?.response?.status === 403) {
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
            setUser(null);
          } else if (!error?.response) {
            // Network error - don't clear tokens, might be temporary
            // But still set user to null so ProtectedRoute can handle it
            console.warn('Network error during profile fetch, keeping token for retry');
          }
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const response = await authService.login({ email, password });
      
      // Validate response structure
      if (!response || !response.accessToken || !response.user) {
        console.error('Invalid login response:', response);
        throw new Error('Invalid response from server');
      }
      
      // Set tokens first (synchronous) - ensure they're not empty
      if (!response.accessToken || !response.refreshToken) {
        console.error('Login response missing tokens:', response);
        throw new Error('Invalid response from server: missing tokens');
      }
      
      localStorage.setItem('accessToken', response.accessToken.trim());
      localStorage.setItem('refreshToken', response.refreshToken.trim());
      
      // Verify token was set
      const savedToken = localStorage.getItem('accessToken');
      if (!savedToken) {
        console.error('Failed to save access token to localStorage');
        throw new Error('Failed to save authentication token');
      }
      
      // Track login time to prevent immediate redirects
      if (typeof window !== 'undefined') {
        (window as any).__lastLoginTime = Date.now();
      }
      
      // Set user state (this will trigger a re-render)
      setUser(response.user);
      
      // Ensure loading is false after login
      setLoading(false);
      
      toast.success('Welcome back!');
    } catch (error) {
      setLoading(false);
      throw error;
    }
  };

  const register = async (data: any) => {
    try {
      const response = await authService.register(data);
      localStorage.setItem('accessToken', response.accessToken);
      localStorage.setItem('refreshToken', response.refreshToken);
      setUser(response.user);
      toast.success('Account created successfully!');
    } catch (error) {
      throw error;
    }
  };

  const logout = async () => {
    try {
      // Disconnect WebSocket first
      const { websocketService } = await import('../services/websocket.service');
      websocketService.disconnect();
      
      // Call backend logout to invalidate refresh token
      await authService.logout();
    } catch (error) {
      // Continue with local cleanup even if backend call fails
      console.error('Logout error:', error);
    } finally {
      // Always clear local storage and state
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      setUser(null);
      toast.success('Logged out successfully');
    }
  };

  const updateUser = (userData: Partial<AuthResponse['user']>) => {
    if (user) {
      setUser({ ...user, ...userData });
    }
  };

  // Use session cleanup hook to handle app closure
  useSessionCleanup(!!user);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        logout,
        updateUser,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthContextProvider');
  }
  return context;
};

