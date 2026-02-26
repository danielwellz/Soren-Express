import {
  Box,
  Button,
  Chip,
  Container,
  Grid,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import VerifiedUserRoundedIcon from '@mui/icons-material/VerifiedUserRounded';
import ReplayRoundedIcon from '@mui/icons-material/ReplayRounded';
import SupportAgentRoundedIcon from '@mui/icons-material/SupportAgentRounded';
import React, { useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { useMutation } from '@apollo/client';
import { useTranslation } from 'react-i18next';
import { SUBSCRIBE_NEWSLETTER_MUTATION } from '../../graphql/documents';
import { useMutationAction } from '../../hooks/useMutationAction';

const footerLinkSx = {
  color: 'inherit',
  textDecoration: 'none',
  transition: 'color 160ms ease',
  '&:hover': {
    color: 'secondary.main',
  },
};

export function Footer() {
  const { t } = useTranslation();
  const runMutation = useMutationAction();
  const [email, setEmail] = useState('');

  const [subscribeNewsletter, { loading: isSubscribing }] = useMutation(
    SUBSCRIBE_NEWSLETTER_MUTATION,
  );

  const trustItems = [
    { icon: <VerifiedUserRoundedIcon fontSize="small" />, label: t('footer.trust.securePayments') },
    { icon: <ReplayRoundedIcon fontSize="small" />, label: t('footer.trust.moneyBack') },
    { icon: <SupportAgentRoundedIcon fontSize="small" />, label: t('footer.trust.support') },
  ];

  const paymentMethods = [
    t('footer.paymentBadges.visa'),
    t('footer.paymentBadges.mastercard'),
    t('footer.paymentBadges.paypal'),
    t('footer.paymentBadges.applePay'),
  ];

  return (
    <Box
      component="footer"
      sx={{
        mt: { xs: 8, md: 10 },
        pt: 6,
        pb: 4,
        color: 'common.white',
        background: (theme) =>
          `linear-gradient(120deg, ${theme.palette.primary.dark} 0%, ${theme.palette.primary.main} 42%, ${theme.palette.secondary.main} 100%)`,
      }}
    >
      <Container maxWidth="xl">
        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <Stack spacing={1.2}>
              <Typography variant="h5" sx={{ fontWeight: 800 }}>
                {t('meta.appName')}
              </Typography>
              <Typography sx={{ color: (theme) => alpha(theme.palette.common.white, 0.86) }}>
                {t('footer.about')}
              </Typography>

              <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                {trustItems.map((item) => (
                  <Chip
                    key={item.label}
                    icon={item.icon}
                    label={item.label}
                    sx={{
                      bgcolor: (theme) => alpha(theme.palette.common.white, 0.14),
                      color: 'common.white',
                      border: (theme) => `1px solid ${alpha(theme.palette.common.white, 0.24)}`,
                    }}
                  />
                ))}
              </Stack>
            </Stack>
          </Grid>

          <Grid item xs={6} md={2}>
            <Stack spacing={1}>
              <Typography variant="subtitle1">{t('footer.shop')}</Typography>
              <Typography component={RouterLink} to="/" sx={footerLinkSx}>
                {t('nav.home')}
              </Typography>
              <Typography component={RouterLink} to="/products" sx={footerLinkSx}>
                {t('nav.products')}
              </Typography>
              <Typography component={RouterLink} to="/cart" sx={footerLinkSx}>
                {t('nav.cart')}
              </Typography>
            </Stack>
          </Grid>

          <Grid item xs={6} md={2}>
            <Stack spacing={1}>
              <Typography variant="subtitle1">{t('footer.account')}</Typography>
              <Typography component={RouterLink} to="/account" sx={footerLinkSx}>
                {t('nav.account')}
              </Typography>
              <Typography component={RouterLink} to="/wishlist" sx={footerLinkSx}>
                {t('nav.wishlist')}
              </Typography>
              <Typography component={RouterLink} to="/compare" sx={footerLinkSx}>
                {t('nav.compare')}
              </Typography>
            </Stack>
          </Grid>

          <Grid item xs={12} md={4}>
            <Stack spacing={1}>
              <Typography variant="subtitle1">{t('home.newsletterTitle')}</Typography>
              <Typography variant="body2" sx={{ color: (theme) => alpha(theme.palette.common.white, 0.86) }}>
                {t('home.newsletterDescription')}
              </Typography>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
                <TextField
                  fullWidth
                  size="small"
                  value={email}
                  label={t('newsletter.emailLabel')}
                  onChange={(event) => setEmail(event.target.value)}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      bgcolor: (theme) => alpha(theme.palette.common.white, 0.14),
                    },
                    '& .MuiInputLabel-root': {
                      color: (theme) => alpha(theme.palette.common.white, 0.84),
                    },
                    '& .MuiOutlinedInput-input': {
                      color: 'common.white',
                    },
                  }}
                />
                <Button
                  variant="contained"
                  color="secondary"
                  disabled={isSubscribing || !email.trim()}
                  onClick={() => {
                    void runMutation(
                      () =>
                        subscribeNewsletter({
                          variables: {
                            input: {
                              email: email.trim(),
                            },
                          },
                        }),
                      { successMessage: t('newsletter.success'), errorMessage: t('newsletter.error') },
                    ).then((result) => {
                      if (!result) {
                        return;
                      }
                      setEmail('');
                    });
                  }}
                >
                  {t('newsletter.cta')}
                </Button>
              </Stack>

              <Typography variant="caption" sx={{ color: (theme) => alpha(theme.palette.common.white, 0.84) }}>
                {t('footer.paymentMethods')}: {paymentMethods.join(' • ')}
              </Typography>
            </Stack>
          </Grid>
        </Grid>

        <Typography
          variant="caption"
          sx={{ display: 'block', mt: 4, color: (theme) => alpha(theme.palette.common.white, 0.72) }}
        >
          {t('footer.copyright', { year: new Date().getFullYear() })}
        </Typography>
      </Container>
    </Box>
  );
}
