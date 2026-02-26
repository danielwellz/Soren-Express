import { Grid, Skeleton, Stack } from '@mui/material';
import { motion, useReducedMotion } from 'framer-motion';
import React from 'react';

export function LoadingGrid({ count = 8 }: { count?: number }) {
  const reducedMotion = useReducedMotion();

  return (
    <Grid container spacing={2}>
      {Array.from({ length: count }).map((_, index) => (
        <Grid item xs={12} sm={6} md={4} lg={3} key={index}>
          <Stack
            component={motion.div}
            spacing={1.2}
            initial={reducedMotion ? { opacity: 0 } : { opacity: 0, y: 12 }}
            animate={reducedMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
            transition={{
              duration: reducedMotion ? 0.01 : 0.3,
              delay: reducedMotion ? 0 : index * 0.035,
              ease: 'easeOut',
            }}
          >
            <Skeleton variant="rounded" height={220} />
            <Skeleton variant="text" width="80%" />
            <Skeleton variant="text" width="55%" />
          </Stack>
        </Grid>
      ))}
    </Grid>
  );
}
