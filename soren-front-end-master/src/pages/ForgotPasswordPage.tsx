import { Alert, Box, Button, Card, CardContent, Container, Stack, TextField, Typography } from '@mui/material';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link as RouterLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export function ForgotPasswordPage() {
  const { t } = useTranslation();
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
      setError(submitError.message || t('auth.errors.forgot'));
    }
  };

  return (
    <Container maxWidth="sm" sx={{ py: 6 }}>
      <Card className="surface-glass">
        <CardContent>
          <Typography variant="h4" sx={{ mb: 1 }}>
            {t('auth.forgotTitle')}
          </Typography>
          <Typography color="text.secondary" sx={{ mb: 3 }}>
            {t('auth.forgotSubtitle')}
          </Typography>

          {done ? (
            <Alert severity="success" sx={{ mb: 2 }}>
              {t('auth.forgotSuccess')}
            </Alert>
          ) : null}
          {error ? <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert> : null}

          <Box component="form" onSubmit={onSubmit}>
            <Stack spacing={2}>
              <TextField
                label={t('auth.email')}
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
              />
              <Button type="submit" variant="contained">
                {t('auth.sendReset')}
              </Button>
              <Typography variant="body2" color="text.secondary">
                {t('auth.backToLogin')} <RouterLink to="/auth/login">{t('nav.login')}</RouterLink>
              </Typography>
            </Stack>
          </Box>
        </CardContent>
      </Card>
    </Container>
  );
}
