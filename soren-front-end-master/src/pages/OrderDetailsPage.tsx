import { useMutation, useQuery } from '@apollo/client';
import {
  Box,
  Button,
  Card,
  CardContent,
  Checkbox,
  Chip,
  Container,
  FormControlLabel,
  Grid,
  List,
  ListItem,
  ListItemText,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link as RouterLink, useParams } from 'react-router-dom';
import { useMutationAction } from '../hooks/useMutationAction';
import { useLocaleFormatters } from '../hooks/useLocaleFormatters';
import {
  CREATE_RETURN_REQUEST_MUTATION,
  ORDER_BY_ID_QUERY,
  ORDER_STATUS_TIMELINE_QUERY,
} from '../graphql/documents';

function statusLabel(status: string, t: (key: string) => string): string {
  const key = String(status || '').toLowerCase();
  const map: Record<string, string> = {
    pending: t('orderDetails.status.pending'),
    paid: t('orderDetails.status.paid'),
    fulfilled: t('orderDetails.status.fulfilled'),
    cancelled: t('orderDetails.status.cancelled'),
    requires_confirmation: t('orderDetails.status.requiresConfirmation'),
    succeeded: t('orderDetails.status.succeeded'),
    failed: t('orderDetails.status.failed'),
    shipped: t('orderDetails.status.shipped'),
    delivered: t('orderDetails.status.delivered'),
    requested: t('orderDetails.status.requested'),
    approved: t('orderDetails.status.approved'),
    rejected: t('orderDetails.status.rejected'),
    completed: t('orderDetails.status.completed'),
  };

  return map[key] || status;
}

