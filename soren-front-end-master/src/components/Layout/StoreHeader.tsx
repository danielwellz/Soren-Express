import {
  AppBar,
  Badge,
  Box,
  Button,
  Container,
  Divider,
  Drawer,
  IconButton,
  List,
  ListItemButton,
  ListItemText,
  Stack,
  Toolbar,
  Typography,
} from '@mui/material';
import ShoppingCartOutlinedIcon from '@mui/icons-material/ShoppingCartOutlined';
import MenuIcon from '@mui/icons-material/Menu';
import DarkModeOutlinedIcon from '@mui/icons-material/DarkModeOutlined';
import LightModeOutlinedIcon from '@mui/icons-material/LightModeOutlined';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import { motion } from 'framer-motion';
import React, { useState } from 'react';
import { Link as RouterLink, NavLink, useNavigate } from 'react-router-dom';
import { useQuery } from '@apollo/client';
import { CART_QUERY } from '../../graphql/documents';
import { getSessionId } from '../../lib/session';
import { useAuth } from '../../context/AuthContext';
import { useThemeMode } from '../../context/ThemeModeContext';

function navItems(isAdmin: boolean) {
  const base = [
    { label: 'Home', path: '/' },
    { label: 'Products', path: '/products' },
    { label: 'Account', path: '/account' },
  ];

  if (isAdmin) {
    base.push({ label: 'Admin', path: '/admin' });
  }

  return base;
}

const navButtonSx = {
  color: 'text.primary',
  fontWeight: 700,
  borderRadius: 999,
  px: 1.6,
  minHeight: 38,
  '&.active': {
    color: 'primary.main',
    backgroundColor: 'action.selected',
  },
};

