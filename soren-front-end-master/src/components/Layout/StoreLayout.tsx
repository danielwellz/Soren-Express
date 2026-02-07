import { Box } from '@mui/material';
import { AnimatePresence, MotionConfig, motion } from 'framer-motion';
import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { RouteErrorBoundary } from '../common/RouteErrorBoundary';
import { Footer } from './StoreFooter';
import { Header } from './StoreHeader';

export function AppLayout() {
  const location = useLocation();

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background:
          'radial-gradient(circle at 10% -10%, rgba(32, 82, 149, 0.16) 0%, transparent 32%), radial-gradient(circle at 90% 0%, rgba(0, 166, 166, 0.1) 0%, transparent 34%), linear-gradient(180deg, #f3f7ff 0%, #ffffff 62%)',
      }}
    >
      <Header />
      <Box component="main" sx={{ minHeight: 'calc(100vh - 250px)' }}>
        <MotionConfig reducedMotion="user">
          <AnimatePresence mode="wait" initial={false}>
            <Box
              component={motion.div}
              key={location.pathname}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.28, ease: 'easeOut' }}
            >
              <RouteErrorBoundary>
                <Outlet />
              </RouteErrorBoundary>
            </Box>
          </AnimatePresence>
        </MotionConfig>
      </Box>
      <Footer />
    </Box>
  );
}
