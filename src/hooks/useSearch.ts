import { useState, useCallback, useEffect } from 'react';
import { useNotification } from '../contexts/NotificationContext';
import { ApiError } from '../utils/apiClient';
import debounce from 'lodash/debounce';

interface SearchState<T> {
  data: T[];
  loading: boolean;
  error: Error | null;
  query: string;
}

export function useSearch<T>(initialQuery = '', debounceMs = 300) {
  const [state, setState] = useState<SearchState<T>>({
    data: [],
    loading: false,
    error: null,
    query: initialQuery,
  });
  const { showNotification } = useNotification();

  const search = useCallback(
    async (
      searchFn: (query: string) => Promise<T[]>,
      options?: {
        errorMessage?: string;
        showNotifications?: boolean;
      }
    ) => {
      const {
        errorMessage = 'Failed to perform search',
        showNotifications = true,
      } = options || {};

      setState(prev => ({ ...prev, loading: true, error: null }));

      try {
        const data = await searchFn(state.query);
        setState(prev => ({ ...prev, data, loading: false }));
        return data;
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
    [state.query, showNotification]
  );

  const debouncedSearch = useCallback(
    debounce((searchFn: (query: string) => Promise<T[]>, options?: any) => {
      search(searchFn, options);
    }, debounceMs),
    [search]
  );

  const setQuery = useCallback((query: string) => {
    setState(prev => ({ ...prev, query }));
  }, []);

  const reset = useCallback(() => {
    setState({
      data: [],
      loading: false,
      error: null,
      query: initialQuery,
    });
  }, [initialQuery]);

  useEffect(() => {
    return () => {
      debouncedSearch.cancel();
    };
  }, [debouncedSearch]);

  return {
    ...state,
    search,
    debouncedSearch,
    setQuery,
    reset,
  };
} 