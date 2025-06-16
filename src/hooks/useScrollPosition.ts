import { useState, useEffect, useCallback } from 'react';
import throttle from 'lodash/throttle';

interface ScrollPosition {
  x: number;
  y: number;
  direction: 'up' | 'down' | null;
  isAtTop: boolean;
  isAtBottom: boolean;
}

export function useScrollPosition(
  options: {
    throttleMs?: number;
    element?: HTMLElement | null;
  } = {}
) {
  const { throttleMs = 100, element } = options;

  const [position, setPosition] = useState<ScrollPosition>({
    x: 0,
    y: 0,
    direction: null,
    isAtTop: true,
    isAtBottom: false,
  });

  const handleScroll = useCallback(
    throttle(() => {
      const target = element || window;
      const scrollTop = target === window ? window.scrollY : target.scrollTop;
      const scrollLeft = target === window ? window.scrollX : target.scrollLeft;
      const scrollHeight = target === window ? document.documentElement.scrollHeight : target.scrollHeight;
      const clientHeight = target === window ? window.innerHeight : target.clientHeight;

      setPosition(prev => ({
        x: scrollLeft,
        y: scrollTop,
        direction: scrollTop > prev.y ? 'down' : scrollTop < prev.y ? 'up' : null,
        isAtTop: scrollTop === 0,
        isAtBottom: Math.abs(scrollHeight - clientHeight - scrollTop) < 1,
      }));
    }, throttleMs),
    [element, throttleMs]
  );

  useEffect(() => {
    const target = element || window;
    target.addEventListener('scroll', handleScroll);
    handleScroll();

    return () => {
      target.removeEventListener('scroll', handleScroll);
      handleScroll.cancel();
    };
  }, [element, handleScroll]);

  return position;
} 