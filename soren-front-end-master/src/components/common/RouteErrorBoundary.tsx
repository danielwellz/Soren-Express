import { Button, Card, CardContent, Container, Stack, Typography } from '@mui/material';
import React, { ErrorInfo } from 'react';
import { Link as RouterLink } from 'react-router-dom';

type RouteErrorBoundaryState = {
  hasError: boolean;
};

export class RouteErrorBoundary extends React.Component<
  { children: React.ReactNode },
  RouteErrorBoundaryState
> {
  state: RouteErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(): RouteErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Route render error', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <Container maxWidth="md" sx={{ py: 6 }}>
          <Card className="surface-glass">
            <CardContent>
              <Stack spacing={1.2}>
                <Typography variant="h4">Something went wrong</Typography>
                <Typography color="text.secondary">
                  We could not render this page. Please return to a safe route.
                </Typography>
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.2} sx={{ pt: 0.8 }}>
                  <Button component={RouterLink} to="/" variant="contained">
                    Go home
                  </Button>
                  <Button component={RouterLink} to="/products" variant="outlined">
                    Browse products
                  </Button>
                </Stack>
              </Stack>
            </CardContent>
          </Card>
        </Container>
      );
    }

    return this.props.children;
  }
}
