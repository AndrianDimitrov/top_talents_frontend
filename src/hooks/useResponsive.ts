import { useState, useEffect, useCallback } from 'react';
import { useTheme } from '@mui/material';

type Breakpoint = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

interface ResponsiveState {
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  breakpoint: Breakpoint;
  width: number;
}

export function useResponsive() {
  const theme = useTheme();
  const [state, setState] = useState<ResponsiveState>({
    isMobile: false,
    isTablet: false,
    isDesktop: false,
    breakpoint: 'xs',
    width: window.innerWidth,
  });

  const getBreakpoint = useCallback(
    (width: number): Breakpoint => {
      if (width >= theme.breakpoints.values.xl) return 'xl';
      if (width >= theme.breakpoints.values.lg) return 'lg';
      if (width >= theme.breakpoints.values.md) return 'md';
      if (width >= theme.breakpoints.values.sm) return 'sm';
      return 'xs';
    },
    [theme.breakpoints.values]
  );

  const handleResize = useCallback(() => {
    const width = window.innerWidth;
    const breakpoint = getBreakpoint(width);

    setState({
      isMobile: breakpoint === 'xs' || breakpoint === 'sm',
      isTablet: breakpoint === 'md',
      isDesktop: breakpoint === 'lg' || breakpoint === 'xl',
      breakpoint,
      width,
    });
  }, [getBreakpoint]);

  useEffect(() => {
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [handleResize]);

  return state;
} 