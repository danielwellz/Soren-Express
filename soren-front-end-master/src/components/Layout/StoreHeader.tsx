import {
  AppBar,
  Autocomplete,
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
  TextField,
  Toolbar,
  Typography,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import ShoppingCartOutlinedIcon from '@mui/icons-material/ShoppingCartOutlined';
import MenuIcon from '@mui/icons-material/Menu';
import DarkModeOutlinedIcon from '@mui/icons-material/DarkModeOutlined';
import LightModeOutlinedIcon from '@mui/icons-material/LightModeOutlined';
import FavoriteBorderRoundedIcon from '@mui/icons-material/FavoriteBorderRounded';
import CompareArrowsRoundedIcon from '@mui/icons-material/CompareArrowsRounded';
import LanguageRoundedIcon from '@mui/icons-material/LanguageRounded';
import React, { useEffect, useMemo, useState } from 'react';
import { Link as RouterLink, NavLink, useNavigate } from 'react-router-dom';
import { useLazyQuery, useQuery } from '@apollo/client';
import { useTranslation } from 'react-i18next';
import { CART_QUERY, PRODUCTS_QUERY } from '../../graphql/documents';
import { useAuth } from '../../context/AuthContext';
import { useLocale } from '../../context/LocaleContext';
import { useThemeMode } from '../../context/ThemeModeContext';
import { onMiniCartOpen } from '../../lib/cartDrawerEvents';
import { getSessionId } from '../../lib/session';
import { MiniCartDrawer } from '../Cart/MiniCartDrawer';

type NavItem = {
  label: string;
  path: string;
};

type SearchOption = {
  id: number;
  label: string;
  subtitle?: string;
};

const navButtonSx = {
  color: 'text.primary',
  fontWeight: 700,
  borderRadius: 999,
  px: 1.4,
  minHeight: 38,
  '&.active': {
    color: 'primary.main',
    backgroundColor: 'action.selected',
  },
};

export function Header() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const { mode, toggleMode } = useThemeMode();
  const { language, direction, setLanguage } = useLocale();

  const [mobileOpen, setMobileOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [searchInput, setSearchInput] = useState('');

  const [fetchSuggestions, { data: suggestionsData }] = useLazyQuery(PRODUCTS_QUERY, {
    fetchPolicy: 'network-only',
  });

  const { data } = useQuery(CART_QUERY, {
    variables: { context: { sessionId: getSessionId() } },
  });

  useEffect(() => {
    const cleanup = onMiniCartOpen(() => {
      setCartOpen(true);
    });

    return cleanup;
  }, []);

  useEffect(() => {
    const normalized = searchInput.trim();

    if (normalized.length < 2) {
      return;
    }

    const timeout = window.setTimeout(() => {
      void fetchSuggestions({
        variables: {
          filter: {
            search: normalized,
          },
          pagination: {
            page: 1,
            pageSize: 6,
          },
          sort: {
            field: 'name',
            direction: 'ASC',
          },
        },
      });
    }, 220);

    return () => {
      window.clearTimeout(timeout);
    };
  }, [fetchSuggestions, searchInput]);

  const links = useMemo<NavItem[]>(() => {
    const baseItems: NavItem[] = [
      { label: t('nav.home'), path: '/' },
      { label: t('nav.products'), path: '/products' },
      { label: t('nav.wishlist'), path: '/wishlist' },
      { label: t('nav.compare'), path: '/compare' },
      { label: t('nav.account'), path: '/account' },
    ];

    if (isAdmin) {
      baseItems.push({ label: t('nav.admin'), path: '/admin' });
    }

    return baseItems;
  }, [isAdmin, t]);

  const itemCount = (data?.cart?.items || []).reduce(
    (sum: number, item: { quantity: number }) => sum + item.quantity,
    0,
  );

  const searchOptions: SearchOption[] = (suggestionsData?.products?.items || []).map((product: any) => ({
    id: Number(product.id),
    label: product.name,
    subtitle: product.brand?.name,
  }));

  return (
    <AppBar
      position="sticky"
      elevation={0}
      sx={{
        py: 0.8,
        borderBottom: '1px solid',
        borderColor: 'divider',
        backgroundColor: (theme) =>
          mode === 'dark'
            ? alpha(theme.palette.background.default, 0.82)
            : alpha(theme.palette.background.paper, 0.86),
        color: 'text.primary',
        backdropFilter: 'blur(12px)',
      }}
    >
      <Container maxWidth="xl">
        <Toolbar disableGutters sx={{ minHeight: { xs: 66, md: 74 }, gap: 1.2 }}>
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
                background: (theme) =>
                  `linear-gradient(135deg, ${theme.palette.primary.dark}, ${theme.palette.secondary.main})`,
                boxShadow: (theme) => `0 8px 18px ${alpha(theme.palette.primary.dark, 0.3)}`,
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
              {t('header.storeName')}
            </Typography>
          </Stack>

          <Stack
            direction="row"
            spacing={0.5}
            sx={{ ml: 1, display: { xs: 'none', lg: 'flex' }, flexShrink: 0 }}
          >
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

          <Box sx={{ display: { xs: 'none', md: 'block' }, flexGrow: 1, px: 1.2, maxWidth: 440 }}>
            <Autocomplete<SearchOption, false, false, false>
              size="small"
              options={searchOptions}
              noOptionsText={t('header.searchNoResults')}
              getOptionLabel={(option) => option.label}
              inputValue={searchInput}
              onInputChange={(_, value) => setSearchInput(value)}
              onChange={(_, value) => {
                if (!value?.id) {
                  return;
                }

                navigate(`/products/${value.id}`);
                setSearchInput('');
              }}
              renderOption={(props, option) => (
                <Box component="li" {...props} key={option.id}>
                  <Stack sx={{ minWidth: 0 }}>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {option.label}
                    </Typography>
                    {option.subtitle ? (
                      <Typography variant="caption" color="text.secondary">
                        {option.subtitle}
                      </Typography>
                    ) : null}
                  </Stack>
                </Box>
              )}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label={t('header.searchInputLabel')}
                  placeholder={t('header.searchPlaceholder')}
                  aria-label={t('header.searchInputLabel')}
                />
              )}
            />
          </Box>

          <Box sx={{ ml: 'auto', display: 'flex', alignItems: 'center', gap: 0.7 }}>
            <Button
              variant="outlined"
              size="small"
              startIcon={<LanguageRoundedIcon fontSize="small" />}
              aria-label={t('header.languageSwitcher')}
              onClick={() => {
                setLanguage(language === 'en' ? 'fa' : 'en');
              }}
              sx={{ minWidth: 0, px: 1.1, display: { xs: 'none', sm: 'inline-flex' } }}
            >
              {language.toUpperCase()}
            </Button>

            <IconButton
              aria-label={mode === 'dark' ? t('common.lightMode') : t('common.darkMode')}
              onClick={toggleMode}
              sx={{ border: '1px solid', borderColor: 'divider', bgcolor: 'background.paper' }}
            >
              {mode === 'dark' ? <LightModeOutlinedIcon /> : <DarkModeOutlinedIcon />}
            </IconButton>

            <IconButton
              aria-label={t('header.viewWishlist')}
              component={RouterLink}
              to="/wishlist"
              sx={{
                border: '1px solid',
                borderColor: 'divider',
                backgroundColor: 'background.paper',
                display: { xs: 'none', sm: 'inline-flex' },
              }}
            >
              <FavoriteBorderRoundedIcon />
            </IconButton>

            <IconButton
              aria-label={t('header.viewCompare')}
              component={RouterLink}
              to="/compare"
              sx={{
                border: '1px solid',
                borderColor: 'divider',
                backgroundColor: 'background.paper',
                display: { xs: 'none', sm: 'inline-flex' },
              }}
            >
              <CompareArrowsRoundedIcon />
            </IconButton>

            <IconButton
              aria-label={t('header.openCart')}
              onClick={() => setCartOpen(true)}
              sx={{ border: '1px solid', borderColor: 'divider', backgroundColor: 'background.paper' }}
            >
              <Badge badgeContent={itemCount} color="secondary">
                <ShoppingCartOutlinedIcon />
              </Badge>
            </IconButton>

            {!isAuthenticated ? (
              <>
                <Button
                  component={RouterLink}
                  to="/auth/login"
                  variant="text"
                  sx={{ color: 'text.primary', display: { xs: 'none', sm: 'inline-flex' } }}
                >
                  {t('nav.login')}
                </Button>
                <Button component={RouterLink} to="/auth/register" variant="contained" color="primary">
                  {t('nav.register')}
                </Button>
              </>
            ) : (
              <>
                <Typography
                  variant="body2"
                  sx={{ display: { xs: 'none', xl: 'block' }, color: 'text.secondary', mr: 0.4 }}
                >
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
                  {t('nav.logout')}
                </Button>
              </>
            )}

            <IconButton
              sx={{ display: { md: 'none' }, border: '1px solid', borderColor: 'divider' }}
              aria-label={t('header.openMenu')}
              onClick={() => setMobileOpen(true)}
            >
              <MenuIcon />
            </IconButton>
          </Box>
        </Toolbar>
      </Container>

      <MiniCartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />

      <Drawer
        anchor={direction === 'rtl' ? 'left' : 'right'}
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
      >
        <Box sx={{ width: 300, p: 2 }}>
          <Typography variant="h6" sx={{ mb: 1.2 }}>
            {t('common.menu')}
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
          <Stack spacing={1}>
            <Button
              variant="outlined"
              startIcon={<LanguageRoundedIcon fontSize="small" />}
              onClick={() => {
                setLanguage(language === 'en' ? 'fa' : 'en');
              }}
            >
              {language.toUpperCase()}
            </Button>

            {!isAuthenticated ? (
              <>
                <Button component={RouterLink} to="/auth/login" onClick={() => setMobileOpen(false)}>
                  {t('nav.login')}
                </Button>
                <Button
                  component={RouterLink}
                  to="/auth/register"
                  variant="contained"
                  onClick={() => setMobileOpen(false)}
                >
                  {t('nav.register')}
                </Button>
              </>
            ) : (
              <Button
                variant="outlined"
                onClick={() => {
                  logout();
                  setMobileOpen(false);
                  navigate('/');
                }}
              >
                {t('nav.logout')}
              </Button>
            )}
          </Stack>
        </Box>
      </Drawer>
    </AppBar>
  );
}
