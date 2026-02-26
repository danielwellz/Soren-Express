import {
  Box,
  Button,
  Divider,
  Drawer,
  IconButton,
  Stack,
  Typography,
} from '@mui/material';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import RemoveRoundedIcon from '@mui/icons-material/RemoveRounded';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';
import { useMutation, useQuery } from '@apollo/client';
import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import {
  ADD_TO_CART_MUTATION,
  CART_QUERY,
  FEATURED_PRODUCTS_QUERY,
  REMOVE_CART_ITEM_MUTATION,
  UPDATE_CART_ITEM_MUTATION,
} from '../../graphql/documents';
import { useMutationAction } from '../../hooks/useMutationAction';
import { useLocale } from '../../context/LocaleContext';
import { useLocaleFormatters } from '../../hooks/useLocaleFormatters';
import { getSessionId } from '../../lib/session';

type MiniCartDrawerProps = {
  open: boolean;
  onClose: () => void;
};

export function MiniCartDrawer({ open, onClose }: MiniCartDrawerProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const runMutation = useMutationAction();
  const { direction } = useLocale();
  const { formatCurrency } = useLocaleFormatters();
  const sessionId = getSessionId();

  const { data } = useQuery(CART_QUERY, {
    variables: { context: { sessionId } },
  });

  const { data: featuredData } = useQuery(FEATURED_PRODUCTS_QUERY);

  const [updateCartItem, { loading: isUpdating }] = useMutation(UPDATE_CART_ITEM_MUTATION, {
    refetchQueries: [{ query: CART_QUERY, variables: { context: { sessionId } } }],
  });

  const [removeCartItem, { loading: isRemoving }] = useMutation(REMOVE_CART_ITEM_MUTATION, {
    refetchQueries: [{ query: CART_QUERY, variables: { context: { sessionId } } }],
  });

  const [addToCart, { loading: isAddingUpsell }] = useMutation(ADD_TO_CART_MUTATION, {
    refetchQueries: [{ query: CART_QUERY, variables: { context: { sessionId } } }],
  });

  const items = data?.cart?.items || [];

  const subtotal = items.reduce(
    (sum: number, item: { quantity: number; unitPrice: number }) =>
      sum + Number(item.unitPrice) * item.quantity,
    0,
  );

  const currentProductIds = new Set(
    items.map((item: { variant?: { product?: { id?: number } } }) => item.variant?.product?.id),
  );

  const upsellItems = (featuredData?.featuredProducts || [])
    .filter((product: { id: number }) => !currentProductIds.has(product.id))
    .slice(0, 3);

  const anchor = direction === 'rtl' ? 'left' : 'right';

  useEffect(() => {
    if (!open) {
      return undefined;
    }

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [onClose, open]);

  return (
    <Drawer
      anchor={anchor}
      open={open}
      onClose={onClose}
      aria-label={t('miniCart.drawerLabel')}
      data-testid="mini-cart-drawer"
      ModalProps={{ keepMounted: true }}
      PaperProps={{ role: 'dialog', 'aria-modal': true }}
    >
      <Box sx={{ width: { xs: 340, sm: 420 }, height: '100%', display: 'flex', flexDirection: 'column' }}>
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
          sx={{ px: 2, py: 1.5, borderBottom: '1px solid', borderColor: 'divider' }}
        >
          <Typography variant="h6">{t('miniCart.title')}</Typography>
          <IconButton
            aria-label={t('miniCart.close')}
            onClick={onClose}
            size="small"
            data-testid="mini-cart-close"
          >
            <CloseRoundedIcon fontSize="small" />
          </IconButton>
        </Stack>

        <Box sx={{ flexGrow: 1, overflowY: 'auto', px: 2, py: 1.5 }}>
          {!items.length ? (
            <Stack spacing={1.2} sx={{ py: 2 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                {t('miniCart.emptyTitle')}
              </Typography>
              <Typography color="text.secondary">{t('miniCart.emptyDescription')}</Typography>
              <Button
                variant="outlined"
                data-testid="mini-cart-continue"
                onClick={() => {
                  onClose();
                  navigate('/products');
                }}
              >
                {t('miniCart.continueShopping')}
              </Button>
            </Stack>
          ) : (
            <Stack spacing={1.1}>
              {items.map((item: any) => {
                const lineTotal = Number(item.unitPrice) * item.quantity;
                const itemName = item.variant?.product?.name || t('common.unknown');

                return (
                  <Box
                    key={item.id}
                    data-testid={`mini-cart-item-${item.id}`}
                    sx={{
                      p: 1.2,
                      borderRadius: 2,
                      border: '1px solid',
                      borderColor: 'divider',
                      bgcolor: 'background.paper',
                    }}
                  >
                    <Stack direction="row" spacing={1.2}>
                      <Box
                        component="img"
                        src={item.variant?.product?.thumbnail || '/images/150x150.png'}
                        alt={itemName}
                        sx={{ width: 60, height: 60, borderRadius: 1.5, objectFit: 'cover' }}
                      />
                      <Box sx={{ minWidth: 0, flexGrow: 1 }}>
                        <Typography
                          variant="body2"
                          sx={{
                            fontWeight: 700,
                            lineHeight: 1.25,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {itemName}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {item.variant?.color || t('common.defaultVariant')} / {item.variant?.size || t('common.oneSize')}
                        </Typography>
                        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mt: 0.7 }}>
                          <Stack direction="row" alignItems="center" spacing={0.4}>
                            <IconButton
                              size="small"
                              disabled={isUpdating || item.quantity <= 1}
                              aria-label={t('miniCart.decrease')}
                              data-testid={`mini-cart-item-decrease-${item.id}`}
                              onClick={() => {
                                void runMutation(() =>
                                  updateCartItem({
                                    variables: {
                                      input: {
                                        cartItemId: Number(item.id),
                                        quantity: Math.max(1, Number(item.quantity) - 1),
                                        sessionId,
                                      },
                                    },
                                  }),
                                );
                              }}
                            >
                              <RemoveRoundedIcon fontSize="small" />
                            </IconButton>
                            <Typography variant="body2" sx={{ minWidth: 16, textAlign: 'center' }}>
                              {item.quantity}
                            </Typography>
                            <IconButton
                              size="small"
                              disabled={isUpdating}
                              aria-label={t('miniCart.increase')}
                              data-testid={`mini-cart-item-increase-${item.id}`}
                              onClick={() => {
                                void runMutation(() =>
                                  updateCartItem({
                                    variables: {
                                      input: {
                                        cartItemId: Number(item.id),
                                        quantity: Number(item.quantity) + 1,
                                        sessionId,
                                      },
                                    },
                                  }),
                                );
                              }}
                            >
                              <AddRoundedIcon fontSize="small" />
                            </IconButton>
                          </Stack>

                          <Typography variant="body2" sx={{ fontWeight: 700 }}>
                            {formatCurrency(lineTotal)}
                          </Typography>
                        </Stack>
                      </Box>

                      <IconButton
                        size="small"
                        color="error"
                        aria-label={t('miniCart.remove')}
                        data-testid={`mini-cart-item-remove-${item.id}`}
                        disabled={isRemoving}
                        onClick={() => {
                          void runMutation(
                            () =>
                              removeCartItem({
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
                        <DeleteOutlineRoundedIcon fontSize="small" />
                      </IconButton>
                    </Stack>
                  </Box>
                );
              })}
            </Stack>
          )}

          {items.length && upsellItems.length ? (
            <>
              <Divider sx={{ my: 2 }} />
              <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 700 }}>
                {t('miniCart.upsellTitle')}
              </Typography>
              <Stack spacing={1}>
                {upsellItems.map((product: any) => (
                  <Stack
                    key={product.id}
                    direction="row"
                    alignItems="center"
                    justifyContent="space-between"
                    spacing={1}
                    sx={{ p: 1, borderRadius: 1.5, border: '1px solid', borderColor: 'divider' }}
                  >
                    <Stack direction="row" spacing={1} alignItems="center" sx={{ minWidth: 0 }}>
                      <Box
                        component="img"
                        src={product.thumbnail || '/images/150x150.png'}
                        alt={product.name}
                        sx={{ width: 46, height: 46, borderRadius: 1, objectFit: 'cover' }}
                      />
                      <Box sx={{ minWidth: 0 }}>
                        <Typography
                          variant="body2"
                          sx={{
                            fontWeight: 600,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                            maxWidth: 175,
                          }}
                        >
                          {product.name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {formatCurrency(Number(product.basePrice || 0))}
                        </Typography>
                      </Box>
                    </Stack>
                    <Button
                      size="small"
                      variant="outlined"
                      data-testid={`mini-cart-upsell-add-${product.id}`}
                      disabled={isAddingUpsell}
                      onClick={() => {
                        const variantId = product.variants?.[0]?.id;
                        if (!variantId) {
                          return;
                        }

                        void runMutation(
                          () =>
                            addToCart({
                              variables: {
                                input: {
                                  variantId: Number(variantId),
                                  quantity: 1,
                                  sessionId,
                                },
                              },
                            }),
                          { successMessage: t('success.addedToCart') },
                        );
                      }}
                    >
                      {t('common.add')}
                    </Button>
                  </Stack>
                ))}
              </Stack>
            </>
          ) : null}
        </Box>

        <Box sx={{ p: 2, borderTop: '1px solid', borderColor: 'divider' }}>
          <Stack direction="row" justifyContent="space-between" sx={{ mb: 1.2 }}>
            <Typography color="text.secondary">{t('common.subtotal')}</Typography>
            <Typography sx={{ fontWeight: 700 }}>{formatCurrency(subtotal)}</Typography>
          </Stack>

          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
            <Button
              fullWidth
              variant="outlined"
              data-testid="mini-cart-continue"
              onClick={() => {
                onClose();
                navigate('/products');
              }}
            >
              {t('miniCart.continueShopping')}
            </Button>
            <Button
              fullWidth
              variant="outlined"
              data-testid="mini-cart-go-to-cart"
              onClick={() => {
                onClose();
                navigate('/cart');
              }}
            >
              {t('miniCart.goToCart')}
            </Button>
            <Button
              fullWidth
              variant="contained"
              data-testid="mini-cart-checkout"
              onClick={() => {
                onClose();
                navigate('/checkout');
              }}
            >
              {t('miniCart.checkout')}
            </Button>
          </Stack>
        </Box>
      </Box>
    </Drawer>
  );
}
