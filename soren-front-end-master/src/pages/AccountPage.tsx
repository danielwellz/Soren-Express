import { useMutation, useQuery } from '@apollo/client';
import {
  Button,
  Card,
  CardContent,
  Chip,
  Container,
  Grid,
  List,
  ListItem,
  ListItemText,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link as RouterLink } from 'react-router-dom';
import { EmptyState } from '../components/common/EmptyState';
import { useMutationAction } from '../hooks/useMutationAction';
import { useLocaleFormatters } from '../hooks/useLocaleFormatters';
import {
  DELETE_ADDRESS_MUTATION,
  ME_QUERY,
  MY_ADDRESSES_QUERY,
  MY_ORDERS_QUERY,
  SAVE_ADDRESS_MUTATION,
  SET_DEFAULT_ADDRESS_MUTATION,
} from '../graphql/documents';

function statusColor(status: string): 'default' | 'success' | 'warning' | 'error' {
  if (status === 'PAID' || status === 'FULFILLED') {
    return 'success';
  }
  if (status === 'PENDING') {
    return 'warning';
  }
  if (status === 'CANCELLED') {
    return 'error';
  }
  return 'default';
}

function localizedOrderStatus(status: string, t: (key: string) => string): string {
  const map: Record<string, string> = {
    PENDING: t('orderDetails.status.pending'),
    PAID: t('orderDetails.status.paid'),
    FULFILLED: t('orderDetails.status.fulfilled'),
    CANCELLED: t('orderDetails.status.cancelled'),
  };

  return map[status] || status;
}

