import { useMutation, useQuery } from '@apollo/client';
import {
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Container,
  Dialog,
  DialogContent,
  DialogTitle,
  Divider,
  Grid,
  IconButton,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Rating,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import FavoriteBorderRoundedIcon from '@mui/icons-material/FavoriteBorderRounded';
import FavoriteRoundedIcon from '@mui/icons-material/FavoriteRounded';
import CompareArrowsRoundedIcon from '@mui/icons-material/CompareArrowsRounded';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import RemoveRoundedIcon from '@mui/icons-material/RemoveRounded';
import FullscreenRoundedIcon from '@mui/icons-material/FullscreenRounded';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import { visuallyHidden } from '@mui/utils';
import { motion, useReducedMotion } from 'framer-motion';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link as RouterLink, useNavigate, useParams } from 'react-router-dom';
import { EmptyState } from '../components/common/EmptyState';
import { LoadingGrid } from '../components/common/LoadingGrid';
import { useAnalytics } from '../context/AnalyticsContext';
import { useAuth } from '../context/AuthContext';
import { useCompare } from '../context/CompareContext';
import { useWishlist } from '../context/WishlistContext';
import {
  ADD_TO_CART_MUTATION,
  CART_QUERY,
  CREATE_REVIEW_MUTATION,
  PRODUCT_QUERY,
  REVIEWS_QUERY,
  SHIPPING_ESTIMATE_QUERY,
  SUBSCRIBE_BACK_IN_STOCK_MUTATION,
} from '../graphql/documents';
import { useMutationAction } from '../hooks/useMutationAction';
import { useLocaleFormatters } from '../hooks/useLocaleFormatters';
import { emitOpenMiniCart } from '../lib/cartDrawerEvents';
import { pushRecentlyViewed } from '../lib/recentlyViewed';
import { getSessionId } from '../lib/session';

function formatVariantLabel(
  variant: { color?: string; size?: string },
  defaultLabel: string,
  oneSizeLabel: string,
): string {
  return [variant.color || defaultLabel, variant.size || oneSizeLabel].join(' / ');
}

