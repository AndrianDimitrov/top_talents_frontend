import { useState, useCallback, useEffect, useRef } from 'react';
import { useNotification } from '../contexts/NotificationContext';
import { ApiError } from '../utils/apiClient';

interface InfiniteScrollState<T> {
  items: T[];
  loading: boolean;
  error: Error | null;
  hasMore: boolean;
}

export function useInfiniteScroll<T>(
  fetchFn: (page: number) => Promise<{ data: T[]; total: number }>,
  options?: {
    pageSize?: number;
    errorMessage?: string;
    showNotifications?: boolean;
    threshold?: number;
  }
) {
  const {
    pageSize = 10,
    errorMessage = 'Failed to fetch more items',
    showNotifications = true,
    threshold = 0.5,
  } = options || {};

  const [state, setState] = useState<InfiniteScrollState<T>>({
    items: [],
    loading: false,
    error: null,
    hasMore: true,
  });
  const { showNotification } = useNotification();
  const pageRef = useRef(1);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadingRef = useRef(false);

  const loadMore = useCallback(async () => {
    if (loadingRef.current || !state.hasMore) return;

    loadingRef.current = true;
    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const { data, total } = await fetchFn(pageRef.current);
      const hasMore = state.items.length + data.length < total;

      setState(prev => ({
        items: [...prev.items, ...data],
        loading: false,
        error: null,
        hasMore,
      }));

      pageRef.current += 1;
    } catch (error) {
      const apiError = error instanceof ApiError ? error : new Error(errorMessage);
      setState(prev => ({
        ...prev,
        loading: false,
        error: apiError,
      }));

      if (showNotifications) {
        showNotification(
          error instanceof ApiError ? error.message : errorMessage,
          'error'
        );
      }
    } finally {
      loadingRef.current = false;
    }
  }, [fetchFn, state.items.length, state.hasMore, errorMessage, showNotifications, showNotification]);

  const observeElement = useCallback(
    (element: HTMLElement | null) => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }

      if (!element) return;

      observerRef.current = new IntersectionObserver(
        (entries) => {
          const [entry] = entries;
          if (entry.isIntersecting && !loadingRef.current && state.hasMore) {
            loadMore();
          }
        },
        {
          threshold,
        }
      );

      observerRef.current.observe(element);
    },
    [loadMore, state.hasMore, threshold]
  );

  const reset = useCallback(() => {
    pageRef.current = 1;
    setState({
      items: [],
      loading: false,
      error: null,
      hasMore: true,
    });
  }, []);

  useEffect(() => {
    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, []);

  return {
    ...state,
    observeElement,
    loadMore,
    reset,
  };
} 