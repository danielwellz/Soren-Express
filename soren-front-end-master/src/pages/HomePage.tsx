import { useMutation, useQuery } from '@apollo/client';
import {
  Box,
  Button,
  Chip,
  Container,
  Grid,
  Stack,
  Typography,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link as RouterLink } from 'react-router-dom';
import { ProductCard } from '../components/common/ProductCard';
import { EmptyState } from '../components/common/EmptyState';
import { LoadingGrid } from '../components/common/LoadingGrid';
import {
  ADD_TO_CART_MUTATION,
  CART_QUERY,
  CATEGORIES_QUERY,
  FEATURED_PRODUCTS_QUERY,
} from '../graphql/documents';
import { useMutationAction } from '../hooks/useMutationAction';
import { useRecentlyViewed } from '../hooks/useRecentlyViewed';
import { useToast } from '../context/ToastContext';
import { getSessionId } from '../lib/session';

export function HomePage() {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const runMutation = useMutationAction();
  const { items: recentlyViewed } = useRecentlyViewed();
  const { data: categoryData } = useQuery(CATEGORIES_QUERY);
  const { data, loading } = useQuery(FEATURED_PRODUCTS_QUERY);

  const [addToCart] = useMutation(ADD_TO_CART_MUTATION, {
    refetchQueries: [{ query: CART_QUERY, variables: { context: { sessionId: getSessionId() } } }],
  });

  const featuredProducts = data?.featuredProducts || [];

  const showcaseFacts = [
    { label: t('home.facts.curated'), value: '50+' },
    { label: t('home.facts.checkout'), value: '< 60s' },
    { label: t('home.facts.rating'), value: '4.8/5' },
  ];

  return (
    <Container maxWidth="xl" sx={{ py: { xs: 3, md: 5 } }}>
      <Box
        className="fade-in-up"
        sx={{
          p: { xs: 3, md: 5 },
          borderRadius: 5,
          mb: 4,
          color: 'common.white',
          background: (theme) =>
            `linear-gradient(130deg, ${theme.palette.primary.dark} 0%, ${theme.palette.primary.main} 48%, ${theme.palette.secondary.main} 100%)`,
          boxShadow: (theme) => `0 26px 50px ${alpha(theme.palette.primary.dark, 0.34)}`,
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <Box
          sx={{
            position: 'absolute',
            right: -70,
            top: -70,
            width: 220,
            height: 220,
            borderRadius: '50%',
            background: (theme) =>
              `radial-gradient(circle, ${alpha(theme.palette.common.white, 0.18)} 0%, ${alpha(theme.palette.common.white, 0)} 70%)`,
          }}
        />
        <Typography variant="h3" sx={{ maxWidth: 650, lineHeight: 1.05, mb: 1.5 }}>
          {t('home.heroTitle')}
        </Typography>
        <Typography sx={{ maxWidth: 600, opacity: 0.92, mb: 3 }}>
          {t('home.heroSubtitle')}
        </Typography>
        <Stack direction="row" spacing={1.4} sx={{ mb: 3, flexWrap: 'wrap', gap: 1.2 }}>
          <Button component={RouterLink} to="/products" variant="contained" color="secondary" size="large">
            {t('home.shopNow')}
          </Button>
          <Button
            component={RouterLink}
            to="/admin"
            variant="outlined"
            sx={{ color: 'common.white', borderColor: (theme) => alpha(theme.palette.common.white, 0.9) }}
          >
            {t('home.adminView')}
          </Button>
        </Stack>

        <Grid container spacing={1.2} sx={{ maxWidth: 760 }}>
          {showcaseFacts.map((fact) => (
            <Grid item xs={12} sm={4} key={fact.label}>
              <Box
                sx={{
                  p: 1.5,
                  borderRadius: 2.5,
                  backgroundColor: (theme) => alpha(theme.palette.common.white, 0.14),
                  border: (theme) => `1px solid ${alpha(theme.palette.common.white, 0.2)}`,
                }}
              >
                <Typography variant="h5" component="p">
                  {fact.value}
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                  {fact.label}
                </Typography>
              </Box>
            </Grid>
          ))}
        </Grid>
      </Box>

      <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{ mb: 3 }}>
        {(categoryData?.categories || []).map((category: { id: number; name: string }) => (
          <Chip
            key={category.id}
            label={category.name}
            component={RouterLink}
            to={`/products?category=${category.id}`}
            clickable
            sx={{
              backgroundColor: 'background.paper',
              border: '1px solid',
              borderColor: 'divider',
              '&:hover': { backgroundColor: 'action.hover' },
            }}
          />
        ))}
      </Stack>

      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2.2 }}>
        <Typography variant="h5" component="h4">
          {t('home.featured')}
        </Typography>
        <Button component={RouterLink} to="/products">
          {t('home.browseAll')}
        </Button>
      </Stack>

      {loading ? <LoadingGrid count={8} /> : null}
      {!loading && !featuredProducts.length ? (
        <EmptyState title={t('home.noFeaturedTitle')} description={t('home.noFeaturedDescription')} />
      ) : null}

      {!loading && featuredProducts.length ? (
        <Grid container spacing={2.2}>
          {featuredProducts.map((product: any) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={product.id}>
              <ProductCard
                product={product}
                onAdd={() => {
                  const firstVariantId = product.variants?.[0]?.id;
                  if (!firstVariantId) {
                    showToast(t('common.notAvailable'), 'error');
                    return;
                  }

                  return runMutation(
                    () =>
                      addToCart({
                        variables: {
                          input: {
                            variantId: Number(firstVariantId),
                            quantity: 1,
                            sessionId: getSessionId(),
                          },
                        },
                      }),
                    { successMessage: t('success.addedToCart') },
                  );
                }}
              />
            </Grid>
          ))}
        </Grid>
      ) : null}

      {recentlyViewed.length ? (
        <Box sx={{ mt: 5 }}>
          <Typography variant="h5" sx={{ mb: 2 }}>
            {t('home.recentlyViewed')}
          </Typography>
          <Grid container spacing={2}>
            {recentlyViewed.slice(0, 4).map((product) => (
              <Grid key={product.id} item xs={12} sm={6} md={3}>
                <ProductCard product={product} />
              </Grid>
            ))}
          </Grid>
        </Box>
      ) : null}
    </Container>
  );
}
