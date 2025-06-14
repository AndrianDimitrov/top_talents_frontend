import { useState, useEffect, useCallback } from 'react';
import { useTheme } from '@mui/material';

type Breakpoint = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

export function useMediaQuery(breakpoint: Breakpoint, direction: 'up' | 'down' = 'up') {
  const theme = useTheme();
  const [matches, setMatches] = useState(false);

  const getQuery = useCallback(() => {
    const breakpointValue = theme.breakpoints.values[breakpoint];
    return direction === 'up'
      ? `(min-width:${breakpointValue}px)`
      : `(max-width:${breakpointValue - 1}px)`;
  }, [theme.breakpoints.values, breakpoint, direction]);

  useEffect(() => {
    const mediaQuery = window.matchMedia(getQuery());
    setMatches(mediaQuery.matches);

    const handleChange = (event: MediaQueryListEvent) => {
      setMatches(event.matches);
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => {
      mediaQuery.removeEventListener('change', handleChange);
    };
  }, [getQuery]);

  return matches;
}

export function useIsMobile() {
  return useMediaQuery('sm', 'down');
}

export function useIsTablet() {
  const isMobile = useMediaQuery('md', 'down');
  const isDesktop = useMediaQuery('lg', 'up');
  return !isMobile && !isDesktop;
}

export function useIsDesktop() {
  return useMediaQuery('lg', 'up');
}

export function useIsWideScreen() {
  return useMediaQuery('xl', 'up');
} 