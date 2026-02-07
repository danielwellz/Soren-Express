import { Box, Container, Grid, Stack, Typography } from '@mui/material';
import React from 'react';
import { Link as RouterLink } from 'react-router-dom';

const footerLinkSx = {
  color: '#e2ecff',
  textDecoration: 'none',
  transition: 'color 160ms ease',
  '&:hover': {
    color: '#72f2e9',
  },
};

export function Footer() {
  return (
    <Box
      component="footer"
      sx={{
        mt: { xs: 8, md: 10 },
        pt: 6,
        pb: 4,
        color: '#ffffff',
        background:
          'linear-gradient(120deg, #051328 0%, #0b2447 42%, #0f4f66 100%)',
      }}
    >
      <Container maxWidth="xl">
        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <Stack spacing={1}>
              <Typography variant="h5" sx={{ fontWeight: 800 }}>
                Soren Store
              </Typography>
              <Typography sx={{ color: '#d2def6' }}>
                Premium demo storefront with live catalog/cart flows, simulated payments, and admin analytics.
              </Typography>
            </Stack>
          </Grid>
          <Grid item xs={6} md={3}>
            <Stack spacing={1}>
              <Typography variant="subtitle1">Shop</Typography>
              <Typography component={RouterLink} to="/" sx={footerLinkSx}>
                Home
              </Typography>
              <Typography component={RouterLink} to="/products" sx={footerLinkSx}>
                Products
              </Typography>
              <Typography component={RouterLink} to="/cart" sx={footerLinkSx}>
                Cart
              </Typography>
            </Stack>
          </Grid>
          <Grid item xs={6} md={3}>
            <Stack spacing={1}>
              <Typography variant="subtitle1">Account</Typography>
              <Typography component={RouterLink} to="/account" sx={footerLinkSx}>
                My account
              </Typography>
              <Typography component={RouterLink} to="/auth/login" sx={footerLinkSx}>
                Login
              </Typography>
              <Typography component={RouterLink} to="/auth/register" sx={footerLinkSx}>
                Register
              </Typography>
            </Stack>
          </Grid>
          <Grid item xs={12} md={2}>
            <Stack spacing={1}>
              <Typography variant="subtitle1">Demo Notes</Typography>
              <Typography variant="body2" sx={{ color: '#d2def6' }}>
                No real charges.
              </Typography>
              <Typography variant="body2" sx={{ color: '#d2def6' }}>
                No real SMS.
              </Typography>
            </Stack>
          </Grid>
        </Grid>
        <Typography variant="caption" sx={{ display: 'block', mt: 4, color: '#a7bbdf' }}>
          Built for portfolio use. {new Date().getFullYear()} Soren Store.
        </Typography>
      </Container>
    </Box>
  );
}
