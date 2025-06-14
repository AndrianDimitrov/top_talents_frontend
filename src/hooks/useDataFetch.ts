import { useState, useCallback, useEffect } from 'react';
import { useNotification } from '../contexts/NotificationContext';
import { ApiError } from '../utils/apiClient';

interface CacheItem<T> {
  data: T;
  timestamp: number;
}

interface DataFetchState<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
}

export function useDataFetch<T>(
  fetchFn: () => Promise<T>,
  options?: {
    cacheKey?: string;
    cacheTime?: number;
    errorMessage?: string;
    showNotifications?: boolean;
    dependencies?: any[];
  }
) {
  const {
    cacheKey,
    cacheTime = 5 * 60 * 1000, // 5 minutes
    errorMessage = 'Failed to fetch data',
    showNotifications = true,
    dependencies = [],
  } = options || {};

  const [state, setState] = useState<DataFetchState<T>>({
    data: null,
    loading: true,
    error: null,
  });
  const { showNotification } = useNotification();

  const fetchData = useCallback(async () => {
    if (cacheKey) {
      const cached = localStorage.getItem(cacheKey);
      if (cached) {
        const { data, timestamp }: CacheItem<T> = JSON.parse(cached);
        if (Date.now() - timestamp < cacheTime) {
          setState({ data, loading: false, error: null });
          return;
        }
      }
    }

    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const data = await fetchFn();
      
      if (cacheKey) {
        const cacheItem: CacheItem<T> = {
          data,
          timestamp: Date.now(),
        };
        localStorage.setItem(cacheKey, JSON.stringify(cacheItem));
      }

      setState({ data, loading: false, error: null });
    } catch (error) {
      const apiError = error instanceof ApiError ? error : new Error(errorMessage);
      setState({ data: null, loading: false, error: apiError });
      
      if (showNotifications) {
        showNotification(
          error instanceof ApiError ? error.message : errorMessage,
          'error'
        );
      }
    }
  }, [fetchFn, cacheKey, cacheTime, errorMessage, showNotifications, showNotification]);

  useEffect(() => {
    fetchData();
  }, [fetchData, ...dependencies]);

  const invalidateCache = useCallback(() => {
    if (cacheKey) {
      localStorage.removeItem(cacheKey);
    }
  }, [cacheKey]);

  const refetch = useCallback(() => {
    invalidateCache();
    return fetchData();
  }, [invalidateCache, fetchData]);

  return {
    ...state,
    refetch,
    invalidateCache,
  };
} 