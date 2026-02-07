import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import {
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  CardMedia,
  Chip,
  Rating,
  Typography,
} from '@mui/material';
import { motion } from 'framer-motion';
import React, { useEffect, useRef, useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';

type ProductCardProps = {
  product: {
    id: number;
    name: string;
    basePrice: number;
    thumbnail?: string;
    averageRating?: number;
    brand?: { name: string };
    variants?: Array<{
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
      whileHover={{ y: -4 }}
      transition={{ duration: 0.22, ease: 'easeOut' }}
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
          transition: 'box-shadow 220ms ease, border-color 220ms ease',
          '&:hover': {
            borderColor: 'primary.light',
            boxShadow: '0 16px 30px rgba(11, 36, 71, 0.12)',
          },
        }}
      >
        <Box
          component={RouterLink}
          to={`/products/${product.id}`}
          sx={{ display: 'block', position: 'relative', overflow: 'hidden' }}
        >
          <Chip
            label={inStock ? 'In Stock' : 'Sold Out'}
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
              transition: 'transform 260ms ease',
              '.MuiCard-root:hover &': {
                transform: 'scale(1.04)',
              },
            }}
          />
        </Box>
        <CardContent sx={{ flexGrow: 1, pb: 1 }}>
          <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700 }}>
            {product.brand?.name || 'Brand'}
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
            ${Number(product.basePrice).toFixed(2)}
          </Typography>
        </CardContent>
        <CardActions sx={{ justifyContent: 'space-between', px: 2, pb: 2.3 }}>
          <Typography variant="caption" color="text.secondary">
            {inStock ? 'Ready to ship' : 'Currently unavailable'}
          </Typography>
          <Button
            variant="contained"
            size="small"
            disabled={!inStock || !onAdd || isAdding}
            onClick={() => {
              void handleAdd();
            }}
            aria-label={`Add ${product.name} to cart`}
            data-testid={`add-to-cart-button-${product.id}`}
            startIcon={justAdded ? <CheckCircleOutlineIcon fontSize="small" /> : undefined}
          >
            {isAdding ? 'Adding...' : justAdded ? 'Added' : 'Add'}
          </Button>
        </CardActions>
      </Card>
    </Box>
  );
}
