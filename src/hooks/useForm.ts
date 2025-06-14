import { useCallback } from 'react';
import { useFormValidation } from './useFormValidation';
import { useFormSubmit } from './useFormSubmit';

export function useForm<T extends Record<string, any>, R>(
  initialValues: T,
  validationRules: Record<keyof T, (value: T[keyof T]) => string | undefined>,
  onSubmit: (values: T) => Promise<R>,
  options?: {
    successMessage?: string;
    errorMessage?: string;
    showNotifications?: boolean;
  }
) {
  const {
    values,
    errors,
    touched,
    isValid,
    handleChange,
    handleBlur,
    validateForm,
    reset: resetValidation,
  } = useFormValidation(initialValues, validationRules);

  const {
    loading,
    error,
    submit,
    reset: resetSubmit,
  } = useFormSubmit<T, R>();

  const handleSubmit = useCallback(
    async (e?: React.FormEvent) => {
      if (e) {
        e.preventDefault();
      }

      if (!validateForm()) {
        return;
      }

      try {
        const result = await submit(onSubmit, values, options);
        return result;
      } catch (error) {
        throw error;
      }
    },
    [validateForm, submit, values, options]
  );

  const reset = useCallback(() => {
    resetValidation();
    resetSubmit();
  }, [resetValidation, resetSubmit]);

  return {
    values,
    errors,
    touched,
    isValid,
    loading,
    error,
    handleChange,
    handleBlur,
    handleSubmit,
    reset,
  };
} 