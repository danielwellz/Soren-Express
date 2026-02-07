import { Alert, Box, Button, Card, CardContent, Container, Stack, TextField, Typography } from '@mui/material';
import React, { useState } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export function RegisterPage() {
  const navigate = useNavigate();
  const { register } = useAuth();

  const [form, setForm] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const onSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      await register(form);
      navigate('/account', { replace: true });
    } catch (submitError: any) {
      setError(submitError.message || 'Unable to register');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Container maxWidth="sm" sx={{ py: 6 }}>
      <Card className="surface-glass">
        <CardContent>
          <Typography variant="h4" sx={{ mb: 1 }}>
            Create account
          </Typography>
          <Typography color="text.secondary" sx={{ mb: 3 }}>
            Get order tracking and faster checkout.
          </Typography>

          {error ? <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert> : null}

          <Box component="form" onSubmit={onSubmit}>
            <Stack spacing={2}>
              <TextField
                label="Full name"
                value={form.fullName}
                onChange={(event) => setForm((old) => ({ ...old, fullName: event.target.value }))}
                required
              />
              <TextField
                label="Email"
                type="email"
                value={form.email}
                onChange={(event) => setForm((old) => ({ ...old, email: event.target.value }))}
                required
              />
              <TextField
                label="Phone"
                value={form.phone}
                onChange={(event) => setForm((old) => ({ ...old, phone: event.target.value }))}
              />
              <TextField
                label="Password"
                type="password"
                helperText="At least 8 characters"
                value={form.password}
                onChange={(event) => setForm((old) => ({ ...old, password: event.target.value }))}
                required
              />

              <Button type="submit" variant="contained" size="large" disabled={submitting}>
                {submitting ? 'Creating account...' : 'Register'}
              </Button>

              <Typography variant="body2" color="text.secondary">
                Already have an account? <RouterLink to="/auth/login">Login</RouterLink>
              </Typography>
            </Stack>
          </Box>
        </CardContent>
      </Card>
    </Container>
  );
}
