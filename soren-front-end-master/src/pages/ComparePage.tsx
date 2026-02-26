import {
  Box,
  Button,
  Card,
  CardContent,
  Container,
  Grid,
  Stack,
  Typography,
} from '@mui/material';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { EmptyState } from '../components/common/EmptyState';
import { useCompare } from '../context/CompareContext';
import { useLocaleFormatters } from '../hooks/useLocaleFormatters';

export function ComparePage() {
  const { t } = useTranslation();
  const { items, clearCompare } = useCompare();
  const { formatCurrency } = useLocaleFormatters();

  const rows = [
    {
      key: 'price',
      label: t('compare.columns.price'),
      render: (item: any) => formatCurrency(Number(item.basePrice || 0)),
    },
    {
      key: 'brand',
      label: t('compare.columns.brand'),
      render: (item: any) => item.brand?.name || '-',
    },
    {
      key: 'category',
      label: t('compare.columns.category'),
      render: (item: any) => item.category?.name || '-',
    },
    {
      key: 'rating',
      label: t('compare.columns.rating'),
      render: (item: any) => Number(item.averageRating || 0).toFixed(1),
    },
    {
      key: 'availability',
      label: t('compare.columns.availability'),
      render: (item: any) =>
        item.variants?.some(
          (variant: any) => Number(variant.inventory?.quantity || 0) - Number(variant.inventory?.reserved || 0) > 0,
        )
          ? t('common.inStock')
          : t('common.outOfStock'),
    },
  ];

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" sx={{ mb: 2.5 }}>
        <Typography variant="h4">{t('compare.title')}</Typography>
        {items.length ? (
          <Button variant="outlined" onClick={clearCompare}>
            {t('compare.clear')}
          </Button>
        ) : null}
      </Stack>

      {!items.length ? (
        <EmptyState title={t('compare.emptyTitle')} description={t('compare.emptyDescription')} />
      ) : (
        <Card className="surface-glass">
          <CardContent>
            <Grid container spacing={1.5}>
              <Grid item xs={12} md={2.4}>
                <Stack spacing={1.4}>
                  <Box sx={{ minHeight: 62 }} />
                  {rows.map((row) => (
                    <Typography key={row.key} sx={{ fontWeight: 700 }}>
                      {row.label}
                    </Typography>
                  ))}
                </Stack>
              </Grid>
              {items.map((item) => (
                <Grid key={item.id} item xs={12} md>
                  <Stack spacing={1.4}>
                    <Typography variant="h6">{item.name}</Typography>
                    {rows.map((row) => (
                      <Typography key={row.key} color="text.secondary">
                        {row.render(item)}
                      </Typography>
                    ))}
                  </Stack>
                </Grid>
              ))}
            </Grid>
          </CardContent>
        </Card>
      )}
    </Container>
  );
}
