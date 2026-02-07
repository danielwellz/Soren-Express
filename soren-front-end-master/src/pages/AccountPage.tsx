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
import { Link as RouterLink } from 'react-router-dom';
import { EmptyState } from '../components/common/EmptyState';
import { ME_QUERY, MY_ORDERS_QUERY } from '../graphql/documents';

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

export function AccountPage() {
  const { data: meData } = useQuery(ME_QUERY);
  const { data, loading } = useQuery(MY_ORDERS_QUERY);

  const user = meData?.me;
  const orders = data?.myOrders || [];

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" sx={{ mb: 2.5 }}>
        My account
      </Typography>

      <Grid container spacing={2}>
        <Grid item xs={12} md={4}>
          <Card className="surface-glass">
            <CardContent>
              <Typography variant="h6">Profile</Typography>
              <Stack spacing={0.8} sx={{ mt: 1.5 }}>
                <Typography><strong>Name:</strong> {user?.fullName || '-'}</Typography>
                <Typography><strong>Email:</strong> {user?.email || '-'}</Typography>
                <Typography><strong>Phone:</strong> {user?.phone || '-'}</Typography>
                <Typography><strong>Address:</strong> {user?.address || '-'}</Typography>
                <Typography><strong>Role:</strong> {user?.role || '-'}</Typography>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={8}>
          <Card className="surface-glass">
            <CardContent>
              <Typography variant="h6" sx={{ mb: 1.2 }}>
                Order history
              </Typography>
              {loading ? <Typography>Loading orders...</Typography> : null}
              {!loading && !orders.length ? (
                <EmptyState
                  title="No orders yet"
                  description="Your completed checkouts will appear here."
                />
              ) : null}

              {!loading && orders.length ? (
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
                        primary={`Order #${order.id}`}
                        secondary={`${new Date(order.createdAt).toLocaleString()} • ${order.items.length} items`}
                      />
                      <Stack alignItems="flex-end" spacing={0.7}>
                        <Chip label={order.status} color={statusColor(order.status)} size="small" />
                        <Typography variant="subtitle2">${Number(order.total).toFixed(2)}</Typography>
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
