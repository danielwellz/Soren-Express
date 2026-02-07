import { useQuery } from '@apollo/client';
import {
  Card,
  CardContent,
  Chip,
  Container,
  Grid,
  List,
  ListItem,
  ListItemText,
  Stack,
  Typography,
} from '@mui/material';
import React from 'react';
import { Link as RouterLink, useParams } from 'react-router-dom';
import { ORDER_BY_ID_QUERY } from '../graphql/documents';

export function OrderDetailsPage() {
  const { id } = useParams();

  const { data, loading } = useQuery(ORDER_BY_ID_QUERY, {
    variables: { id: Number(id) },
    skip: !id,
  });

  const order = data?.orderById;

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Typography>Loading order...</Typography>
      </Container>
    );
  }

  if (!order) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Typography>Order not found</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
        <Typography variant="h4">Order #{order.id}</Typography>
        <Typography component={RouterLink} to="/account" sx={{ textDecoration: 'none' }}>
          Back to account
        </Typography>
      </Stack>

      <Grid container spacing={2}>
        <Grid item xs={12} md={8}>
          <Card className="surface-glass">
            <CardContent>
              <Typography variant="h6" sx={{ mb: 1 }}>
                Items
              </Typography>
              <List disablePadding>
                {order.items.map((item: any) => (
                  <ListItem key={item.id} divider>
                    <ListItemText
                      primary={`${item.productName} (${item.variantLabel})`}
                      secondary={`SKU ${item.sku} • Qty ${item.quantity}`}
                    />
                    <Typography>${Number(item.lineTotal).toFixed(2)}</Typography>
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card className="surface-glass">
            <CardContent>
              <Typography variant="h6" sx={{ mb: 1 }}>
                Summary
              </Typography>
              <Stack spacing={0.8}>
                <Chip label={order.status} size="small" />
                <Typography>Subtotal: ${Number(order.subtotal).toFixed(2)}</Typography>
                <Typography>Discount: -${Number(order.discount).toFixed(2)}</Typography>
                <Typography>Shipping: ${Number(order.shipping).toFixed(2)}</Typography>
                <Typography>Tax: ${Number(order.tax).toFixed(2)}</Typography>
                <Typography variant="h6">Total: ${Number(order.total).toFixed(2)}</Typography>
                <Typography color="text.secondary">Payment: {order.payment?.status || '-'}</Typography>
                <Typography color="text.secondary">Shipment: {order.shipment?.status || '-'}</Typography>
                <Typography color="text.secondary">
                  Address: {order.shippingAddress}, {order.shippingCity}, {order.shippingRegion} {order.shippingPostalCode}
                </Typography>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
}