export function ProductDetailPage() {
  const { id } = useParams();
  const { t } = useTranslation();
  const { formatCurrency, formatDateTime } = useLocaleFormatters();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const runMutation = useMutationAction();
  const reducedMotion = useReducedMotion();
  const addToCartRef = useRef<HTMLButtonElement | null>(null);
  const { trackEvent } = useAnalytics();
  const { toggleWishlist, hasInWishlist } = useWishlist();
  const { toggleCompare, hasInCompare } = useCompare();

  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [selectedVariantId, setSelectedVariantId] = useState<number | null>(null);
  const [reviewRating, setReviewRating] = useState<number | null>(5);
  const [reviewComment, setReviewComment] = useState('');
  const [fullscreenOpen, setFullscreenOpen] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [showStickyBar, setShowStickyBar] = useState(false);
  const [notifyEmail, setNotifyEmail] = useState('');
  const [sizeGuideOpen, setSizeGuideOpen] = useState(false);

  const { data, loading, error } = useQuery(PRODUCT_QUERY, {
    variables: {
      id: Number(id),
      sessionId: getSessionId(),
    },
    skip: !id,
  });

  const product = data?.product;

  const { data: reviewsData, refetch: refetchReviews } = useQuery(REVIEWS_QUERY, {
    variables: {
      filter: {
        productId: Number(id),
      },
    },
    skip: !id,
  });

  const [addToCart] = useMutation(ADD_TO_CART_MUTATION, {
    refetchQueries: [{ query: CART_QUERY, variables: { context: { sessionId: getSessionId() } } }],
  });

  const [createReview, { loading: creatingReview }] = useMutation(CREATE_REVIEW_MUTATION);
  const [subscribeBackInStock, { loading: subscribingBackInStock }] = useMutation(
    SUBSCRIBE_BACK_IN_STOCK_MUTATION,
  );

  const { data: shippingEstimateData } = useQuery(SHIPPING_ESTIMATE_QUERY, {
    variables: {
      input: {
        region: 'US-DEFAULT',
        subtotal: Number(product?.basePrice || 0),
      },
    },
    skip: !product,
  });

  const gallery = useMemo(() => {
    if (!product) {
      return [] as string[];
    }
    return [product.thumbnail, ...(product.galleryUrls || [])].filter(Boolean);
  }, [product]);

  const activeImage = gallery[selectedImageIndex] || '/images/150x150.png';

  useEffect(() => {
    setSelectedImageIndex(0);
  }, [product?.id]);

  useEffect(() => {
    if (!product) {
      return;
    }

    pushRecentlyViewed({
      id: Number(product.id),
      name: product.name,
      basePrice: Number(product.basePrice || 0),
      thumbnail: product.thumbnail,
      brand: product.brand,
      category: product.category,
      variants: product.variants,
    });
  }, [product]);

  useEffect(() => {
    if (!addToCartRef.current) {
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        setShowStickyBar(!entry.isIntersecting);
      },
      { threshold: 0.2 },
    );

    observer.observe(addToCartRef.current);

    return () => {
      observer.disconnect();
    };
  }, [addToCartRef, product?.id]);

  const selectImageByIndex = useCallback(
    (nextIndex: number) => {
      if (!gallery.length) {
        setSelectedImageIndex(0);
        return;
      }
      const bounded = Math.max(0, Math.min(nextIndex, gallery.length - 1));
      setSelectedImageIndex(bounded);
    },
    [gallery],
  );

  const handleGalleryKeyDown = (event: React.KeyboardEvent) => {
    if (!gallery.length) {
      return;
    }

    if (event.key === 'ArrowRight' || event.key === 'ArrowDown') {
      event.preventDefault();
      selectImageByIndex((selectedImageIndex + 1) % gallery.length);
    }

    if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') {
      event.preventDefault();
      selectImageByIndex((selectedImageIndex - 1 + gallery.length) % gallery.length);
    }

    if (event.key === 'Home') {
      event.preventDefault();
      selectImageByIndex(0);
    }

    if (event.key === 'End') {
      event.preventDefault();
      selectImageByIndex(gallery.length - 1);
    }
  };

  const selectedVariant = useMemo(() => {
    if (!product?.variants?.length) {
      return null;
    }

    if (!selectedVariantId) {
      return product.variants[0];
    }

    return product.variants.find((variant: any) => variant.id === selectedVariantId) || product.variants[0];
  }, [product, selectedVariantId]);

  const inStock = (() => {
    if (!selectedVariant?.inventory) {
      return false;
    }
    return selectedVariant.inventory.quantity - selectedVariant.inventory.reserved > 0;
  })();

  const hasSizeChart = (product?.variants || []).some(
    (variant: any) => variant.size && !/one size/i.test(String(variant.size)),
  );

  const toggleWishlistAction = () => {
    if (!product) {
      return;
    }

    toggleWishlist({
      id: Number(product.id),
      name: product.name,
      basePrice: Number(product.basePrice || 0),
      thumbnail: product.thumbnail,
      brand: product.brand,
      category: product.category,
      variants: product.variants,
    });
  };

  const toggleCompareAction = () => {
    if (!product) {
      return;
    }

    toggleCompare({
      id: Number(product.id),
      name: product.name,
      basePrice: Number(product.basePrice || 0),
      thumbnail: product.thumbnail,
      brand: product.brand,
      category: product.category,
      variants: product.variants,
    });
  };

  const handleAddToCart = () => {
    if (!selectedVariant?.id) {
      return;
    }
    const variantId = Number(selectedVariant.id);

    return runMutation(
      () =>
        addToCart({
          variables: {
            input: {
              variantId,
              quantity: 1,
              sessionId: getSessionId(),
            },
          },
        }),
      { successMessage: t('success.addedToCart') },
    ).then((result) => {
      if (result) {
        emitOpenMiniCart();
        void trackEvent('add_to_cart', {
          productId: Number(product.id),
          productName: product.name,
          variantId,
        });
      }
      return result;
    });
  };

  if (loading) {
    return (
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <LoadingGrid count={4} />
      </Container>
    );
  }

  if (error || !product) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <EmptyState
          title={t('errors.notFound')}
          description={t('common.notAvailable')}
          actionLabel={t('common.back')}
          onAction={() => navigate(-1)}
        />
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: { xs: 3, md: 4 }, pb: { xs: 11, md: 4 } }}>
      <Grid container spacing={3.2}>
        <Grid item xs={12} md={6}>
          <Card className="surface-glass">
            <Box sx={{ position: 'relative' }}>
              <Box
                component="img"
                src={activeImage}
                alt={product.name}
                sx={{ width: '100%', height: { xs: 320, md: 500 }, objectFit: 'cover', borderRadius: 2 }}
              />
              <IconButton
                aria-label={t('productDetail.openFullscreen')}
                onClick={() => {
                  setFullscreenOpen(true);
                  setZoom(1);
                }}
                sx={{
                  position: 'absolute',
                  top: 12,
                  right: 12,
                  bgcolor: (theme) => alpha(theme.palette.common.white, 0.86),
                }}
              >
                <FullscreenRoundedIcon />
              </IconButton>
            </Box>
          </Card>
          <Stack
            direction="row"
            spacing={1}
            sx={{ mt: 1.5, overflowX: 'auto' }}
            role="group"
            aria-label={t('productDetail.galleryAria', { name: product.name })}
            onKeyDown={handleGalleryKeyDown}
          >
            {gallery.map((image: string, index: number) => {
              const isActive = index === selectedImageIndex;
              return (
                <Box
                  key={`${image}-${index}`}
                  component="button"
                  type="button"
                  aria-pressed={isActive}
                  aria-label={t('productDetail.galleryThumbAria', {
                    index: index + 1,
                    count: gallery.length,
                  })}
                  onClick={() => selectImageByIndex(index)}
                  sx={{
                    width: 70,
                    height: 70,
                    p: 0,
                    borderRadius: 1,
                    border: isActive ? '2px solid' : '1px solid',
                    borderColor: isActive ? 'secondary.main' : 'divider',
                    overflow: 'hidden',
                    backgroundColor: 'background.paper',
                    cursor: 'pointer',
                    transition: reducedMotion
                      ? 'none'
                      : 'transform 170ms ease, box-shadow 170ms ease',
                    '&:hover': {
                      transform: reducedMotion ? 'none' : 'translateY(-2px)',
                      boxShadow: (theme) => `0 8px 18px ${alpha(theme.palette.primary.dark, 0.18)}`,
                    },
                    '&:focus-visible': {
                      outline: '3px solid',
                      outlineColor: 'secondary.main',
                      outlineOffset: 2,
                    },
                  }}
                >
                  <Box
                    component="img"
                    src={image}
                    alt={`${product.name} thumbnail ${index + 1}`}
                    sx={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                </Box>
              );
            })}
          </Stack>
          <Box sx={visuallyHidden} aria-live="polite">
            {t('productDetail.showingImage', {
              index: Math.min(selectedImageIndex + 1, gallery.length),
              count: gallery.length,
            })}
          </Box>
        </Grid>

        <Grid item xs={12} md={6}>
          <Stack spacing={1.6}>
            <Typography variant="h4" sx={{ lineHeight: 1.1 }}>
              {product.name}
            </Typography>
            <Typography color="text.secondary">
              {product.brand.name} / {product.category.name}
            </Typography>
            <Stack direction="row" spacing={1} alignItems="center">
              <Rating value={Number(product.averageRating || 0)} precision={0.1} readOnly />
              <Typography color="text.secondary">{Number(product.averageRating || 0).toFixed(1)}</Typography>
            </Stack>

            <Typography variant="h4" sx={{ color: 'primary.main' }}>
              {formatCurrency(Number(product.basePrice || 0))}
            </Typography>
            {shippingEstimateData?.shippingEstimate ? (
              <Typography variant="body2" color="text.secondary">
                {t('productDetail.deliveryEstimate')}: {shippingEstimateData.shippingEstimate.estimatedMinDays}-
                {shippingEstimateData.shippingEstimate.estimatedMaxDays} {t('productDetail.days')}
              </Typography>
            ) : null}
            <Typography color="text.secondary">{product.description}</Typography>

            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
              <Button
                variant={hasInWishlist(Number(product.id)) ? 'contained' : 'outlined'}
                startIcon={hasInWishlist(Number(product.id)) ? <FavoriteRoundedIcon /> : <FavoriteBorderRoundedIcon />}
                onClick={toggleWishlistAction}
              >
                {hasInWishlist(Number(product.id)) ? t('wishlist.saved') : t('wishlist.add')}
              </Button>
              <Button
                variant={hasInCompare(Number(product.id)) ? 'contained' : 'outlined'}
                startIcon={<CompareArrowsRoundedIcon />}
                onClick={toggleCompareAction}
              >
                {hasInCompare(Number(product.id)) ? t('compare.remove') : t('compare.add')}
              </Button>
              {hasSizeChart ? (
                <Button variant="outlined" onClick={() => setSizeGuideOpen(true)}>
                  {t('productDetail.sizeGuide')}
                </Button>
              ) : null}
            </Stack>

            <Divider />

            <Typography variant="subtitle1" component="h5">
              {t('productDetail.variants')}
            </Typography>
            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
              {(product.variants || []).map((variant: any) => {
                const stock = variant.inventory ? variant.inventory.quantity - variant.inventory.reserved : 0;
                return (
                  <Chip
                    key={variant.id}
                    label={`${formatVariantLabel(variant, t('common.defaultVariant'), t('common.oneSize'))} (${stock})`}
                    color={variant.id === selectedVariant?.id ? 'primary' : 'default'}
                    onClick={() => setSelectedVariantId(variant.id)}
                    clickable
                  />
                );
              })}
            </Stack>

            <Stack direction="row" spacing={1} alignItems="center">
              <Chip label={inStock ? t('common.inStock') : t('common.outOfStock')} color={inStock ? 'success' : 'default'} />
              <Typography color="text.secondary">
                {t('productDetail.sku')}: {selectedVariant?.sku || '-'}
              </Typography>
            </Stack>

            {inStock ? (
              <Button
                ref={addToCartRef}
                variant="contained"
                size="large"
                disabled={!selectedVariant || !inStock}
                sx={{ mt: 0.6 }}
                onClick={() => {
                  void handleAddToCart();
                }}
              >
                {t('productDetail.addToCart')}
              </Button>
            ) : (
              <Stack spacing={1.1}>
                <TextField
                  label={t('productDetail.notifyEmail')}
                  type="email"
                  value={notifyEmail}
                  onChange={(event) => setNotifyEmail(event.target.value)}
                />
                <Button
                  ref={addToCartRef}
                  variant="outlined"
                  disabled={subscribingBackInStock || !notifyEmail.trim()}
                  onClick={() => {
                    void runMutation(
                      () =>
                        subscribeBackInStock({
                          variables: {
                            input: {
                              email: notifyEmail.trim(),
                              variantId: selectedVariant?.id ? Number(selectedVariant.id) : undefined,
                              productId: Number(product.id),
                            },
                          },
                        }),
                      {
                        successMessage: t('productDetail.notifySuccess'),
                      },
                    ).then((result) => {
                      if (!result) {
                        return;
                      }
                      setNotifyEmail('');
                    });
                  }}
                >
                  {t('productDetail.notifyMe')}
                </Button>
              </Stack>
            )}

            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
              <Chip label={t('productDetail.trust.secure')} color="primary" variant="outlined" />
              <Chip label={t('productDetail.trust.returns')} color="primary" variant="outlined" />
              <Chip label={t('productDetail.trust.support')} color="primary" variant="outlined" />
            </Stack>
          </Stack>
        </Grid>
      </Grid>

      <Grid container spacing={3.2} sx={{ mt: 1.2 }}>
        <Grid item xs={12} md={7}>
          <Typography variant="h5" sx={{ mb: 1.5 }}>
            {t('productDetail.reviews')}
          </Typography>

          {(reviewsData?.reviews || []).length === 0 ? (
            <EmptyState title={t('productDetail.noReviewsTitle')} description={t('productDetail.noReviewsDescription')} />
          ) : (
            <List>
              {(reviewsData?.reviews || []).map((review: any) => (
                <ListItem key={review.id} alignItems="flex-start" sx={{ borderBottom: '1px solid', borderColor: 'divider' }}>
                  <ListItemAvatar>
                    <Avatar>{review.user?.fullName?.slice(0, 1) || 'U'}</Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={
                      <Stack direction="row" spacing={1.2} alignItems="center">
                        <Typography variant="subtitle2">{review.user?.fullName || t('common.unknown')}</Typography>
                        <Rating size="small" readOnly value={review.rating} />
                      </Stack>
                    }
                    secondary={
                      <>
                        <Typography component="span" variant="body2" color="text.primary">
                          {review.comment}
                        </Typography>
                        <Typography component="div" variant="caption" color="text.secondary" sx={{ mt: 0.5 }}>
                          {formatDateTime(review.createdAt)}
                        </Typography>
                      </>
                    }
                  />
                </ListItem>
              ))}
            </List>
          )}

          {isAuthenticated ? (
            <Card sx={{ mt: 2 }}>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 1.2 }}>
                  {t('productDetail.writeReview')}
                </Typography>
                <Stack spacing={1.5}>
                  <Rating value={reviewRating} onChange={(_, value) => setReviewRating(value)} aria-label={t('productDetail.rating')} />
                  <TextField
                    label={t('productDetail.review')}
                    multiline
                    minRows={3}
                    value={reviewComment}
                    onChange={(event) => setReviewComment(event.target.value)}
                  />
                  <Button
                    variant="contained"
                    disabled={creatingReview || !reviewComment.trim() || !reviewRating}
                    onClick={() => {
                      void (async () => {
                        const result = await runMutation(
                          () =>
                            createReview({
                              variables: {
                                input: {
                                  productId: Number(id),
                                  rating: Number(reviewRating || 5),
                                  comment: reviewComment,
                                },
                              },
                            }),
                          { successMessage: t('success.reviewSubmitted') },
                        );

                        if (!result) {
                          return;
                        }

                        setReviewComment('');
                        setReviewRating(5);
                        void refetchReviews();
                      })();
                    }}
                  >
                    {t('productDetail.submitReview')}
                  </Button>
                </Stack>
              </CardContent>
            </Card>
          ) : (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
              <RouterLink to="/auth/login">{t('nav.login')}</RouterLink> {t('productDetail.signinToReview')}
            </Typography>
          )}
        </Grid>

        <Grid item xs={12} md={5}>
          <Typography variant="h5" sx={{ mb: 1.5 }}>
            {t('productDetail.related')}
          </Typography>
          <Stack spacing={1.5}>
            {(product.relatedProducts || []).slice(0, 4).map((related: any) => (
              <Card
                key={related.id}
                sx={{
                  transition: reducedMotion ? 'none' : 'transform 170ms ease, box-shadow 170ms ease',
                  '&:hover': {
                    transform: reducedMotion ? 'none' : 'translateY(-2px)',
                    boxShadow: (theme) => `0 14px 24px ${alpha(theme.palette.primary.dark, 0.16)}`,
                  },
                }}
              >
                <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <Box
                    component="img"
                    src={related.thumbnail || '/images/150x150.png'}
                    alt={related.name}
                    sx={{ width: 60, height: 60, borderRadius: 1, objectFit: 'cover' }}
                  />
                  <Box sx={{ flexGrow: 1 }}>
                    <Typography component={RouterLink} to={`/products/${related.id}`} sx={{ textDecoration: 'none', color: 'inherit' }}>
                      {related.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {related.brand?.name}
                    </Typography>
                  </Box>
                  <Typography variant="subtitle2">{formatCurrency(Number(related.basePrice || 0))}</Typography>
                </CardContent>
              </Card>
            ))}
          </Stack>
        </Grid>
      </Grid>

      <Dialog
        fullScreen
        open={fullscreenOpen}
        onClose={() => setFullscreenOpen(false)}
        aria-label={t('productDetail.openFullscreen')}
      >
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6">{product.name}</Typography>
          <IconButton aria-label={t('common.close')} onClick={() => setFullscreenOpen(false)}>
            <CloseRoundedIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <Stack spacing={1.5}>
            <Box sx={{ width: '100%', overflow: 'auto', display: 'flex', justifyContent: 'center' }}>
              <Box
                component="img"
                src={activeImage}
                alt={product.name}
                sx={{
                  width: 'auto',
                  maxWidth: '100%',
                  maxHeight: '75vh',
                  transform: `scale(${zoom})`,
                  transformOrigin: 'center center',
                  transition: reducedMotion ? 'none' : 'transform 150ms ease',
                }}
              />
            </Box>
            <Stack direction="row" spacing={1} justifyContent="center">
              <Button
                variant="outlined"
                startIcon={<RemoveRoundedIcon />}
                onClick={() => setZoom((old) => Math.max(1, Number((old - 0.2).toFixed(2))))}
              >
                {t('productDetail.zoomOut')}
              </Button>
              <Button
                variant="outlined"
                startIcon={<AddRoundedIcon />}
                onClick={() => setZoom((old) => Math.min(3, Number((old + 0.2).toFixed(2))))}
              >
                {t('productDetail.zoomIn')}
              </Button>
            </Stack>
          </Stack>
        </DialogContent>
      </Dialog>

      <Dialog open={sizeGuideOpen} onClose={() => setSizeGuideOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{t('productDetail.sizeGuideTitle')}</DialogTitle>
        <DialogContent>
          <Typography color="text.secondary" sx={{ mb: 2 }}>
            {t('productDetail.sizeGuideDescription')}
          </Typography>
          <Grid container spacing={1}>
            {['S', 'M', 'L', 'XL'].map((size) => (
              <Grid item xs={3} key={size}>
                <Card variant="outlined">
                  <CardContent sx={{ textAlign: 'center', py: 1.2 }}>
                    <Typography sx={{ fontWeight: 700 }}>{size}</Typography>
                    <Typography variant="caption" color="text.secondary">
                      90-120 cm
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </DialogContent>
      </Dialog>

      {showStickyBar ? (
        <Box
          component={motion.div}
          initial={reducedMotion ? false : { opacity: 0, y: 30 }}
          animate={reducedMotion ? undefined : { opacity: 1, y: 0 }}
          exit={reducedMotion ? undefined : { opacity: 0, y: 30 }}
          sx={{
            display: { xs: 'block', md: 'none' },
            position: 'fixed',
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 1250,
            p: 1.2,
            borderTop: '1px solid',
            borderColor: 'divider',
            bgcolor: 'background.paper',
            backdropFilter: 'blur(6px)',
          }}
        >
          <Stack direction="row" spacing={1} alignItems="center">
            <Box sx={{ minWidth: 0, flexGrow: 1 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                {formatCurrency(Number(product.basePrice || 0))}
              </Typography>
              <Typography variant="caption" color="text.secondary" noWrap>
                {t('productDetail.stickyVariant')}: {formatVariantLabel(selectedVariant || {}, t('common.defaultVariant'), t('common.oneSize'))}
              </Typography>
            </Box>
            <Button
              fullWidth
              variant="contained"
              disabled={!selectedVariant || !inStock}
              onClick={() => {
                void handleAddToCart();
              }}
            >
              {t('productDetail.stickyAdd')}
            </Button>
          </Stack>
        </Box>
      ) : null}
    </Container>
  );
}
