import { useState, useCallback } from 'react';
import { useNotification } from '../contexts/NotificationContext';
import { ApiError } from '../utils/apiClient';

interface FileUploadState {
  loading: boolean;
  progress: number;
  error: Error | null;
}

export function useFileUpload() {
  const [state, setState] = useState<FileUploadState>({
    loading: false,
    progress: 0,
    error: null,
  });
  const { showNotification } = useNotification();

  const upload = useCallback(
    async (
      uploadFn: (file: File, onProgress: (progress: number) => void) => Promise<any>,
      file: File,
      options?: {
        successMessage?: string;
        errorMessage?: string;
        showNotifications?: boolean;
      }
    ) => {
      const {
        successMessage = 'File uploaded successfully',
        errorMessage = 'Failed to upload file',
        showNotifications = true,
      } = options || {};

      setState({ loading: true, progress: 0, error: null });

      try {
        const result = await uploadFn(file, (progress) => {
          setState(prev => ({ ...prev, progress }));
        });
        
        if (showNotifications && successMessage) {
          showNotification(successMessage, 'success');
        }
        
        setState({ loading: false, progress: 100, error: null });
        return result;
      } catch (error) {
        const apiError = error instanceof ApiError ? error : new Error(errorMessage);
        setState({ loading: false, progress: 0, error: apiError });
        
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
    setState({ loading: false, progress: 0, error: null });
  }, []);

  return {
    ...state,
    upload,
    reset,
  };
} 