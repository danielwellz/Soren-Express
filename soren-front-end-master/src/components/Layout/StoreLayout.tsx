import { Box } from '@mui/material';
import { alpha } from '@mui/material/styles';
import { AnimatePresence, MotionConfig, motion, useReducedMotion } from 'framer-motion';
import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { HelpCenterWidget } from '../common/HelpCenterWidget';
import { RouteErrorBoundary } from '../common/RouteErrorBoundary';
import { Footer } from './StoreFooter';
import { Header } from './StoreHeader';

export function AppLayout() {
  const { t } = useTranslation();
  const location = useLocation();
  const reducedMotion = useReducedMotion();

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: (theme) =>
          `radial-gradient(circle at 10% -10%, ${alpha(theme.palette.primary.main, 0.16)} 0%, transparent 32%), radial-gradient(circle at 90% 0%, ${alpha(theme.palette.secondary.main, 0.1)} 0%, transparent 34%), linear-gradient(180deg, ${theme.palette.background.default} 0%, ${theme.palette.background.paper} 62%)`,
      }}
    >
      <Box
        component="a"
        href="#app-main-content"
        sx={{
          position: 'absolute',
          top: -40,
          left: 12,
          zIndex: 1400,
          px: 1.25,
          py: 0.7,
          borderRadius: 1,
          bgcolor: 'background.paper',
          border: '1px solid',
          borderColor: 'divider',
          textDecoration: 'none',
          '&:focus-visible': {
            top: 12,
          },
        }}
      >
        {t('a11y.skipToMain')}
      </Box>
      <Header />
      <Box component="main" id="app-main-content" sx={{ minHeight: 'calc(100vh - 250px)' }}>
        <MotionConfig reducedMotion="user">
          <AnimatePresence mode="wait" initial={false}>
            <Box
              component={motion.div}
              key={location.pathname}
              initial={reducedMotion ? { opacity: 0 } : { opacity: 0, y: 10 }}
              animate={reducedMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
              exit={reducedMotion ? { opacity: 0 } : { opacity: 0, y: -8 }}
              transition={{ duration: reducedMotion ? 0.01 : 0.28, ease: 'easeOut' }}
            >
              <RouteErrorBoundary>
                <Outlet />
              </RouteErrorBoundary>
            </Box>
          </AnimatePresence>
        </MotionConfig>
      </Box>
      <HelpCenterWidget />
      <Footer />
    </Box>
  );
}
