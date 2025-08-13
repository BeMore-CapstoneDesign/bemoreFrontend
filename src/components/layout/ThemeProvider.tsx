'use client';

import React, { useEffect } from 'react';
import { useAppStore } from '../../modules/store';

const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { theme } = useAppStore();

  useEffect(() => {
    const root = document.documentElement;
    const apply = (mode: 'light' | 'dark') => root.setAttribute('data-theme', mode);

    if (theme === 'auto') {
      const mq = window.matchMedia('(prefers-color-scheme: dark)');
      apply(mq.matches ? 'dark' : 'light');
      const handler = (e: MediaQueryListEvent) => apply(e.matches ? 'dark' : 'light');
      if (mq.addEventListener) mq.addEventListener('change', handler);
      else mq.addListener(handler as unknown as EventListener);
      return () => {
        if (mq.removeEventListener) mq.removeEventListener('change', handler);
        else mq.removeListener(handler as unknown as EventListener);
      };
    } else {
      apply(theme);
    }
  }, [theme]);

  return <>{children}</>; 
};

export default ThemeProvider;


