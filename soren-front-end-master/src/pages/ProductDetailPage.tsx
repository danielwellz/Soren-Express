import { useMutation, useQuery } from '@apollo/client';
import {
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Container,
  Divider,
  Grid,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Rating,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { visuallyHidden } from '@mui/utils';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { EmptyState } from '../components/common/EmptyState';
import { LoadingGrid } from '../components/common/LoadingGrid';
import { useAuth } from '../context/AuthContext';
import {
  ADD_TO_CART_MUTATION,
  CART_QUERY,
  CREATE_REVIEW_MUTATION,
  PRODUCT_QUERY,
  REVIEWS_QUERY,
} from '../graphql/documents';
import { useMutationAction } from '../hooks/useMutationAction';
import { getSessionId } from '../lib/session';
import { Link as RouterLink, useNavigate, useParams } from 'react-router-dom';

function formatVariantLabel(variant: { color?: string; size?: string }): string {
  return [variant.color || 'Default', variant.size || 'One Size'].join(' / ');
}

export function ProductDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const runMutation = useMutationAction();

  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [selectedVariantId, setSelectedVariantId] = useState<number | null>(null);
  const [reviewRating, setReviewRating] = useState<number | null>(5);
  const [reviewComment, setReviewComment] = useState('');

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
          title="Product not found"
          description="This product may not exist yet."
          actionLabel="Back to products"
          onAction={() => navigate(-1)}
        />
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: { xs: 3, md: 4 } }}>
      <Grid container spacing={3.2}>
        <Grid item xs={12} md={6}>
          <Card className="surface-glass">
            <Box
              component="img"
              src={activeImage}
              alt={product.name}
              sx={{ width: '100%', height: { xs: 320, md: 500 }, objectFit: 'cover', borderRadius: 2 }}
            />
          </Card>
          <Stack
            direction="row"
            spacing={1}
            sx={{ mt: 1.5, overflowX: 'auto' }}
            role="group"
            aria-label={`${product.name} image gallery`}
            onKeyDown={handleGalleryKeyDown}
          >
            {gallery.map((image: string, index: number) => {
              const isActive = index === selectedImageIndex;
              return (
                <Box
                  key={image}
                  component="button"
                  type="button"
                  aria-pressed={isActive}
                  aria-label={`Show image ${index + 1} of ${gallery.length}`}
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
                    transition: 'transform 170ms ease, box-shadow 170ms ease',
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      boxShadow: '0 8px 18px rgba(11, 36, 71, 0.14)',
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
            Showing image {Math.min(selectedImageIndex + 1, gallery.length)} of {gallery.length}
          </Box>
        </Grid>

        <Grid item xs={12} md={6}>
          <Stack spacing={1.6}>
            <Typography variant="h4" sx={{ lineHeight: 1.1 }}>{product.name}</Typography>
            <Typography color="text.secondary">{product.brand.name} / {product.category.name}</Typography>
            <Stack direction="row" spacing={1} alignItems="center">
              <Rating value={Number(product.averageRating || 0)} precision={0.1} readOnly />
              <Typography color="text.secondary">{Number(product.averageRating || 0).toFixed(1)}</Typography>
            </Stack>

            <Typography variant="h4" sx={{ color: 'primary.main' }}>${Number(product.basePrice).toFixed(2)}</Typography>
            <Typography color="text.secondary">{product.description}</Typography>

            <Divider />

            <Typography variant="subtitle1" component="h5">Variants</Typography>
            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
              {(product.variants || []).map((variant: any) => {
                const stock = variant.inventory
                  ? variant.inventory.quantity - variant.inventory.reserved
                  : 0;
                return (
                  <Chip
                    key={variant.id}
                    label={`${formatVariantLabel(variant)} (${stock})`}
                    color={variant.id === selectedVariant?.id ? 'primary' : 'default'}
                    onClick={() => setSelectedVariantId(variant.id)}
                    clickable
                  />
                );
              })}
            </Stack>

            <Stack direction="row" spacing={1} alignItems="center">
              <Chip label={inStock ? 'In stock' : 'Out of stock'} color={inStock ? 'success' : 'default'} />
              <Typography color="text.secondary">SKU: {selectedVariant?.sku || '-'}</Typography>
            </Stack>

            <Button
              variant="contained"
              size="large"
              disabled={!selectedVariant || !inStock}
              sx={{ mt: 0.6 }}
              onClick={() => {
                if (!selectedVariant?.id) {
                  return;
                }

                return runMutation(
                  () =>
                    addToCart({
                      variables: {
                        input: {
                          variantId: Number(selectedVariant.id),
                          quantity: 1,
                          sessionId: getSessionId(),
                        },
                      },
                    }),
                  { successMessage: 'Added to cart' },
                );
              }}
            >
              Add to cart
            </Button>
          </Stack>
        </Grid>
      </Grid>

      <Grid container spacing={3.2} sx={{ mt: 1.2 }}>
        <Grid item xs={12} md={7}>
          <Typography variant="h5" sx={{ mb: 1.5 }}>
            Reviews
          </Typography>

          {(reviewsData?.reviews || []).length === 0 ? (
            <EmptyState title="No reviews yet" description="Be the first to rate this product." />
          ) : (
            <List>
              {(reviewsData?.reviews || []).map((review: any) => (
                <ListItem key={review.id} alignItems="flex-start" sx={{ borderBottom: '1px solid #e8eef3' }}>
                  <ListItemAvatar>
                    <Avatar>{review.user?.fullName?.slice(0, 1) || 'U'}</Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={
                      <Stack direction="row" spacing={1.2} alignItems="center">
                        <Typography variant="subtitle2">{review.user?.fullName || 'User'}</Typography>
                        <Rating size="small" readOnly value={review.rating} />
                      </Stack>
                    }
                    secondary={
                      <>
                        <Typography component="span" variant="body2" color="text.primary">
                          {review.comment}
                        </Typography>
                        <Typography component="div" variant="caption" color="text.secondary" sx={{ mt: 0.5 }}>
                          {new Date(review.createdAt).toLocaleDateString()}
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
                  Write a review
                </Typography>
                <Stack spacing={1.5}>
                  <Rating
                    value={reviewRating}
                    onChange={(_, value) => setReviewRating(value)}
                    aria-label="Rating"
                  />
                  <TextField
                    label="Review"
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
                          { successMessage: 'Review submitted for moderation' },
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
                    Submit review
                  </Button>
                </Stack>
              </CardContent>
            </Card>
          ) : (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
              <RouterLink to="/auth/login">Sign in</RouterLink> to leave a review.
            </Typography>
          )}
        </Grid>

        <Grid item xs={12} md={5}>
          <Typography variant="h5" sx={{ mb: 1.5 }}>
            Related products
          </Typography>
          <Stack spacing={1.5}>
            {(product.relatedProducts || []).slice(0, 4).map((related: any) => (
              <Card
                key={related.id}
                sx={{
                  transition: 'transform 170ms ease, box-shadow 170ms ease',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: '0 14px 24px rgba(11, 36, 71, 0.11)',
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
                  <Typography variant="subtitle2">${Number(related.basePrice).toFixed(2)}</Typography>
                </CardContent>
              </Card>
            ))}
          </Stack>
        </Grid>
      </Grid>
    </Container>
  );
}
