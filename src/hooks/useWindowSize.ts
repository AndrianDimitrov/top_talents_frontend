import { useState, useEffect, useCallback } from 'react';
import debounce from 'lodash/debounce';

interface WindowSize {
  width: number;
  height: number;
  isLandscape: boolean;
  isPortrait: boolean;
  aspectRatio: number;
}

export function useWindowSize(
  options: {
    debounceMs?: number;
    initialSize?: WindowSize;
  } = {}
) {
  const {
    debounceMs = 100,
    initialSize = {
      width: window.innerWidth,
      height: window.innerHeight,
      isLandscape: window.innerWidth > window.innerHeight,
      isPortrait: window.innerWidth <= window.innerHeight,
      aspectRatio: window.innerWidth / window.innerHeight,
    },
  } = options;

  const [size, setSize] = useState<WindowSize>(initialSize);

  const handleResize = useCallback(
    debounce(() => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      const isLandscape = width > height;
      const isPortrait = width <= height;
      const aspectRatio = width / height;

      setSize({
        width,
        height,
        isLandscape,
        isPortrait,
        aspectRatio,
      });
    }, debounceMs),
    [debounceMs]
  );

  useEffect(() => {
    window.addEventListener('resize', handleResize);
    handleResize();

    return () => {
      window.removeEventListener('resize', handleResize);
      handleResize.cancel();
    };
  }, [handleResize]);

  return size;
} 