export function AccountPage() {
  const { t } = useTranslation();
  const runMutation = useMutationAction();
  const { formatCurrency, formatDateTime } = useLocaleFormatters();
  const { data: meData } = useQuery(ME_QUERY);
  const { data: addressesData, refetch: refetchAddresses } = useQuery(MY_ADDRESSES_QUERY);
  const { data, loading, error, refetch } = useQuery(MY_ORDERS_QUERY);
  const [newAddress, setNewAddress] = useState({
    fullName: '',
    line1: '',
    city: '',
    region: '',
    postalCode: '',
  });

  const [saveAddress, { loading: savingAddress }] = useMutation(SAVE_ADDRESS_MUTATION);
  const [deleteAddress, { loading: deletingAddress }] = useMutation(DELETE_ADDRESS_MUTATION);
  const [setDefaultAddress, { loading: settingDefaultAddress }] = useMutation(SET_DEFAULT_ADDRESS_MUTATION);

  const user = meData?.me;
  const addresses = addressesData?.myAddresses || [];
  const orders = data?.myOrders || [];

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" sx={{ mb: 2.5 }}>
        {t('account.title')}
      </Typography>

      <Grid container spacing={2}>
        <Grid item xs={12} md={4}>
          <Card className="surface-glass">
            <CardContent>
              <Typography variant="h6">{t('account.profile')}</Typography>
              <Stack spacing={0.8} sx={{ mt: 1.5 }}>
                <Typography>
                  <strong>{t('account.name')}:</strong> {user?.fullName || '-'}
                </Typography>
                <Typography>
                  <strong>{t('account.email')}:</strong> {user?.email || '-'}
                </Typography>
                <Typography>
                  <strong>{t('account.phone')}:</strong> {user?.phone || '-'}
                </Typography>
                <Typography>
                  <strong>{t('account.address')}:</strong> {user?.address || '-'}
                </Typography>
                <Typography>
                  <strong>{t('account.role')}:</strong>{' '}
                  {user?.role ? t(`account.roles.${String(user.role).toLowerCase()}`) : '-'}
                </Typography>
              </Stack>

              <Typography variant="subtitle2" sx={{ mt: 2 }}>
                {t('account.savedAddresses')}
              </Typography>
              {addresses.length ? (
                <Stack spacing={0.8} sx={{ mt: 1 }}>
                  {addresses.map((address: any) => (
                    <Stack
                      key={address.id}
                      direction={{ xs: 'column', sm: 'row' }}
                      justifyContent="space-between"
                      alignItems={{ xs: 'flex-start', sm: 'center' }}
                      spacing={0.5}
                    >
                      <Typography variant="body2" color="text.secondary">
                        {address.isDefault ? '• ' : ''}{address.fullName} - {address.line1}, {address.city}
                      </Typography>
                      <Stack direction="row" spacing={0.6}>
                        {!address.isDefault ? (
                          <Button
                            size="small"
                            variant="text"
                            disabled={settingDefaultAddress}
                            onClick={() => {
                              void runMutation(
                                () =>
                                  setDefaultAddress({
                                    variables: { id: Number(address.id) },
                                  }),
                                { successMessage: t('success.savedAddress') },
                              ).then((result) => {
                                if (!result) {
                                  return;
                                }
                                void refetchAddresses();
                              });
                            }}
                          >
                            {t('account.makeDefault')}
                          </Button>
                        ) : null}
                        <Button
                          size="small"
                          color="error"
                          variant="text"
                          disabled={deletingAddress}
                          onClick={() => {
                            void runMutation(
                              () =>
                                deleteAddress({
                                  variables: { id: Number(address.id) },
                                }),
                              { successMessage: t('success.addressRemoved') },
                            ).then((result) => {
                              if (!result) {
                                return;
                              }
                              void refetchAddresses();
                            });
                          }}
                        >
                          {t('common.remove')}
                        </Button>
                      </Stack>
                    </Stack>
                  ))}
                </Stack>
              ) : (
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  {t('account.addAddress')}
                </Typography>
              )}

              <Stack spacing={1} sx={{ mt: 1.5 }}>
                <TextField
                  size="small"
                  label={t('account.name')}
                  value={newAddress.fullName}
                  onChange={(event) =>
                    setNewAddress((old) => ({ ...old, fullName: event.target.value }))
                  }
                />
                <TextField
                  size="small"
                  label={t('account.address')}
                  value={newAddress.line1}
                  onChange={(event) =>
                    setNewAddress((old) => ({ ...old, line1: event.target.value }))
                  }
                />
                <Stack direction="row" spacing={1}>
                  <TextField
                    size="small"
                    label={t('checkout.address.city')}
                    value={newAddress.city}
                    onChange={(event) =>
                      setNewAddress((old) => ({ ...old, city: event.target.value }))
                    }
                  />
                  <TextField
                    size="small"
                    label={t('checkout.address.region')}
                    value={newAddress.region}
                    onChange={(event) =>
                      setNewAddress((old) => ({ ...old, region: event.target.value }))
                    }
                  />
                </Stack>
                <TextField
                  size="small"
                  label={t('checkout.address.postalCode')}
                  value={newAddress.postalCode}
                  onChange={(event) =>
                    setNewAddress((old) => ({ ...old, postalCode: event.target.value }))
                  }
                />
                <Button
                  variant="outlined"
                  disabled={
                    savingAddress ||
                    !newAddress.fullName ||
                    !newAddress.line1 ||
                    !newAddress.city ||
                    !newAddress.region ||
                    !newAddress.postalCode
                  }
                  onClick={() => {
                    void runMutation(
                      () =>
                        saveAddress({
                          variables: {
                            input: {
                              ...newAddress,
                              isDefault: !addresses.length,
                            },
                          },
                        }),
                      { successMessage: t('success.savedAddress') },
                    ).then((result) => {
                      if (!result) {
                        return;
                      }

                      setNewAddress({
                        fullName: '',
                        line1: '',
                        city: '',
                        region: '',
                        postalCode: '',
                      });
                      void refetchAddresses();
                    });
                  }}
                >
                  {t('account.addAddress')}
                </Button>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={8}>
          <Card className="surface-glass">
            <CardContent>
              <Typography variant="h6" sx={{ mb: 1.2 }}>
                {t('account.orderHistory')}
              </Typography>
              {loading ? <Typography>{t('account.loadingOrders')}</Typography> : null}
              {error ? (
                <EmptyState
                  title={t('common.somethingWentWrong')}
                  description={t('errors.network')}
                  actionLabel={t('common.retry')}
                  onAction={() => {
                    void refetch();
                  }}
                />
              ) : null}
              {!loading && !error && !orders.length ? (
                <EmptyState title={t('account.noOrdersTitle')} description={t('account.noOrdersDescription')} />
              ) : null}

              {!loading && !error && orders.length ? (
                <List disablePadding>
                  {orders.map((order: any) => (
                    <ListItem
                      key={order.id}
                      divider
                      component={RouterLink}
                      to={`/account/orders/${order.id}`}
                      sx={{ textDecoration: 'none', color: 'inherit' }}
                    >
                      <ListItemText
                        primary={`${t('account.order')} #${order.id}`}
                        secondary={`${formatDateTime(order.createdAt)} • ${order.items.length} ${t('account.items')}`}
                      />
                      <Stack alignItems="flex-end" spacing={0.7}>
                        <Chip
                          label={localizedOrderStatus(order.status, t)}
                          color={statusColor(order.status)}
                          size="small"
                        />
                        <Typography variant="subtitle2">{formatCurrency(Number(order.total || 0))}</Typography>
                      </Stack>
                    </ListItem>
                  ))}
                </List>
              ) : null}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
}
