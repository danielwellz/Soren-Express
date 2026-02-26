import { Alert, Box, Button, Card, CardContent, Container, Stack, TextField, Typography } from '@mui/material';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link as RouterLink, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const SHOW_DEMO_DEFAULTS =
  process.env.NODE_ENV !== 'production' &&
  process.env.REACT_APP_ENABLE_DEMO_LOGIN_DEFAULTS === 'true';

export function LoginPage() {
  const { t } = useTranslation();
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
      setError(submitError.message || t('auth.errors.login'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Container maxWidth="sm" sx={{ py: 6 }}>
      <Card className="surface-glass">
        <CardContent>
          <Typography variant="h4" sx={{ mb: 1 }}>
            {t('auth.welcomeBack')}
          </Typography>
          <Typography color="text.secondary" sx={{ mb: 3 }}>
            {t('auth.loginSubtitle')}
          </Typography>

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
              <TextField
                label={t('auth.password')}
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
              />

              <Button type="submit" variant="contained" size="large" disabled={submitting}>
                {submitting ? t('auth.signingIn') : t('auth.signIn')}
              </Button>

              <Typography variant="body2" color="text.secondary">
                {t('auth.needAccount')} <RouterLink to="/auth/register">{t('nav.register')}</RouterLink>
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {t('auth.forgotPassword')} <RouterLink to="/auth/forgot-password">{t('auth.reset')}</RouterLink>
              </Typography>
            </Stack>
          </Box>
        </CardContent>
      </Card>
    </Container>
  );
}
