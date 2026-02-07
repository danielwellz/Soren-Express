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
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import React from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { EmptyState } from '../components/common/EmptyState';
import {
  CART_QUERY,
  REMOVE_CART_ITEM_MUTATION,
  UPDATE_CART_ITEM_MUTATION,
} from '../graphql/documents';
import { useMutationAction } from '../hooks/useMutationAction';
import { getSessionId } from '../lib/session';

export function CartPage() {
  const runMutation = useMutationAction();
  const navigate = useNavigate();
  const sessionId = getSessionId();

  const { data, loading } = useQuery(CART_QUERY, {
    variables: { context: { sessionId } },
  });

  const [updateItem, { loading: updating }] = useMutation(UPDATE_CART_ITEM_MUTATION, {
    refetchQueries: [{ query: CART_QUERY, variables: { context: { sessionId } } }],
  });

  const [removeItem, { loading: removing }] = useMutation(REMOVE_CART_ITEM_MUTATION, {
    refetchQueries: [{ query: CART_QUERY, variables: { context: { sessionId } } }],
  });

  const items = data?.cart?.items || [];

  const subtotal = items.reduce(
    (sum: number, item: { unitPrice: number; quantity: number }) =>
      sum + Number(item.unitPrice) * item.quantity,
    0,
  );

  if (!loading && !items.length) {
    return (
      <Container maxWidth="lg" sx={{ py: 5 }}>
        <EmptyState
          title="Your cart is empty"
          description="Add products to start checkout."
          actionLabel="Browse products"
          onAction={() => navigate('/products')}
        />
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: { xs: 3, md: 4 } }}>
      <Typography variant="h4" sx={{ mb: 2.5 }}>
        Cart
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
                      boxShadow: '0 14px 24px rgba(11, 36, 71, 0.1)',
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
                        <Typography variant="h6">{item.variant?.product?.name}</Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                          {item.variant?.color || 'Default'} / {item.variant?.size || 'One Size'}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          SKU: {item.variant?.sku}
                        </Typography>
                      </Box>

                      <Stack direction="row" spacing={1} alignItems="center">
                        <TextField
                          type="number"
                          size="small"
                          label="Qty"
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
                          ${lineTotal.toFixed(2)}
                        </Typography>
                        <IconButton
                          aria-label="remove"
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
                              { successMessage: 'Item removed' },
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
        </Grid>

        <Grid item xs={12} md={4}>
          <Card className="surface-glass" sx={{ position: 'sticky', top: 92 }}>
            <CardContent>
              <Typography variant="h6" component="h2">Order summary</Typography>
              <Stack spacing={1} sx={{ mt: 1.5 }}>
                <Stack direction="row" justifyContent="space-between">
                  <Typography color="text.secondary">Subtotal</Typography>
                  <Typography>${subtotal.toFixed(2)}</Typography>
                </Stack>
                <Stack direction="row" justifyContent="space-between">
                  <Typography color="text.secondary">Shipping</Typography>
                  <Typography>Calculated at checkout</Typography>
                </Stack>
              </Stack>

              <Divider sx={{ my: 1.5 }} />

              <Stack direction="row" justifyContent="space-between" sx={{ mb: 2 }}>
                <Typography variant="h6" component="p">Estimated total</Typography>
                <Typography variant="h6" component="p">${subtotal.toFixed(2)}</Typography>
              </Stack>

              <Button
                component={RouterLink}
                to="/checkout"
                variant="contained"
                fullWidth
                disabled={updating || removing}
              >
                Checkout
              </Button>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
}
