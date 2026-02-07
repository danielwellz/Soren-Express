import { ThemeProvider } from '@mui/material';
import React, { createContext, useContext, useMemo, useState } from 'react';
import { useLocale } from './LocaleContext';
import { createAppTheme, ThemeMode } from '../theme';

const THEME_STORAGE_KEY = 'soren_theme_mode';

type ThemeModeContextValue = {
  mode: ThemeMode;
  toggleMode: () => void;
};

const ThemeModeContext = createContext<ThemeModeContextValue | undefined>(undefined);

function getInitialMode(): ThemeMode {
  if (typeof window === 'undefined') {
    return 'light';
  }

  const storedMode = localStorage.getItem(THEME_STORAGE_KEY);
  if (storedMode === 'light' || storedMode === 'dark') {
    return storedMode;
  }

  const prefersDark = Boolean(window.matchMedia?.('(prefers-color-scheme: dark)')?.matches);
  return prefersDark ? 'dark' : 'light';
}

export function ThemeModeProvider({ children }: { children: React.ReactNode }) {
  const { direction, language } = useLocale();
  const [mode, setMode] = useState<ThemeMode>(getInitialMode);

  const value = useMemo<ThemeModeContextValue>(
    () => ({
      mode,
      toggleMode: () => {
        setMode((prev: ThemeMode) => {
          const next = prev === 'light' ? 'dark' : 'light';
          if (typeof window !== 'undefined') {
            localStorage.setItem(THEME_STORAGE_KEY, next);
          }
          return next;
        });
      },
    }),
    [mode],
  );

  const theme = useMemo(
    () => createAppTheme(mode, direction, language),
    [direction, language, mode],
  );

  return (
    <ThemeModeContext.Provider value={value}>
      <ThemeProvider theme={theme}>{children}</ThemeProvider>
    </ThemeModeContext.Provider>
  );
}

export function useThemeMode(): ThemeModeContextValue {
  const context = useContext(ThemeModeContext);
  if (!context) {
    throw new Error('useThemeMode must be used within ThemeModeProvider');
  }
  return context;
}
