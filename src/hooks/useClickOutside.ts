import { useEffect, useRef, useCallback } from 'react';

type ClickOutsideHandler = (event: MouseEvent | TouchEvent) => void;

export function useClickOutside(
  handler: ClickOutsideHandler,
  options: {
    enabled?: boolean;
    ignoreElements?: (HTMLElement | null)[];
  } = {}
) {
  const { enabled = true, ignoreElements = [] } = options;
  const ref = useRef<HTMLElement>(null);

  const handleClickOutside = useCallback(
    (event: MouseEvent | TouchEvent) => {
      if (!enabled) return;

      const target = event.target as HTMLElement;
      const element = ref.current;

      if (!element) return;

      const isIgnored = ignoreElements.some(
        (el) => el && (el === target || el.contains(target))
      );

      if (isIgnored) return;

      const isOutside = !element.contains(target);
      if (isOutside) {
        handler(event);
      }
    },
    [enabled, handler, ignoreElements]
  );

  useEffect(() => {
    if (enabled) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('touchstart', handleClickOutside);

      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
        document.removeEventListener('touchstart', handleClickOutside);
      };
    }
  }, [enabled, handleClickOutside]);

  return ref;
} 