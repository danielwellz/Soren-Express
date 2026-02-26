import { useMutation, useQuery } from '@apollo/client';
import {
  Box,
  Button,
  Card,
  CardContent,
  Container,
  Divider,
  Grid,
  IconButton,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import React, { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { EmptyState } from '../components/common/EmptyState';
import { ProductCard } from '../components/common/ProductCard';
import {
  APPLY_CART_PROMO_MUTATION,
  CART_QUERY,
  CHECKOUT_PREVIEW_QUERY,
  FEATURED_PRODUCTS_QUERY,
  REMOVE_CART_PROMO_MUTATION,
  REMOVE_CART_ITEM_MUTATION,
  SHIPPING_ESTIMATE_QUERY,
  UPDATE_CART_ITEM_MUTATION,
} from '../graphql/documents';
import { useMutationAction } from '../hooks/useMutationAction';
import { useLocaleFormatters } from '../hooks/useLocaleFormatters';
import { useRecentlyViewed } from '../hooks/useRecentlyViewed';
import { getSessionId } from '../lib/session';

export function CartPage() {
  const { t } = useTranslation();
  const runMutation = useMutationAction();
  const navigate = useNavigate();
  const sessionId = getSessionId();
  const { formatCurrency } = useLocaleFormatters();
  const { items: recentlyViewed } = useRecentlyViewed();
  const [promoCode, setPromoCode] = useState('');
  const shippingRegion = 'US-DEFAULT';

  const { data, loading, error, refetch } = useQuery(CART_QUERY, {
    variables: { context: { sessionId } },
  });

  const { data: featuredData } = useQuery(FEATURED_PRODUCTS_QUERY);

  const [updateItem, { loading: updating }] = useMutation(UPDATE_CART_ITEM_MUTATION, {
    refetchQueries: [{ query: CART_QUERY, variables: { context: { sessionId } } }],
  });

  const [removeItem, { loading: removing }] = useMutation(REMOVE_CART_ITEM_MUTATION, {
    refetchQueries: [{ query: CART_QUERY, variables: { context: { sessionId } } }],
  });

  const [applyPromo, { loading: applyingPromo }] = useMutation(APPLY_CART_PROMO_MUTATION, {
    refetchQueries: [{ query: CART_QUERY, variables: { context: { sessionId } } }],
  });

  const [removePromo, { loading: removingPromo }] = useMutation(REMOVE_CART_PROMO_MUTATION, {
    refetchQueries: [{ query: CART_QUERY, variables: { context: { sessionId } } }],
  });

  const items = data?.cart?.items || [];

  const subtotal = items.reduce(
    (sum: number, item: { unitPrice: number; quantity: number }) =>
      sum + Number(item.unitPrice) * item.quantity,
    0,
  );

  const activePromoCode = data?.cart?.promoCode || '';

  useEffect(() => {
    setPromoCode(activePromoCode);
  }, [activePromoCode]);

  const { data: totalsData } = useQuery(CHECKOUT_PREVIEW_QUERY, {
    variables: {
      input: {
        region: shippingRegion,
        couponCode: activePromoCode || undefined,
        sessionId,
      },
    },
    skip: !items.length,
  });

  const { data: shippingEstimateData } = useQuery(SHIPPING_ESTIMATE_QUERY, {
    variables: {
      input: {
        region: shippingRegion,
        subtotal,
      },
    },
    skip: !items.length,
  });

  const totals = totalsData?.checkoutPreview?.totals;
  const shippingEstimate = shippingEstimateData?.shippingEstimate;
  const freeShippingHint = useMemo(() => {
    if (!shippingEstimate) {
      return '';
    }
    if (shippingEstimate.eligibleForFreeShipping) {
      return t('cart.freeShippingHint', {
        amount: formatCurrency(Number(shippingEstimate.freeShippingOver || 0)),
      });
    }
    return t('cart.thresholdHint', {
      amount: formatCurrency(Number(shippingEstimate.remainingForFreeShipping || 0)),
    });
  }, [formatCurrency, shippingEstimate, t]);

  const cartProductIds = new Set(
    items.map((item: { variant?: { product?: { id?: number } } }) => item.variant?.product?.id),
  );

  const recommendations = (featuredData?.featuredProducts || [])
    .filter((product: { id: number }) => !cartProductIds.has(product.id))
    .slice(0, 4);

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 5 }}>
        <Typography>{t('common.loading')}</Typography>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ py: 5 }}>
        <EmptyState
          title={t('common.somethingWentWrong')}
          description={t('errors.network')}
          actionLabel={t('common.retry')}
          onAction={() => {
            void refetch();
          }}
        />
      </Container>
    );
  }

  if (!items.length) {
    return (
      <Container maxWidth="lg" sx={{ py: 5 }}>
        <EmptyState
          title={t('cart.emptyTitle')}
          description={t('cart.emptyDescription')}
          actionLabel={t('common.browseProducts')}
          onAction={() => navigate('/products')}
        />
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: { xs: 3, md: 4 } }}>
      <Typography variant="h4" sx={{ mb: 2.5 }}>
        {t('cart.title')}
      </Typography>

      <Grid container spacing={2}>
        <Grid item xs={12} md={8}>
          <Stack spacing={1.5}>
            {items.map((item: any) => {
              const lineTotal = Number(item.unitPrice) * item.quantity;
              return (
                <Card
                  key={item.id}
                  className="surface-glass fade-in-up"
                  sx={{
                    transition: 'transform 170ms ease, box-shadow 170ms ease',
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      boxShadow: (theme) => `0 14px 24px ${alpha(theme.palette.primary.dark, 0.16)}`,
                    },
                  }}
                >
                  <CardContent>
                    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                      <Box
                        component="img"
                        src={item.variant?.product?.thumbnail || '/images/150x150.png'}
                        alt={item.variant?.product?.name}
                        sx={{ width: 100, height: 100, objectFit: 'cover', borderRadius: 1 }}
                      />
                      <Box sx={{ flexGrow: 1 }}>
                        <Typography variant="h6" component="p">
                          {item.variant?.product?.name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                          {item.variant?.color || t('common.defaultVariant')} / {item.variant?.size || t('common.oneSize')}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {t('productDetail.sku')}: {item.variant?.sku}
                        </Typography>
                      </Box>

                      <Stack direction="row" spacing={1} alignItems="center">
                        <TextField
                          type="number"
                          size="small"
                          label={t('common.quantity')}
                          inputProps={{ min: 1 }}
                          value={item.quantity}
                          onChange={(event) => {
                            const qty = Number(event.target.value);
                            if (!qty || qty < 1) {
                              return;
                            }

                            void runMutation(() =>
                              updateItem({
                                variables: {
                                  input: {
                                    cartItemId: Number(item.id),
                                    quantity: qty,
                                    sessionId,
                                  },
                                },
                              }),
                            );
                          }}
                        />
                        <Typography sx={{ minWidth: 88, textAlign: 'right' }}>
                          {formatCurrency(lineTotal)}
                        </Typography>
                        <IconButton
                          aria-label={t('common.remove')}
                          color="error"
                          disabled={removing}
                          onClick={() => {
                            void runMutation(
                              () =>
                                removeItem({
                                  variables: {
                                    input: {
                                      cartItemId: Number(item.id),
                                      sessionId,
                                    },
                                  },
                                }),
                              { successMessage: t('success.removedFromCart') },
                            );
                          }}
                        >
                          <DeleteOutlineIcon />
                        </IconButton>
                      </Stack>
                    </Stack>
                  </CardContent>
                </Card>
              );
            })}
          </Stack>

          {recommendations.length ? (
            <Box sx={{ mt: 4 }}>
              <Typography variant="h5" sx={{ mb: 1.8 }}>
                {t('cart.recommendations')}
              </Typography>
              <Grid container spacing={1.5}>
                {recommendations.map((product: any) => (
                  <Grid item key={product.id} xs={12} sm={6}>
                    <ProductCard product={product} />
                  </Grid>
                ))}
              </Grid>
            </Box>
          ) : null}
        </Grid>

        <Grid item xs={12} md={4}>
          <Card className="surface-glass" sx={{ position: 'sticky', top: 92 }}>
            <CardContent>
              <Typography variant="h6" component="p">
                {t('cart.summary')}
              </Typography>
              <Stack spacing={1} sx={{ mt: 1.5 }}>
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
                  <TextField
                    fullWidth
                    label={t('cart.promoLabel')}
                    value={promoCode}
                    onChange={(event) => setPromoCode(event.target.value.toUpperCase())}
                    size="small"
                  />
                  {activePromoCode ? (
                    <Button
                      variant="outlined"
                      color="warning"
                      disabled={removingPromo}
                      onClick={() => {
                        void runMutation(
                          () =>
                            removePromo({
                              variables: {
                                input: {
                                  sessionId,
                                },
                              },
                            }),
                          { successMessage: t('cart.promoRemoved') },
                        );
                      }}
                    >
                      {t('cart.removePromo')}
                    </Button>
                  ) : (
                    <Button
                      variant="outlined"
                      disabled={!promoCode.trim() || applyingPromo}
                      onClick={() => {
                        void runMutation(
                          () =>
                            applyPromo({
                              variables: {
                                input: {
                                  couponCode: promoCode.trim(),
                                  sessionId,
                                },
                              },
                            }),
                          {
                            successMessage: t('cart.promoApplied'),
                            errorMessage: t('cart.promoError'),
                          },
                        );
                      }}
                    >
                      {t('cart.applyPromo')}
                    </Button>
                  )}
                </Stack>

                {freeShippingHint ? (
                  <Typography variant="caption" color="text.secondary">
                    {freeShippingHint}
                  </Typography>
                ) : null}

                <Stack direction="row" justifyContent="space-between">
                  <Typography color="text.secondary">{t('common.subtotal')}</Typography>
                  <Typography>{formatCurrency(Number(totals?.subtotal ?? subtotal))}</Typography>
                </Stack>
                <Stack direction="row" justifyContent="space-between">
                  <Typography color="text.secondary">{t('common.discount')}</Typography>
                  <Typography>-{formatCurrency(Number(totals?.discount || 0))}</Typography>
                </Stack>
                <Stack direction="row" justifyContent="space-between">
                  <Typography color="text.secondary">{t('common.shipping')}</Typography>
                  <Typography>
                    {totals ? formatCurrency(Number(totals.shipping || 0)) : t('cart.shippingCalc')}
                  </Typography>
                </Stack>
                <Stack direction="row" justifyContent="space-between">
                  <Typography color="text.secondary">{t('common.tax')}</Typography>
                  <Typography>{totals ? formatCurrency(Number(totals.tax || 0)) : '-'}</Typography>
                </Stack>
              </Stack>

              <Divider sx={{ my: 1.5 }} />

              <Stack direction="row" justifyContent="space-between" sx={{ mb: 2 }}>
                <Typography variant="h6" component="p">
                  {t('common.estimatedTotal')}
                </Typography>
                <Typography variant="h6" component="p">
                  {formatCurrency(Number(totals?.total ?? subtotal))}
                </Typography>
              </Stack>

              <Button
                component={RouterLink}
                to="/checkout"
                variant="contained"
                fullWidth
                disabled={updating || removing}
              >
                {t('cart.checkout')}
              </Button>
            </CardContent>
          </Card>

          {recentlyViewed.length ? (
            <Box sx={{ mt: 2 }}>
              <Typography variant="subtitle1" component="p" sx={{ mb: 1.2 }}>
                {t('cart.recentlyViewed')}
              </Typography>
              <Stack spacing={1}>
                {recentlyViewed.slice(0, 3).map((item) => (
                  <Button
                    key={item.id}
                    component={RouterLink}
                    to={`/products/${item.id}`}
                    variant="outlined"
                    sx={{ justifyContent: 'space-between' }}
                  >
                    <span>{item.name}</span>
                    <span>{formatCurrency(Number(item.basePrice || 0))}</span>
                  </Button>
                ))}
              </Stack>
            </Box>
          ) : null}
        </Grid>
      </Grid>
    </Container>
  );
}
