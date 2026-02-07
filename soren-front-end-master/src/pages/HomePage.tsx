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
import React from 'react';
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
import { getSessionId } from '../lib/session';
import { useToast } from '../context/ToastContext';

const showcaseFacts = [
  { label: 'Curated picks', value: '50+' },
  { label: 'Fast checkout', value: '< 60s' },
  { label: 'User rating', value: '4.8/5' },
];

export function HomePage() {
  const { showToast } = useToast();
  const runMutation = useMutationAction();
  const { data: categoryData } = useQuery(CATEGORIES_QUERY);
  const { data, loading } = useQuery(FEATURED_PRODUCTS_QUERY);

  const [addToCart] = useMutation(ADD_TO_CART_MUTATION, {
    refetchQueries: [{ query: CART_QUERY, variables: { context: { sessionId: getSessionId() } } }],
  });

  const featuredProducts = data?.featuredProducts || [];

  return (
    <Container maxWidth="xl" sx={{ py: { xs: 3, md: 5 } }}>
      <Box
        className="fade-in-up"
        sx={{
          p: { xs: 3, md: 5 },
          borderRadius: 5,
          mb: 4,
          color: '#fff',
          background:
            'linear-gradient(130deg, #061329 0%, #0b2447 48%, #00a6a6 100%)',
          boxShadow: '0 26px 50px rgba(6, 19, 41, 0.3)',
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
            background: 'radial-gradient(circle, rgba(255,255,255,0.18) 0%, rgba(255,255,255,0) 70%)',
          }}
        />
        <Typography variant="h3" sx={{ maxWidth: 650, lineHeight: 1.05, mb: 1.5 }}>
          Build your dream setup with premium audio and smart tech
        </Typography>
        <Typography sx={{ maxWidth: 600, opacity: 0.92, mb: 3 }}>
          Explore top-rated gear, discover curated collections, and complete checkout in seconds with our streamlined storefront.
        </Typography>
        <Stack direction="row" spacing={1.4} sx={{ mb: 3, flexWrap: 'wrap', gap: 1.2 }}>
          <Button component={RouterLink} to="/products" variant="contained" color="secondary" size="large">
            Shop now
          </Button>
          <Button component={RouterLink} to="/admin" variant="outlined" sx={{ color: '#fff', borderColor: '#fff' }}>
            Admin view
          </Button>
        </Stack>

        <Grid container spacing={1.2} sx={{ maxWidth: 760 }}>
          {showcaseFacts.map((fact) => (
            <Grid item xs={12} sm={4} key={fact.label}>
              <Box
                sx={{
                  p: 1.5,
                  borderRadius: 2.5,
                  backgroundColor: 'rgba(255,255,255,0.14)',
                  border: '1px solid rgba(255,255,255,0.2)',
                }}
              >
                <Typography variant="h5" component="p">{fact.value}</Typography>
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
              backgroundColor: '#ffffff',
              border: '1px solid #d8e4f4',
              '&:hover': { backgroundColor: '#edf4ff' },
            }}
          />
        ))}
      </Stack>

      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2.2 }}>
        <Typography variant="h5" component="h4">Featured products</Typography>
        <Button component={RouterLink} to="/products">
          Browse all
        </Button>
      </Stack>

      {loading ? <LoadingGrid count={8} /> : null}
      {!loading && !featuredProducts.length ? (
        <EmptyState
          title="No featured products yet"
          description="Run the backend seed script to load a sample catalog."
        />
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
                    showToast('No variant available for this product', 'error');
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
                    { successMessage: 'Added to cart' },
                  );
                }}
              />
            </Grid>
          ))}
        </Grid>
      ) : null}
    </Container>
  );
}
