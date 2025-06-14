import { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useNotification } from '../contexts/NotificationContext';
import { apiClient } from '../utils/apiClient';
import { User, LoginRequest, RegisterRequest } from '../types/api';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: Error | null;
}

export function useAuth() {
  const [state, setState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    loading: true,
    error: null,
  });
  const navigate = useNavigate();
  const { showNotification } = useNotification();

  const checkAuth = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setState(prev => ({ ...prev, loading: false }));
        return;
      }

      const user = await apiClient.getCurrentUser();
      setState({
        user,
        isAuthenticated: true,
        loading: false,
        error: null,
      });
    } catch (error) {
      setState({
        user: null,
        isAuthenticated: false,
        loading: false,
        error: error as Error,
      });
      localStorage.removeItem('token');
    }
  }, []);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const login = useCallback(
    async (data: LoginRequest) => {
      setState(prev => ({ ...prev, loading: true, error: null }));

      try {
        const response = await apiClient.login(data);
        const { token, user } = response;
        
        localStorage.setItem('token', token);
        setState({
          user,
          isAuthenticated: true,
          loading: false,
          error: null,
        });

        showNotification('Successfully logged in', 'success');
        navigate('/');
      } catch (error) {
        setState(prev => ({
          ...prev,
          loading: false,
          error: error as Error,
        }));
        throw error;
      }
    },
    [navigate, showNotification]
  );

  const register = useCallback(
    async (data: RegisterRequest) => {
      setState(prev => ({ ...prev, loading: true, error: null }));

      try {
        const response = await apiClient.register(data);
        const { token, user } = response;
        
        localStorage.setItem('token', token);
        setState({
          user,
          isAuthenticated: true,
          loading: false,
          error: null,
        });

        showNotification('Successfully registered', 'success');
        navigate('/');
      } catch (error) {
        setState(prev => ({
          ...prev,
          loading: false,
          error: error as Error,
        }));
        throw error;
      }
    },
    [navigate, showNotification]
  );

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    setState({
      user: null,
      isAuthenticated: false,
      loading: false,
      error: null,
    });
    showNotification('Successfully logged out', 'success');
    navigate('/login');
  }, [navigate, showNotification]);

  return {
    ...state,
    login,
    register,
    logout,
    checkAuth,
  };
} 