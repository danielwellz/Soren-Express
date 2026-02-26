import { useMutation, useQuery } from '@apollo/client';
import {
  Box,
  Button,
  Card,
  CardContent,
  Container,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Pagination,
  Select,
  Slider,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSearchParams } from 'react-router-dom';
import { ProductCard } from '../components/common/ProductCard';
import { EmptyState } from '../components/common/EmptyState';
import { LoadingGrid } from '../components/common/LoadingGrid';
import {
  ADD_TO_CART_MUTATION,
  BRANDS_QUERY,
  CART_QUERY,
  CATEGORIES_QUERY,
  PRODUCTS_QUERY,
} from '../graphql/documents';
import { useMutationAction } from '../hooks/useMutationAction';
import { useToast } from '../context/ToastContext';
import { getSessionId } from '../lib/session';

const DEFAULT_PRICE: [number, number] = [0, 2000];

export function ProductsPage() {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const runMutation = useMutationAction();
  const [params, setParams] = useSearchParams();

  const initialCategory = params.get('category') || '';

  const [search, setSearch] = useState(params.get('search') || '');
  const [categoryId, setCategoryId] = useState(initialCategory);
  const [brandId, setBrandId] = useState('');
  const [sortField, setSortField] = useState('createdAt');
  const [sortDirection, setSortDirection] = useState<'ASC' | 'DESC'>('DESC');
  const [priceRange, setPriceRange] = useState<[number, number]>(DEFAULT_PRICE);
  const [page, setPage] = useState(1);

  const { data: categoriesData } = useQuery(CATEGORIES_QUERY);
  const { data: brandsData } = useQuery(BRANDS_QUERY);

  const filter = useMemo(
    () => ({
      search: search || undefined,
      categoryIds: categoryId ? [Number(categoryId)] : undefined,
      brandIds: brandId ? [Number(brandId)] : undefined,
      minPrice: priceRange[0],
      maxPrice: priceRange[1],
      inStockOnly: false,
    }),
    [search, categoryId, brandId, priceRange],
  );

  const { data, loading, error, refetch } = useQuery(PRODUCTS_QUERY, {
    variables: {
      filter,
      pagination: {
        page,
        pageSize: 12,
      },
      sort: {
        field: sortField,
        direction: sortDirection,
      },
    },
  });

  const [addToCart] = useMutation(ADD_TO_CART_MUTATION, {
    refetchQueries: [{ query: CART_QUERY, variables: { context: { sessionId: getSessionId() } } }],
  });

  const products = data?.products?.items || [];
  const total = data?.products?.total || 0;
  const totalPages = Math.max(1, Math.ceil(total / 12));

  const runSearch = () => {
    const next = new URLSearchParams(params);
    if (search) {
      next.set('search', search);
    } else {
      next.delete('search');
    }
    if (categoryId) {
      next.set('category', categoryId);
    } else {
      next.delete('category');
    }
    setParams(next);
    setPage(1);
  };

  return (
    <Container maxWidth="xl" sx={{ py: { xs: 3, md: 4 } }}>
      <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" sx={{ mb: 2.5 }}>
        <Box>
          <Typography variant="h4">{t('products.title')}</Typography>
          <Typography color="text.secondary">{t('products.subtitle')}</Typography>
        </Box>
        <Typography variant="body2" color="text.secondary" sx={{ mt: { xs: 1, md: 0 } }}>
          {loading
            ? t('common.loading')
            : t('products.results', {
                count: total,
              })}
        </Typography>
      </Stack>

      <Card className="surface-glass" sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={1.5} alignItems="stretch">
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label={t('products.searchLabel')}
                placeholder={t('products.searchPlaceholder')}
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter') {
                    runSearch();
                  }
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={2}>
              <FormControl fullWidth>
                <InputLabel id="category-label">{t('products.category')}</InputLabel>
                <Select
                  labelId="category-label"
                  label={t('products.category')}
                  value={categoryId}
                  onChange={(event) => {
                    setCategoryId(event.target.value);
                    setPage(1);
                  }}
                >
                  <MenuItem value="">{t('common.all')}</MenuItem>
                  {(categoriesData?.categories || []).map((category: any) => (
                    <MenuItem key={category.id} value={String(category.id)}>
                      {category.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6} md={2}>
              <FormControl fullWidth>
                <InputLabel id="brand-label">{t('products.brand')}</InputLabel>
                <Select
                  labelId="brand-label"
                  label={t('products.brand')}
                  value={brandId}
                  onChange={(event) => {
                    setBrandId(event.target.value);
                    setPage(1);
                  }}
                >
                  <MenuItem value="">{t('common.all')}</MenuItem>
                  {(brandsData?.brands || []).map((brand: any) => (
                    <MenuItem key={brand.id} value={String(brand.id)}>
                      {brand.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6} md={2}>
              <FormControl fullWidth>
                <InputLabel id="sort-field-label">{t('products.sortBy')}</InputLabel>
                <Select
                  labelId="sort-field-label"
                  label={t('products.sortBy')}
                  value={sortField}
                  onChange={(event) => setSortField(event.target.value)}
                >
                  <MenuItem value="createdAt">{t('products.sort.newest')}</MenuItem>
                  <MenuItem value="price">{t('products.sort.price')}</MenuItem>
                  <MenuItem value="name">{t('products.sort.name')}</MenuItem>
                  <MenuItem value="rating">{t('products.sort.rating')}</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6} md={1}>
              <FormControl fullWidth>
                <InputLabel id="direction-label">{t('products.order')}</InputLabel>
                <Select
                  labelId="direction-label"
                  label={t('products.order')}
                  value={sortDirection}
                  onChange={(event) => setSortDirection(event.target.value as 'ASC' | 'DESC')}
                >
                  <MenuItem value="ASC">{t('products.sort.asc')}</MenuItem>
                  <MenuItem value="DESC">{t('products.sort.desc')}</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={1}>
              <Button fullWidth variant="contained" onClick={runSearch} sx={{ height: '100%' }}>
                {t('common.apply')}
              </Button>
            </Grid>
          </Grid>

          <Box sx={{ px: 1, mt: 2.5 }}>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              {t('products.priceRange')} ({priceRange[0]} - {priceRange[1]})
            </Typography>
            <Slider
              aria-label={t('products.priceRange')}
              min={0}
              max={2000}
              step={25}
              value={priceRange}
              onChange={(_, value) => setPriceRange(value as [number, number])}
              valueLabelDisplay="auto"
            />
          </Box>
        </CardContent>
      </Card>

      {loading ? <LoadingGrid count={8} /> : null}
      {error ? (
        <EmptyState
          title={t('products.loadErrorTitle')}
          description={t('products.loadErrorDescription')}
          actionLabel={t('common.retry')}
          onAction={() => {
            void refetch();
          }}
        />
      ) : null}

      {!loading && !error && !products.length ? (
        <EmptyState title={t('products.emptyTitle')} description={t('products.emptyDescription')} />
      ) : null}

      {!loading && !error && products.length ? (
        <>
          <Grid container spacing={2.2}>
            {products.map((product: any) => (
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

          <Stack alignItems="center" sx={{ mt: 4.5 }}>
            <Pagination page={page} count={totalPages} color="primary" onChange={(_, value) => setPage(value)} />
          </Stack>
        </>
      ) : null}
    </Container>
  );
}
