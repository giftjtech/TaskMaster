import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth as useAuthContext } from '../../context/AuthContext';

interface LoginCredentials {
  email: string;
  password: string;
}

export const useLogin = () => {
  const { login } = useAuthContext();
  const navigate = useNavigate();
  const [isPending, setIsPending] = useState(false);

  const mutateAsync = async (credentials: LoginCredentials) => {
    setIsPending(true);
    try {
      await login(credentials.email, credentials.password);
      // Small delay to ensure React state updates have propagated
      // This prevents race condition where navigate happens before user state updates
      setTimeout(() => {
        navigate('/dashboard');
      }, 50);
    } catch (error) {
      setIsPending(false);
      throw error;
    }
  };

  return {
    mutateAsync,
    isPending,
  };
};

