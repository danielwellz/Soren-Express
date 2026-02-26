import { Container, Grid, Typography } from '@mui/material';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { EmptyState } from '../components/common/EmptyState';
import { ProductCard } from '../components/common/ProductCard';
import { useWishlist } from '../context/WishlistContext';

export function WishlistPage() {
  const { t } = useTranslation();
  const { items, loading } = useWishlist();

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" sx={{ mb: 2.5 }}>
        {t('wishlist.title')}
      </Typography>

      {loading ? (
        <Typography color="text.secondary">{t('common.loading')}</Typography>
      ) : null}

      {!loading && !items.length ? (
        <EmptyState title={t('wishlist.emptyTitle')} description={t('wishlist.emptyDescription')} />
      ) : null}

      {!loading && items.length ? (
        <Grid container spacing={2}>
          {items.map((product) => (
            <Grid key={product.id} item xs={12} sm={6} md={4}>
              <ProductCard product={product} />
            </Grid>
          ))}
        </Grid>
      ) : null}
    </Container>
  );
}
