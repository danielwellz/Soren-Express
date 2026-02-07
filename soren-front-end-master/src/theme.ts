import { alpha, createTheme, Direction } from '@mui/material/styles';

export type ThemeMode = 'light' | 'dark';

export const designTokens = {
  radius: {
    sm: 10,
    md: 14,
    lg: 20,
    pill: 999,
  },
  spacing: {
    section: 6,
    compact: 2,
  },
  light: {
    brand: '#0B2447',
    accent: '#00A6A6',
    accentAlt: '#2E5BFF',
    bg: '#F4F8FF',
    bgElevated: '#FFFFFF',
    textPrimary: '#0F172A',
    textSecondary: '#4B5565',
    border: '#D6E2F3',
  },
  dark: {
    brand: '#7FA8FF',
    accent: '#4CD4D4',
    accentAlt: '#85A2FF',
    bg: '#071122',
    bgElevated: '#0F1D34',
    textPrimary: '#E6ECFF',
    textSecondary: '#A7B4D0',
    border: '#22375C',
  },
};

export function createAppTheme(mode: ThemeMode, direction: Direction = 'ltr', language: 'en' | 'fa' = 'en') {
  const color = mode === 'dark' ? designTokens.dark : designTokens.light;
  const baseFontFamily =
    language === 'fa'
      ? '"Vazirmatn", "B Yekan", "Tahoma", sans-serif'
      : '"Manrope", "Space Grotesk", "Segoe UI", sans-serif';

  return createTheme({
    direction,
    palette: {
      mode,
      primary: {
        main: color.brand,
      },
      secondary: {
        main: color.accent,
      },
      background: {
        default: color.bg,
        paper: color.bgElevated,
      },
      text: {
        primary: color.textPrimary,
        secondary: color.textSecondary,
      },
      divider: color.border,
      success: {
        main: '#138A5F',
      },
      warning: {
        main: '#D48806',
      },
      error: {
        main: '#D64545',
      },
    },
    shape: {
      borderRadius: designTokens.radius.md,
    },
    typography: {
      fontFamily: baseFontFamily,
      h1: { fontWeight: 800, letterSpacing: -1.3 },
      h2: { fontWeight: 800, letterSpacing: -1 },
      h3: { fontWeight: 800, letterSpacing: -0.8 },
      h4: { fontWeight: 750, letterSpacing: -0.6 },
      h5: { fontWeight: 700, letterSpacing: -0.3 },
      h6: { fontWeight: 700, letterSpacing: -0.1 },
      button: {
        textTransform: 'none',
        fontWeight: 700,
      },
    },
    components: {
      MuiCssBaseline: {
        styleOverrides: {
          ':root': {
            colorScheme: mode,
            '--surface-start':
              mode === 'dark' ? alpha('#FFFFFF', 0.06) : 'rgba(255, 255, 255, 0.82)',
            '--surface-end':
              mode === 'dark' ? alpha('#FFFFFF', 0.01) : 'rgba(255, 255, 255, 0.95)',
            '--surface-border':
              mode === 'dark' ? alpha('#7FA8FF', 0.25) : 'rgba(217, 229, 243, 0.85)',
          },
          '*': {
            boxSizing: 'border-box',
          },
          body: {
            direction,
            backgroundColor: color.bg,
            color: color.textPrimary,
            fontFamily: baseFontFamily,
            minHeight: '100vh',
            backgroundImage:
              mode === 'dark'
                ? 'radial-gradient(circle at 10% 0%, rgba(127,168,255,0.16), transparent 34%), radial-gradient(circle at 100% 10%, rgba(76,212,212,0.14), transparent 26%)'
                : 'radial-gradient(circle at 0% 0%, rgba(32,82,149,0.14), transparent 36%), radial-gradient(circle at 100% 10%, rgba(0,166,166,0.11), transparent 30%)',
            backgroundAttachment: 'fixed',
          },
          a: {
            color: color.accentAlt,
          },
          '*:focus-visible': {
            outline: `3px solid ${alpha(color.accent, 0.55)}`,
            outlineOffset: 2,
          },
        },
      },
      MuiContainer: {
        defaultProps: {
          maxWidth: 'xl',
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: designTokens.radius.lg,
            border: `1px solid ${color.border}`,
            backgroundImage:
              mode === 'dark'
                ? `linear-gradient(160deg, ${alpha('#FFFFFF', 0.05)}, ${alpha('#FFFFFF', 0.01)})`
                : 'linear-gradient(160deg, rgba(255,255,255,0.92), rgba(255,255,255,0.97))',
            boxShadow:
              mode === 'dark'
                ? '0 18px 40px rgba(0, 0, 0, 0.25)'
                : '0 12px 30px rgba(11, 36, 71, 0.1)',
          },
        },
      },
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: designTokens.radius.md,
            minHeight: 42,
            paddingInline: 16,
          },
          contained: {
            boxShadow:
              mode === 'dark'
                ? '0 10px 20px rgba(0, 0, 0, 0.3)'
                : '0 10px 20px rgba(11, 36, 71, 0.2)',
          },
        },
      },
      MuiChip: {
        styleOverrides: {
          root: {
            borderRadius: designTokens.radius.sm,
            fontWeight: 600,
          },
        },
      },
      MuiOutlinedInput: {
        styleOverrides: {
          root: {
            borderRadius: designTokens.radius.md,
            backgroundColor: alpha(color.bgElevated, mode === 'dark' ? 0.45 : 0.95),
          },
        },
      },
      MuiStepper: {
        styleOverrides: {
          root: {
            borderRadius: designTokens.radius.md,
          },
        },
      },
    },
  });
}
