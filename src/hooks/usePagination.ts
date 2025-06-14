import { useState, useCallback } from 'react';
import { useNotification } from '../contexts/NotificationContext';
import { ApiError } from '../utils/apiClient';

interface PaginationState<T> {
  data: T[];
  loading: boolean;
  error: Error | null;
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
}

export function usePagination<T>(initialPageSize = 10) {
  const [state, setState] = useState<PaginationState<T>>({
    data: [],
    loading: false,
    error: null,
    page: 1,
    pageSize: initialPageSize,
    totalItems: 0,
    totalPages: 0,
  });
  const { showNotification } = useNotification();

  const fetchPage = useCallback(
    async (
      fetchFn: (page: number, pageSize: number) => Promise<{ data: T[]; total: number }>,
      options?: {
        errorMessage?: string;
        showNotifications?: boolean;
      }
    ) => {
      const {
        errorMessage = 'Failed to fetch data',
        showNotifications = true,
      } = options || {};

      setState(prev => ({ ...prev, loading: true, error: null }));

      try {
        const { data, total } = await fetchFn(state.page, state.pageSize);
        const totalPages = Math.ceil(total / state.pageSize);
        
        setState(prev => ({
          ...prev,
          data,
          loading: false,
          totalItems: total,
          totalPages,
        }));
        
        return { data, total, totalPages };
      } catch (error) {
        const apiError = error instanceof ApiError ? error : new Error(errorMessage);
        setState(prev => ({ ...prev, loading: false, error: apiError }));
        
        if (showNotifications) {
          showNotification(
            error instanceof ApiError ? error.message : errorMessage,
            'error'
          );
        }
        
        throw apiError;
      }
    },
    [state.page, state.pageSize, showNotification]
  );

  const setPage = useCallback((page: number) => {
    setState(prev => ({ ...prev, page }));
  }, []);

  const setPageSize = useCallback((pageSize: number) => {
    setState(prev => ({ ...prev, pageSize, page: 1 }));
  }, []);

  const reset = useCallback(() => {
    setState({
      data: [],
      loading: false,
      error: null,
      page: 1,
      pageSize: initialPageSize,
      totalItems: 0,
      totalPages: 0,
    });
  }, [initialPageSize]);

  return {
    ...state,
    fetchPage,
    setPage,
    setPageSize,
    reset,
  };
} 