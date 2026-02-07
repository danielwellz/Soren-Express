import { Alert, Box, Button, Card, CardContent, Container, Stack, TextField, Typography } from '@mui/material';
import React, { useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export function ForgotPasswordPage() {
  const { forgotPassword } = useAuth();

  const [email, setEmail] = useState('');
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');

  const onSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');

    try {
      await forgotPassword(email);
      setDone(true);
    } catch (submitError: any) {
      setError(submitError.message || 'Unable to process request');
    }
  };

  return (
    <Container maxWidth="sm" sx={{ py: 6 }}>
      <Card className="surface-glass">
        <CardContent>
          <Typography variant="h4" sx={{ mb: 1 }}>
            Forgot password
          </Typography>
          <Typography color="text.secondary" sx={{ mb: 3 }}>
            Demo mode returns success without exposing account existence.
          </Typography>

          {done ? (
            <Alert severity="success" sx={{ mb: 2 }}>
              If the email exists, a reset message has been simulated.
            </Alert>
          ) : null}
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
              <Button type="submit" variant="contained">
                Send reset instructions
              </Button>
              <Typography variant="body2" color="text.secondary">
                Back to <RouterLink to="/auth/login">Login</RouterLink>
              </Typography>
            </Stack>
          </Box>
        </CardContent>
      </Card>
    </Container>
  );
}