export function OrderDetailsPage() {
  const { t } = useTranslation();
  const runMutation = useMutationAction();
  const { formatCurrency, formatDateTime } = useLocaleFormatters();
  const { id } = useParams();
  const [returnReason, setReturnReason] = useState('');
  const [exchangePreferred, setExchangePreferred] = useState(false);

  const { data, loading, refetch } = useQuery(ORDER_BY_ID_QUERY, {
    variables: { id: Number(id) },
    skip: !id,
  });

  const { data: timelineData } = useQuery(ORDER_STATUS_TIMELINE_QUERY, {
    variables: { orderId: Number(id) },
    skip: !id,
  });

  const [createReturnRequest, { loading: creatingReturn }] = useMutation(CREATE_RETURN_REQUEST_MUTATION);

  const order = data?.orderById;

  const timeline = useMemo(() => {
    if (timelineData?.orderStatusTimeline?.length) {
      return timelineData.orderStatusTimeline;
    }
    return order?.statusHistory || [];
  }, [order?.statusHistory, timelineData?.orderStatusTimeline]);

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Typography>{t('orderDetails.loading')}</Typography>
      </Container>
    );
  }

  if (!order) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Typography>{t('orderDetails.notFound')}</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
        <Typography variant="h4">
          {t('account.order')} #{order.id}
        </Typography>
        <Typography component={RouterLink} to="/account" sx={{ textDecoration: 'none' }}>
          {t('orderDetails.back')}
        </Typography>
      </Stack>

      <Grid container spacing={2}>
        <Grid item xs={12} md={8}>
          <Card className="surface-glass">
            <CardContent>
              <Typography variant="h6" sx={{ mb: 1 }}>
                {t('orderDetails.items')}
              </Typography>
              <List disablePadding>
                {order.items.map((item: any) => (
                  <ListItem key={item.id} divider>
                    <ListItemText
                      primary={`${item.productName} (${item.variantLabel})`}
                      secondary={`${t('productDetail.sku')} ${item.sku} • ${t('common.quantity')} ${item.quantity}`}
                    />
                    <Typography>{formatCurrency(Number(item.lineTotal || 0))}</Typography>
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>

          <Card className="surface-glass" sx={{ mt: 2 }}>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 1.2 }}>
                {t('orderDetails.timeline')}
              </Typography>
              <Stack spacing={1.2}>
                {timeline.length ? (
                  timeline.map((item: any, index: number) => (
                    <Stack
                      key={`${item.id || index}-${item.status}`}
                      direction={{ xs: 'column', sm: 'row' }}
                      justifyContent="space-between"
                      sx={{ p: 1.1, border: '1px solid', borderColor: 'divider', borderRadius: 2 }}
                    >
                      <Box>
                        <Typography sx={{ fontWeight: 700 }}>{statusLabel(item.status, t)}</Typography>
                        {item.note ? (
                          <Typography variant="caption" color="text.secondary">
                            {item.note}
                          </Typography>
                        ) : null}
                      </Box>
                      <Typography variant="caption" color="text.secondary">
                        {item.createdAt ? formatDateTime(item.createdAt) : '-'}
                      </Typography>
                    </Stack>
                  ))
                ) : (
                  <Typography color="text.secondary">{statusLabel(order.status, t)}</Typography>
                )}
              </Stack>
            </CardContent>
          </Card>

          <Card className="surface-glass" sx={{ mt: 2 }}>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 1.2 }}>
                {t('orderDetails.requestReturn')}
              </Typography>
              <Stack spacing={1.2}>
                <TextField
                  label={t('orderDetails.returnReason')}
                  value={returnReason}
                  onChange={(event) => setReturnReason(event.target.value)}
                  multiline
                  minRows={3}
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={exchangePreferred}
                      onChange={(event) => setExchangePreferred(event.target.checked)}
                    />
                  }
                  label={t('orderDetails.exchangePreferred')}
                />
                <Button
                  variant="contained"
                  disabled={creatingReturn || !returnReason.trim()}
                  onClick={() => {
                    void runMutation(
                      () =>
                        createReturnRequest({
                          variables: {
                            input: {
                              orderId: Number(order.id),
                              reason: returnReason.trim(),
                              exchangePreferred,
                            },
                          },
                        }),
                      { successMessage: t('orderDetails.returnSuccess') },
                    ).then((result) => {
                      if (!result) {
                        return;
                      }
                      setReturnReason('');
                      setExchangePreferred(false);
                      void refetch();
                    });
                  }}
                >
                  {t('orderDetails.submitReturn')}
                </Button>

                {(order.returnRequests || []).length ? (
                  <Stack spacing={0.8}>
                    {(order.returnRequests || []).map((request: any) => (
                      <Stack
                        key={request.id}
                        direction="row"
                        justifyContent="space-between"
                        alignItems="center"
                        sx={{ p: 1, borderRadius: 1.5, border: '1px solid', borderColor: 'divider' }}
                      >
                        <Typography variant="body2">{request.reason}</Typography>
                        <Chip label={statusLabel(request.status, t)} size="small" />
                      </Stack>
                    ))}
                  </Stack>
                ) : null}
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card className="surface-glass">
            <CardContent>
              <Typography variant="h6" sx={{ mb: 1 }}>
                {t('orderDetails.summary')}
              </Typography>
              <Stack spacing={0.8}>
                <Chip label={statusLabel(order.status, t)} size="small" />
                <Typography>
                  {t('common.subtotal')}: {formatCurrency(Number(order.subtotal || 0))}
                </Typography>
                <Typography>
                  {t('common.discount')}: -{formatCurrency(Number(order.discount || 0))}
                </Typography>
                <Typography>
                  {t('common.shipping')}: {formatCurrency(Number(order.shipping || 0))}
                </Typography>
                <Typography>
                  {t('common.tax')}: {formatCurrency(Number(order.tax || 0))}
                </Typography>
                <Typography variant="h6">
                  {t('common.total')}: {formatCurrency(Number(order.total || 0))}
                </Typography>
                <Typography color="text.secondary">
                  {t('orderDetails.payment')}: {statusLabel(order.payment?.status || '-', t)}
                </Typography>
                <Typography color="text.secondary">
                  {t('orderDetails.shipment')}: {statusLabel(order.shipment?.status || '-', t)}
                </Typography>
                <Typography color="text.secondary">
                  {t('orderDetails.trackingNumber')}: {order.shipment?.trackingNumber || '-'}
                </Typography>
                <Typography color="text.secondary">
                  {t('orderDetails.deliveryInfo')}: {order.shippingAddress}, {order.shippingCity}, {order.shippingRegion}{' '}
                  {order.shippingPostalCode}
                </Typography>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
}
