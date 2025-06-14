import { useState, useCallback } from 'react';

type ValidationRule<T> = (value: T) => string | undefined;

interface ValidationRules<T> {
  [key: string]: ValidationRule<T>;
}

interface ValidationState<T> {
  values: T;
  errors: Partial<Record<keyof T, string>>;
  touched: Partial<Record<keyof T, boolean>>;
  isValid: boolean;
}

export function useFormValidation<T extends Record<string, any>>(
  initialValues: T,
  validationRules: ValidationRules<T>
) {
  const [state, setState] = useState<ValidationState<T>>({
    values: initialValues,
    errors: {},
    touched: {},
    isValid: false,
  });

  const validateField = useCallback(
    (name: keyof T, value: T[keyof T]) => {
      const rule = validationRules[name as string];
      if (!rule) return undefined;
      return rule(value);
    },
    [validationRules]
  );

  const validateForm = useCallback(() => {
    const errors: Partial<Record<keyof T, string>> = {};
    let isValid = true;

    Object.keys(validationRules).forEach((key) => {
      const error = validateField(key as keyof T, state.values[key as keyof T]);
      if (error) {
        errors[key as keyof T] = error;
        isValid = false;
      }
    });

    setState(prev => ({
      ...prev,
      errors,
      isValid,
    }));

    return isValid;
  }, [state.values, validateField, validationRules]);

  const handleChange = useCallback(
    (name: keyof T, value: T[keyof T]) => {
      setState(prev => ({
        ...prev,
        values: {
          ...prev.values,
          [name]: value,
        },
        touched: {
          ...prev.touched,
          [name]: true,
        },
      }));

      const error = validateField(name, value);
      setState(prev => ({
        ...prev,
        errors: {
          ...prev.errors,
          [name]: error,
        },
      }));
    },
    [validateField]
  );

  const handleBlur = useCallback((name: keyof T) => {
    setState(prev => ({
      ...prev,
      touched: {
        ...prev.touched,
        [name]: true,
      },
    }));

    const error = validateField(name, state.values[name]);
    setState(prev => ({
      ...prev,
      errors: {
        ...prev.errors,
        [name]: error,
      },
    }));
  }, [state.values, validateField]);

  const reset = useCallback(() => {
    setState({
      values: initialValues,
      errors: {},
      touched: {},
      isValid: false,
    });
  }, [initialValues]);

  return {
    values: state.values,
    errors: state.errors,
    touched: state.touched,
    isValid: state.isValid,
    handleChange,
    handleBlur,
    validateForm,
    reset,
  };
} 