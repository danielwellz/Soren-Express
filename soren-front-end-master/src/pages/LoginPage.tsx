import { Alert, Box, Button, Card, CardContent, Container, Stack, TextField, Typography } from '@mui/material';
import React, { useEffect, useState } from 'react';
import { Link as RouterLink, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const SHOW_DEMO_DEFAULTS =
  process.env.NODE_ENV !== 'production' &&
  process.env.REACT_APP_ENABLE_DEMO_LOGIN_DEFAULTS === 'true';

export function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, login } = useAuth();

  const [email, setEmail] = useState(SHOW_DEMO_DEFAULTS ? 'admin@soren.store' : '');
  const [password, setPassword] = useState(SHOW_DEMO_DEFAULTS ? 'Admin123!' : '');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const from = (location.state as any)?.from || '/account';

  useEffect(() => {
    if (isAuthenticated) {
      navigate(from, { replace: true });
    }
  }, [from, isAuthenticated, navigate]);

  const onSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      await login({ email, password });
    } catch (submitError: any) {
      setError(submitError.message || 'Unable to login');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Container maxWidth="sm" sx={{ py: 6 }}>
      <Card className="surface-glass">
        <CardContent>
          <Typography variant="h4" sx={{ mb: 1 }}>
            Welcome back
          </Typography>
          <Typography color="text.secondary" sx={{ mb: 3 }}>
            Sign in to manage your orders and checkout.
          </Typography>

          {error ? <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert> : null}

          <Box component="form" onSubmit={onSubmit}>
            <Stack spacing={2}>
              <TextField
                label="Email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
              />
              <TextField
                label="Password"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
              />

              <Button type="submit" variant="contained" size="large" disabled={submitting}>
                {submitting ? 'Signing in...' : 'Sign in'}
              </Button>

              <Typography variant="body2" color="text.secondary">
                Need an account? <RouterLink to="/auth/register">Register</RouterLink>
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Forgot password? <RouterLink to="/auth/forgot-password">Reset</RouterLink>
              </Typography>
            </Stack>
          </Box>
        </CardContent>
      </Card>
    </Container>
  );
}
