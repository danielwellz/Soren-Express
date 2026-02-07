import { Box, Button, Card, CardContent, Container, Stack, Typography } from '@mui/material';
import React from 'react';
import { Link as RouterLink } from 'react-router-dom';

export function NotFoundPage() {
  return (
    <Container maxWidth="md" sx={{ py: { xs: 5, md: 8 } }}>
      <Card className="surface-glass">
        <CardContent>
          <Stack spacing={1.4} alignItems="flex-start">
            <Box
              sx={{
                px: 1.5,
                py: 0.5,
                borderRadius: 999,
                bgcolor: 'secondary.main',
                color: 'common.white',
                fontWeight: 700,
                fontSize: 13,
              }}
            >
              404
            </Box>
            <Typography variant="h3" sx={{ lineHeight: 1.1 }}>
              Page not found
            </Typography>
            <Typography color="text.secondary">
              The page you requested does not exist or may have moved.
            </Typography>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.2} sx={{ pt: 0.6 }}>
              <Button component={RouterLink} to="/" variant="contained">
                Go home
              </Button>
              <Button component={RouterLink} to="/products" variant="outlined">
                Browse products
              </Button>
            </Stack>
          </Stack>
        </CardContent>
      </Card>
    </Container>
  );
}
