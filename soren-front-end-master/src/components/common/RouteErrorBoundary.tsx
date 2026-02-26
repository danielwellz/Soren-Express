import { Button, Card, CardContent, Container, Stack, Typography } from '@mui/material';
import React, { ErrorInfo } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import i18n from '../../i18n';

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
                <Typography variant="h4">{i18n.t('common.somethingWentWrong')}</Typography>
                <Typography color="text.secondary">
                  {i18n.t('errors.default')}
                </Typography>
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.2} sx={{ pt: 0.8 }}>
                  <Button component={RouterLink} to="/" variant="contained">
                    {i18n.t('common.goHome')}
                  </Button>
                  <Button component={RouterLink} to="/products" variant="outlined">
                    {i18n.t('common.browseProducts')}
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
