import { useState, useCallback } from 'react';
import { apiClient } from '../utils/apiClient';

interface ApiState<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
}

interface ApiResponse<T> extends ApiState<T> {
  execute: (...args: any[]) => Promise<void>;
}

export function useApi<T>(
  apiMethod: (...args: any[]) => Promise<T>,
  initialData: T | null = null
): ApiResponse<T> {
  const [state, setState] = useState<ApiState<T>>({
    data: initialData,
    loading: false,
    error: null,
  });

  const execute = useCallback(
    async (...args: any[]) => {
      try {
        setState((prev) => ({ ...prev, loading: true, error: null }));
        const data = await apiMethod(...args);
        setState({ data, loading: false, error: null });
      } catch (error) {
        setState({
          data: null,
          loading: false,
          error: error instanceof Error ? error : new Error('An error occurred'),
        });
      }
    },
    [apiMethod]
  );

  return {
    ...state,
    execute,
  };
}

// Example usage:
// const { data, loading, error, execute } = useApi(apiClient.getTalents);
// const { data, loading, error, execute } = useApi(apiClient.createTalent); 