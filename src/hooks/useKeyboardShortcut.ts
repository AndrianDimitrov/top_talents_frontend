import { useEffect, useCallback } from 'react';

type KeyCombo = {
  key: string;
  ctrl?: boolean;
  shift?: boolean;
  alt?: boolean;
  meta?: boolean;
};

type ShortcutHandler = (event: KeyboardEvent) => void;

export function useKeyboardShortcut(
  keyCombo: KeyCombo,
  handler: ShortcutHandler,
  options?: {
    enabled?: boolean;
    preventDefault?: boolean;
    stopPropagation?: boolean;
  }
) {
  const {
    enabled = true,
    preventDefault = true,
    stopPropagation = true,
  } = options || {};

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (!enabled) return;

      const {
        key,
        ctrl = false,
        shift = false,
        alt = false,
        meta = false,
      } = keyCombo;

      const isKeyMatch = event.key.toLowerCase() === key.toLowerCase();
      const isCtrlMatch = event.ctrlKey === ctrl;
      const isShiftMatch = event.shiftKey === shift;
      const isAltMatch = event.altKey === alt;
      const isMetaMatch = event.metaKey === meta;

      if (isKeyMatch && isCtrlMatch && isShiftMatch && isAltMatch && isMetaMatch) {
        if (preventDefault) {
          event.preventDefault();
        }
        if (stopPropagation) {
          event.stopPropagation();
        }
        handler(event);
      }
    },
    [keyCombo, handler, enabled, preventDefault, stopPropagation]
  );

  useEffect(() => {
    if (enabled) {
      window.addEventListener('keydown', handleKeyDown);
      return () => {
        window.removeEventListener('keydown', handleKeyDown);
      };
    }
  }, [enabled, handleKeyDown]);
} 