export function Header() {
  const navigate = useNavigate();
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const { mode, toggleMode } = useThemeMode();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);

  const { data } = useQuery(CART_QUERY, {
    variables: { context: { sessionId: getSessionId() } },
  });

  const itemCount = (data?.cart?.items || []).reduce(
    (sum: number, item: { quantity: number }) => sum + item.quantity,
    0,
  );
  const cartItems = data?.cart?.items || [];
  const subtotal = cartItems.reduce(
    (sum: number, item: { quantity: number; unitPrice: number }) =>
      sum + Number(item.unitPrice) * item.quantity,
    0,
  );

  const links = navItems(isAdmin);

  return (
    <AppBar
      position="sticky"
      elevation={0}
      sx={{
        py: 0.8,
        borderBottom: '1px solid',
        borderColor: 'divider',
        backgroundColor: mode === 'dark' ? 'rgba(9, 17, 32, 0.86)' : 'rgba(255, 255, 255, 0.82)',
        color: 'text.primary',
        backdropFilter: 'blur(12px)',
      }}
    >
      <Container maxWidth="xl">
        <Toolbar disableGutters sx={{ minHeight: { xs: 66, md: 72 }, gap: 1.5 }}>
          <Stack
            component={RouterLink}
            to="/"
            direction="row"
            alignItems="center"
            spacing={1.2}
            sx={{ textDecoration: 'none', color: 'inherit', minWidth: 'max-content' }}
          >
            <Box
              sx={{
                width: 34,
                height: 34,
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #0b2447, #00a6a6)',
                boxShadow: '0 8px 18px rgba(11, 36, 71, 0.22)',
              }}
            />
            <Typography
              variant="h6"
              sx={{
                fontWeight: 800,
                letterSpacing: -0.3,
                display: { xs: 'none', sm: 'block' },
              }}
            >
              Soren Store
            </Typography>
          </Stack>

          <Stack direction="row" spacing={0.6} sx={{ ml: 1, display: { xs: 'none', md: 'flex' } }}>
            {links.map((item) => (
              <Button
                key={item.path}
                component={NavLink}
                to={item.path}
                end={item.path === '/'}
                sx={navButtonSx}
              >
                {item.label}
              </Button>
            ))}
          </Stack>

          <Box sx={{ ml: 'auto', display: 'flex', alignItems: 'center', gap: 0.8 }}>
            <IconButton
              aria-label={mode === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
              onClick={toggleMode}
              sx={{
                border: '1px solid',
                borderColor: 'divider',
                backgroundColor: 'background.paper',
                '&:hover': { backgroundColor: 'action.hover' },
              }}
            >
              {mode === 'dark' ? <LightModeOutlinedIcon /> : <DarkModeOutlinedIcon />}
            </IconButton>

            <IconButton
              aria-label="Open cart preview"
              onClick={() => setCartOpen(true)}
              sx={{
                border: '1px solid',
                borderColor: 'divider',
                backgroundColor: 'background.paper',
                '&:hover': { backgroundColor: 'action.hover' },
              }}
            >
              <Badge badgeContent={itemCount} color="secondary">
                <ShoppingCartOutlinedIcon />
              </Badge>
            </IconButton>

            {!isAuthenticated ? (
              <>
                <Button component={RouterLink} to="/auth/login" variant="text" sx={{ color: 'text.primary', display: { xs: 'none', sm: 'inline-flex' } }}>
                  Login
                </Button>
                <Button component={RouterLink} to="/auth/register" variant="contained" color="primary">
                  Register
                </Button>
              </>
            ) : (
              <>
                <Typography variant="body2" sx={{ display: { xs: 'none', lg: 'block' }, color: 'text.secondary', mr: 0.4 }}>
                  {user?.fullName}
                </Typography>
                <Button
                  variant="outlined"
                  color="primary"
                  sx={{ display: { xs: 'none', sm: 'inline-flex' } }}
                  onClick={() => {
                    logout();
                    navigate('/');
                  }}
                >
                  Sign out
                </Button>
              </>
            )}

            <IconButton
              sx={{ display: { md: 'none' }, border: '1px solid', borderColor: 'divider' }}
              aria-label="menu"
              onClick={() => setMobileOpen(true)}
            >
              <MenuIcon />
            </IconButton>
          </Box>
        </Toolbar>
      </Container>

      <Drawer anchor="right" open={cartOpen} onClose={() => setCartOpen(false)}>
        <Box sx={{ width: { xs: 320, sm: 390 }, p: 2 }}>
          <Box
            component={motion.div}
            initial={{ opacity: 0, x: 22 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.24, ease: 'easeOut' }}
          >
            <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1.2 }}>
              <Typography variant="h6">Cart preview</Typography>
              <IconButton
                aria-label="Close cart preview"
                onClick={() => setCartOpen(false)}
                size="small"
              >
                <CloseRoundedIcon fontSize="small" />
              </IconButton>
            </Stack>

            {cartItems.length === 0 ? (
              <Stack spacing={1.2} sx={{ py: 2.5 }}>
                <Typography color="text.secondary">Your cart is empty.</Typography>
                <Button
                  variant="contained"
                  onClick={() => {
                    setCartOpen(false);
                    navigate('/products');
                  }}
                >
                  Browse products
                </Button>
              </Stack>
            ) : (
              <>
                <Stack spacing={1} sx={{ maxHeight: '50vh', overflowY: 'auto', pr: 0.4 }}>
                  {cartItems.slice(0, 6).map((item: any, index: number) => (
                    <Box
                      component={motion.div}
                      key={item.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.2, delay: index * 0.03, ease: 'easeOut' }}
                      sx={{
                        p: 1.2,
                        borderRadius: 1.8,
                        border: '1px solid',
                        borderColor: 'divider',
                        bgcolor: 'background.paper',
                      }}
                    >
                      <Stack direction="row" spacing={1.2}>
                        <Box
                          component="img"
                          src={item.variant?.product?.thumbnail || '/images/150x150.png'}
                          alt={item.variant?.product?.name}
                          sx={{ width: 56, height: 56, borderRadius: 1, objectFit: 'cover' }}
                        />
                        <Box sx={{ minWidth: 0 }}>
                          <Typography
                            variant="body2"
                            sx={{
                              fontWeight: 700,
                              lineHeight: 1.3,
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                            }}
                          >
                            {item.variant?.product?.name}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            Qty {item.quantity} • ${Number(item.unitPrice).toFixed(2)}
                          </Typography>
                        </Box>
                      </Stack>
                    </Box>
                  ))}
                </Stack>
                <Divider sx={{ my: 1.4 }} />
                <Stack spacing={1.2}>
                  <Stack direction="row" justifyContent="space-between">
                    <Typography color="text.secondary">Subtotal</Typography>
                    <Typography sx={{ fontWeight: 700 }}>${subtotal.toFixed(2)}</Typography>
                  </Stack>
                  <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
                    <Button
                      fullWidth
                      variant="outlined"
                      onClick={() => {
                        setCartOpen(false);
                        navigate('/cart');
                      }}
                    >
                      Go to cart
                    </Button>
                    <Button
                      fullWidth
                      variant="contained"
                      onClick={() => {
                        setCartOpen(false);
                        navigate('/checkout');
                      }}
                    >
                      Checkout
                    </Button>
                  </Stack>
                </Stack>
              </>
            )}
          </Box>
        </Box>
      </Drawer>

      <Drawer anchor="right" open={mobileOpen} onClose={() => setMobileOpen(false)}>
        <Box sx={{ width: 280, p: 2 }}>
          <Typography variant="h6" sx={{ mb: 1.2 }}>
            Menu
          </Typography>
          <List>
            {links.map((item) => (
              <ListItemButton
                key={item.path}
                component={RouterLink}
                to={item.path}
                onClick={() => setMobileOpen(false)}
              >
                <ListItemText primary={item.label} />
              </ListItemButton>
            ))}
          </List>
          <Divider sx={{ my: 1.5 }} />
          {!isAuthenticated ? (
            <Stack spacing={1}>
              <Button component={RouterLink} to="/auth/login" onClick={() => setMobileOpen(false)}>
                Login
              </Button>
              <Button component={RouterLink} to="/auth/register" variant="contained" onClick={() => setMobileOpen(false)}>
                Register
              </Button>
            </Stack>
          ) : (
            <Button
              variant="outlined"
              onClick={() => {
                logout();
                setMobileOpen(false);
                navigate('/');
              }}
            >
              Sign out
            </Button>
          )}
        </Box>
      </Drawer>
    </AppBar>
  );
}
