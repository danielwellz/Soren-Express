import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import FavoriteBorderRoundedIcon from '@mui/icons-material/FavoriteBorderRounded';
import FavoriteRoundedIcon from '@mui/icons-material/FavoriteRounded';
import {
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  CardMedia,
  Chip,
  IconButton,
  Rating,
  Typography,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import { motion, useReducedMotion } from 'framer-motion';
import React, { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link as RouterLink } from 'react-router-dom';
import { useAnalytics } from '../../context/AnalyticsContext';
import { useWishlist } from '../../context/WishlistContext';
import { useLocaleFormatters } from '../../hooks/useLocaleFormatters';
import { emitOpenMiniCart } from '../../lib/cartDrawerEvents';

type ProductCardProps = {
  product: {
    id: number;
    name: string;
    basePrice: number;
    thumbnail?: string;
    averageRating?: number;
    brand?: { name: string };
    variants?: Array<{
      id?: number;
      inventory?: { quantity: number; reserved: number };
    }>;
  };
  onAdd?: () => Promise<unknown> | void;
};

function productInStock(product: ProductCardProps['product']): boolean {
  if (!product.variants || !product.variants.length) {
    return false;
  }

  return product.variants.some((variant) => {
    const inventory = variant.inventory;
    if (!inventory) {
      return false;
    }
    return inventory.quantity - inventory.reserved > 0;
  });
}

export function ProductCard({ product, onAdd }: ProductCardProps) {
  const { t } = useTranslation();
  const { trackEvent } = useAnalytics();
  const { toggleWishlist, hasInWishlist } = useWishlist();
  const { formatCurrency } = useLocaleFormatters();
  const reducedMotion = useReducedMotion();
  const inStock = productInStock(product);
  const [isAdding, setIsAdding] = useState(false);
  const [justAdded, setJustAdded] = useState(false);
  const addedTimer = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (addedTimer.current) {
        window.clearTimeout(addedTimer.current);
      }
    };
  }, []);

  const inWishlist = hasInWishlist(Number(product.id));

  const toggleWishlistAction = () => {
    const normalizedVariants =
      product.variants?.map((variant, index) => ({
        id: Number(variant.id ?? index + 1),
        inventory: variant.inventory,
      })) || [];

    toggleWishlist({
      id: Number(product.id),
      name: String(product.name || ''),
      basePrice: Number(product.basePrice || 0),
      thumbnail: product.thumbnail,
      averageRating: Number(product.averageRating || 0),
      brand: product.brand,
      category: undefined,
      variants: normalizedVariants.length ? normalizedVariants : undefined,
    });
  };

  const handleAdd = async () => {
    if (!onAdd || isAdding) {
      return;
    }

    setIsAdding(true);

    let result: unknown = null;
    try {
      result = await onAdd();
    } catch (_error) {
      result = null;
    } finally {
      setIsAdding(false);
    }

    if (result === null) {
      return;
    }

    emitOpenMiniCart();
    void trackEvent('add_to_cart', {
      productId: product.id,
      productName: product.name,
      price: Number(product.basePrice || 0),
    });
    setJustAdded(true);
    if (addedTimer.current) {
      window.clearTimeout(addedTimer.current);
    }
    addedTimer.current = window.setTimeout(() => {
      setJustAdded(false);
    }, 1200);
  };

  return (
    <Box
      component={motion.div}
      whileHover={reducedMotion ? undefined : { y: -4 }}
      transition={{ duration: reducedMotion ? 0.01 : 0.22, ease: 'easeOut' }}
      sx={{ height: '100%' }}
    >
      <Card
        sx={{
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          border: '1px solid',
          borderColor: 'divider',
          transition: reducedMotion ? 'none' : 'box-shadow 220ms ease, border-color 220ms ease',
          '&:hover': {
            borderColor: 'primary.light',
            boxShadow: (theme) => `0 16px 30px ${alpha(theme.palette.primary.dark, 0.18)}`,
          },
        }}
      >
        <Box
          component={RouterLink}
          to={`/products/${product.id}`}
          sx={{ display: 'block', position: 'relative', overflow: 'hidden' }}
        >
          <Chip
            label={inStock ? t('productCard.inStock') : t('productCard.soldOut')}
            size="small"
            color={inStock ? 'success' : 'default'}
            sx={{ position: 'absolute', top: 12, left: 12, zIndex: 1 }}
          />
          <CardMedia
            component="img"
            image={product.thumbnail || '/images/150x150.png'}
            alt={product.name}
            sx={{
              height: 220,
              objectFit: 'cover',
              backgroundColor: 'action.hover',
              transition: reducedMotion ? 'none' : 'transform 260ms ease',
              '.MuiCard-root:hover &': {
                transform: reducedMotion ? 'none' : 'scale(1.04)',
              },
            }}
          />
        </Box>
        <CardContent sx={{ flexGrow: 1, pb: 1 }}>
          <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700 }}>
            {product.brand?.name || t('productCard.brandFallback')}
          </Typography>
          <Typography
            component={RouterLink}
            to={`/products/${product.id}`}
            variant="h6"
            sx={{
              mt: 0.7,
              textDecoration: 'none',
              color: 'inherit',
              lineHeight: 1.2,
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
              minHeight: 56,
            }}
          >
            {product.name}
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
            <Rating value={Number(product.averageRating || 0)} precision={0.1} size="small" readOnly />
            <Typography variant="caption" color="text.secondary">
              {Number(product.averageRating || 0).toFixed(1)}
            </Typography>
          </Box>
          <Typography variant="h6" sx={{ mt: 1.5 }}>
            {formatCurrency(Number(product.basePrice || 0))}
          </Typography>
        </CardContent>
        <CardActions sx={{ justifyContent: 'space-between', px: 2, pb: 2.3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.6 }}>
            <Typography variant="caption" color="text.secondary">
              {inStock ? t('productCard.readyToShip') : t('productCard.unavailable')}
            </Typography>
            <IconButton
              size="small"
              color={inWishlist ? 'secondary' : 'default'}
              aria-label={inWishlist ? t('wishlist.remove') : t('wishlist.add')}
              onClick={toggleWishlistAction}
            >
              {inWishlist ? <FavoriteRoundedIcon fontSize="small" /> : <FavoriteBorderRoundedIcon fontSize="small" />}
            </IconButton>
          </Box>
          <Button
            variant="contained"
            size="small"
            disabled={!inStock || !onAdd || isAdding}
            onClick={() => {
              void handleAdd();
            }}
            aria-label={t('productCard.addAria', { name: product.name })}
            data-testid={`add-to-cart-button-${product.id}`}
            startIcon={justAdded ? <CheckCircleOutlineIcon fontSize="small" /> : undefined}
          >
            {isAdding ? t('productCard.adding') : justAdded ? t('productCard.added') : t('productCard.add')}
          </Button>
        </CardActions>
      </Card>
    </Box>
  );
}
