import { useState, useCallback } from 'react';
import { useNotification } from '../contexts/NotificationContext';
import { ApiError } from '../utils/apiClient';

interface FormSubmitState {
  loading: boolean;
  error: Error | null;
}

export function useFormSubmit<T, R>() {
  const [state, setState] = useState<FormSubmitState>({
    loading: false,
    error: null,
  });
  const { showNotification } = useNotification();

  const submit = useCallback(
    async (
      submitFn: (data: T) => Promise<R>,
      data: T,
      options?: {
        successMessage?: string;
        errorMessage?: string;
        showNotifications?: boolean;
      }
    ) => {
      const {
        successMessage = 'Form submitted successfully',
        errorMessage = 'Failed to submit form',
        showNotifications = true,
      } = options || {};

      setState({ loading: true, error: null });

      try {
        const result = await submitFn(data);
        
        if (showNotifications && successMessage) {
          showNotification(successMessage, 'success');
        }
        
        setState({ loading: false, error: null });
        return result;
      } catch (error) {
        const apiError = error instanceof ApiError ? error : new Error(errorMessage);
        setState({ loading: false, error: apiError });
        
        if (showNotifications) {
          showNotification(
            error instanceof ApiError ? error.message : errorMessage,
            'error'
          );
        }
        
        throw apiError;
      }
    },
    [showNotification]
  );

  const reset = useCallback(() => {
    setState({ loading: false, error: null });
  }, []);

  return {
    ...state,
    submit,
    reset,
  };
} 