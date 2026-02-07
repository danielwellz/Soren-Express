import { useLazyQuery, useMutation, useQuery } from '@apollo/client';
import {
  Alert,
  Button,
  Card,
  CardContent,
  FormControlLabel,
  MenuItem,
  Checkbox,
  Container,
  Grid,
  Stack,
  Step,
  StepLabel,
  Stepper,
  TextField,
  Typography,
} from '@mui/material';
import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link as RouterLink } from 'react-router-dom';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { EmptyState } from '../components/common/EmptyState';
import { useAnalytics } from '../context/AnalyticsContext';
import { useToast } from '../context/ToastContext';
import {
  CHECKOUT_PREVIEW_QUERY,
  CONFIRM_PAYMENT_MUTATION,
  CREATE_ORDER_MUTATION,
  CREATE_PAYMENT_INTENT_MUTATION,
  MY_ADDRESSES_QUERY,
  MY_CHECKOUT_PROFILE_QUERY,
} from '../graphql/documents';
import { useMutationAction } from '../hooks/useMutationAction';
import { useLocaleFormatters } from '../hooks/useLocaleFormatters';
import { getSessionId } from '../lib/session';

type AddressForm = {
  shippingName: string;
  shippingAddress: string;
  shippingCity: string;
  shippingRegion: string;
  shippingPostalCode: string;
};

type PaymentForm = {
  cardholderName: string;
  cardLast4: string;
  expiry: string;
  cvc: string;
};

function createIdempotencyAttemptKey(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }

  return `attempt_${Date.now()}_${Math.floor(Math.random() * 1_000_000)}`;
}

export function CheckoutPage() {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const runMutation = useMutationAction();
  const sessionId = getSessionId();
  const reducedMotion = useReducedMotion();
  const { formatCurrency } = useLocaleFormatters();
  const { trackEvent } = useAnalytics();

  const steps = useMemo(
    () => [
      t('checkout.steps.address'),
      t('checkout.steps.shippingTax'),
      t('checkout.steps.payment'),
      t('checkout.steps.confirmation'),
    ],
    [t],
  );

  const [step, setStep] = useState(0);
  const [couponCode, setCouponCode] = useState('');
  const [orderId, setOrderId] = useState<number | null>(null);
  const [paymentIntentId, setPaymentIntentId] = useState<string | null>(null);
  const [idempotencyAttemptKey, setIdempotencyAttemptKey] = useState<string>(() =>
    createIdempotencyAttemptKey(),
  );
  const [selectedAddressId, setSelectedAddressId] = useState<number | null>(null);
  const [saveAddress, setSaveAddress] = useState(false);
  const [prefilled, setPrefilled] = useState(false);

  const [address, setAddress] = useState<AddressForm>({
    shippingName: '',
    shippingAddress: '',
    shippingCity: '',
    shippingRegion: 'US-DEFAULT',
    shippingPostalCode: '',
  });

  const [payment, setPayment] = useState<PaymentForm>({
    cardholderName: '',
    cardLast4: '',
    expiry: '',
    cvc: '',
  });

  const { data: addressesData } = useQuery(MY_ADDRESSES_QUERY);
  const { data: checkoutProfileData } = useQuery(MY_CHECKOUT_PROFILE_QUERY);

  const savedAddresses = useMemo(() => addressesData?.myAddresses || [], [addressesData?.myAddresses]);
  const checkoutProfile = checkoutProfileData?.myCheckoutProfile;

  React.useEffect(() => {
    if (prefilled) {
      return;
    }

    const defaultAddress = savedAddresses.find((item: any) => item.isDefault) || savedAddresses[0];

    if (defaultAddress) {
      setSelectedAddressId(Number(defaultAddress.id));
      setAddress({
        shippingName: defaultAddress.fullName || '',
        shippingAddress: defaultAddress.line1 || '',
        shippingCity: defaultAddress.city || '',
        shippingRegion: defaultAddress.region || 'US-DEFAULT',
        shippingPostalCode: defaultAddress.postalCode || '',
      });
    } else if (checkoutProfile) {
      setAddress({
        shippingName: checkoutProfile.shippingName || '',
        shippingAddress: checkoutProfile.shippingLine1 || '',
        shippingCity: checkoutProfile.shippingCity || '',
        shippingRegion: checkoutProfile.shippingRegion || 'US-DEFAULT',
        shippingPostalCode: checkoutProfile.shippingPostalCode || '',
      });
    }

    if (checkoutProfile) {
      setPayment((old) => ({
        ...old,
        cardholderName: checkoutProfile.cardholderName || old.cardholderName,
        cardLast4: checkoutProfile.cardLast4 || old.cardLast4,
        expiry: checkoutProfile.cardExpiry || old.expiry,
      }));
    }

    setPrefilled(true);
  }, [checkoutProfile, prefilled, savedAddresses]);

  const [loadPreview, { data: previewData, loading: previewLoading }] = useLazyQuery(
    CHECKOUT_PREVIEW_QUERY,
    { fetchPolicy: 'network-only' },
  );

  const [createOrder, { loading: creatingOrder }] = useMutation(CREATE_ORDER_MUTATION);
  const [createPaymentIntent, { loading: creatingIntent }] = useMutation(CREATE_PAYMENT_INTENT_MUTATION);
  const [confirmPayment, { loading: confirmingPayment, data: confirmedData }] =
    useMutation(CONFIRM_PAYMENT_MUTATION);

  const totals = previewData?.checkoutPreview?.totals;

  const canContinueAddress = useMemo(() => {
    return Object.values(address).every((value) => String(value).trim().length > 0);
  }, [address]);

  const canConfirmPayment = useMemo(() => {
    return (
      /^\d{4}$/.test(payment.cardLast4) &&
      payment.cardholderName.trim().length > 2 &&
      /^(0[1-9]|1[0-2])\/[0-9]{2}$/.test(payment.expiry) &&
      /^\d{3,4}$/.test(payment.cvc)
    );
  }, [payment]);

  const resetPaymentStep = () => {
    setOrderId(null);
    setPaymentIntentId(null);
    setPayment({
      cardholderName: '',
      cardLast4: '',
      expiry: '',
      cvc: '',
    });
  };

  const runPreview = async () => {
    const result = await runMutation(
      () =>
        loadPreview({
          variables: {
            input: {
              region: address.shippingRegion,
              couponCode: couponCode || undefined,
              sessionId,
            },
          },
        }),
      { errorMessage: t('checkout.errors.preview') },
    );

    if (!result) {
      return;
    }

    resetPaymentStep();
    setIdempotencyAttemptKey(createIdempotencyAttemptKey());
    void trackEvent('begin_checkout', {
      region: address.shippingRegion,
      couponCode: couponCode || null,
    });
    setStep(1);
  };

  const startPaymentStep = async () => {
    const orderResult = await runMutation(
      () =>
        createOrder({
          variables: {
            input: {
              ...address,
              savedAddressId: selectedAddressId || undefined,
              saveAddress,
              couponCode: couponCode || undefined,
              sessionId,
            },
          },
          context: {
            headers: {
              'Idempotency-Key': `${idempotencyAttemptKey}:create-order`,
            },
          },
        }),
      { errorMessage: t('checkout.errors.createOrder') },
    );

    const nextOrderId = orderResult?.data?.createOrder?.id;
    if (!nextOrderId) {
      showToast(t('checkout.errors.orderFailed'), 'error');
      return;
    }

    const intentResult = await runMutation(
      () =>
        createPaymentIntent({
          variables: {
            input: {
              orderId: Number(nextOrderId),
            },
          },
          context: {
            headers: {
              'Idempotency-Key': `${idempotencyAttemptKey}:create-payment-intent`,
            },
          },
        }),
      { errorMessage: t('checkout.errors.intentFailed') },
    );

    const intentId = intentResult?.data?.createPaymentIntent?.payment?.intentId;
    if (!intentId) {
      showToast(t('checkout.errors.intentFailed'), 'error');
      return;
    }

    setOrderId(Number(nextOrderId));
    setPaymentIntentId(intentId);
    setStep(2);
  };

  const submitPayment = async () => {
    if (!paymentIntentId || !orderId) {
      showToast(t('checkout.errors.paymentMissing'), 'error');
      return;
    }

    if (!canConfirmPayment) {
      showToast(t('checkout.errors.paymentValidation'), 'error');
      return;
    }

    const result = await runMutation(
      () =>
        confirmPayment({
          variables: {
            input: {
              intentId: paymentIntentId,
              cardLast4: payment.cardLast4,
              cardholderName: payment.cardholderName,
              cardExpiry: payment.expiry,
            },
          },
          context: {
            headers: {
              'Idempotency-Key': `${idempotencyAttemptKey}:confirm-payment`,
            },
          },
        }),
      {
        successMessage: t('checkout.success.payment'),
        errorMessage: t('checkout.errors.paymentConfirm'),
      },
    );

    if (!result) {
      return;
    }

    void trackEvent('purchase', {
      orderId,
    });
    setStep(3);
  };

  return (
    <Container maxWidth="lg" sx={{ py: { xs: 3, md: 4 } }}>
      <Typography variant="h4" sx={{ mb: 2 }}>
        {t('checkout.title')}
      </Typography>

      <Stepper activeStep={step} alternativeLabel sx={{ mb: 4 }}>
        {steps.map((label) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>

      <Grid container spacing={2}>
        <Grid item xs={12} md={8}>
          <Card className="surface-glass">
            <CardContent>
              <AnimatePresence mode="wait" initial={false}>
                {step === 0 ? (
                  <Stack
                    key="step-address"
                    component={motion.div}
                    initial={reducedMotion ? { opacity: 0 } : { opacity: 0, y: 12 }}
                    animate={reducedMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
                    exit={reducedMotion ? { opacity: 0 } : { opacity: 0, y: -8 }}
                    transition={{ duration: reducedMotion ? 0.01 : 0.24, ease: 'easeOut' }}
                    spacing={2}
                  >
                    <TextField
                      select
                      label={t('checkout.address.selectSaved')}
                      value={selectedAddressId ? String(selectedAddressId) : ''}
                      onChange={(event) => {
                        const nextId = Number(event.target.value);
                        if (!nextId) {
                          setSelectedAddressId(null);
                          return;
                        }

                        const selected = savedAddresses.find((item: any) => Number(item.id) === nextId);
                        setSelectedAddressId(nextId);
                        if (!selected) {
                          return;
                        }

                        setAddress({
                          shippingName: selected.fullName || '',
                          shippingAddress: selected.line1 || '',
                          shippingCity: selected.city || '',
                          shippingRegion: selected.region || 'US-DEFAULT',
                          shippingPostalCode: selected.postalCode || '',
                        });
                      }}
                    >
                      <MenuItem value="">{t('common.optional')}</MenuItem>
                      {savedAddresses.map((saved: any) => (
                        <MenuItem key={saved.id} value={String(saved.id)}>
                          {saved.label || saved.fullName}
                        </MenuItem>
                      ))}
                    </TextField>
                    <TextField
                      label={t('checkout.address.fullName')}
                      inputProps={{ 'data-testid': 'checkout-shipping-name' }}
                      value={address.shippingName}
                      onChange={(event) =>
                        {
                          setSelectedAddressId(null);
                          setAddress((old) => ({ ...old, shippingName: event.target.value }));
                        }
                      }
                    />
                    <TextField
                      label={t('checkout.address.address')}
                      inputProps={{ 'data-testid': 'checkout-shipping-address' }}
                      value={address.shippingAddress}
                      onChange={(event) =>
                        {
                          setSelectedAddressId(null);
                          setAddress((old) => ({ ...old, shippingAddress: event.target.value }));
                        }
                      }
                    />
                    <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
                      <TextField
                        fullWidth
                        label={t('checkout.address.city')}
                        inputProps={{ 'data-testid': 'checkout-shipping-city' }}
                        value={address.shippingCity}
                        onChange={(event) =>
                          {
                            setSelectedAddressId(null);
                            setAddress((old) => ({ ...old, shippingCity: event.target.value }));
                          }
                        }
                      />
                      <TextField
                        fullWidth
                        label={t('checkout.address.region')}
                        inputProps={{ 'data-testid': 'checkout-shipping-region' }}
                        helperText={t('checkout.address.regionHint')}
                        value={address.shippingRegion}
                        onChange={(event) =>
                          {
                            setSelectedAddressId(null);
                            setAddress((old) => ({ ...old, shippingRegion: event.target.value }));
                          }
                        }
                      />
                      <TextField
                        fullWidth
                        label={t('checkout.address.postalCode')}
                        inputProps={{ 'data-testid': 'checkout-shipping-postal' }}
                        value={address.shippingPostalCode}
                        onChange={(event) =>
                          {
                            setSelectedAddressId(null);
                            setAddress((old) => ({ ...old, shippingPostalCode: event.target.value }));
                          }
                        }
                      />
                    </Stack>
                    <TextField
                      label={t('checkout.address.coupon')}
                      inputProps={{ 'data-testid': 'checkout-coupon' }}
                      value={couponCode}
                      onChange={(event) => setCouponCode(event.target.value.toUpperCase())}
                    />
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={saveAddress}
                          onChange={(event) => setSaveAddress(event.target.checked)}
                        />
                      }
                      label={t('checkout.address.saveAddress')}
                    />
                    <Button
                      data-testid="checkout-address-next"
                      variant="contained"
                      disabled={!canContinueAddress || previewLoading}
                      onClick={() => {
                        void runPreview();
                      }}
                    >
                      {t('checkout.address.continue')}
                    </Button>
                  </Stack>
                ) : null}

                {step === 1 ? (
                  <Stack
                    key="step-shipping-tax"
                    component={motion.div}
                    initial={reducedMotion ? { opacity: 0 } : { opacity: 0, y: 12 }}
                    animate={reducedMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
                    exit={reducedMotion ? { opacity: 0 } : { opacity: 0, y: -8 }}
                    transition={{ duration: reducedMotion ? 0.01 : 0.24, ease: 'easeOut' }}
                    spacing={1.2}
                  >
                    <Typography variant="h6" component="h2">
                      {t('checkout.shippingTax.title')}
                    </Typography>
                    {previewLoading ? <Typography>{t('checkout.shippingTax.calculating')}</Typography> : null}
                    {totals ? (
                      <>
                        <Typography>
                          {t('common.subtotal')}: {formatCurrency(Number(totals.subtotal || 0))}
                        </Typography>
                        <Typography>
                          {t('common.discount')}: -{formatCurrency(Number(totals.discount || 0))}
                        </Typography>
                        <Typography>
                          {t('common.shipping')}: {formatCurrency(Number(totals.shipping || 0))}
                        </Typography>
                        <Typography>
                          {t('common.tax')}: {formatCurrency(Number(totals.tax || 0))}
                        </Typography>
                        <Typography variant="h6" component="p">
                          {t('common.total')}: {formatCurrency(Number(totals.total || 0))}
                        </Typography>
                      </>
                    ) : (
                      <EmptyState
                        title={t('checkout.shippingTax.emptyTitle')}
                        description={t('checkout.shippingTax.emptyDescription')}
                      />
                    )}

                    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.2} sx={{ pt: 0.6 }}>
                      <Button
                        variant="outlined"
                        onClick={() => {
                          resetPaymentStep();
                          setStep(0);
                        }}
                      >
                        {t('checkout.shippingTax.back')}
                      </Button>
                      <Button
                        data-testid="checkout-shipping-next"
                        variant="contained"
                        disabled={!totals || creatingOrder || creatingIntent || confirmingPayment}
                        onClick={() => {
                          void startPaymentStep();
                        }}
                      >
                        {t('checkout.shippingTax.continue')}
                      </Button>
                    </Stack>
                  </Stack>
                ) : null}

                {step === 2 ? (
                  <Stack
                    key="step-payment"
                    component={motion.div}
                    initial={reducedMotion ? { opacity: 0 } : { opacity: 0, y: 12 }}
                    animate={reducedMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
                    exit={reducedMotion ? { opacity: 0 } : { opacity: 0, y: -8 }}
                    transition={{ duration: reducedMotion ? 0.01 : 0.24, ease: 'easeOut' }}
                    spacing={1.2}
                  >
                    <Typography variant="h6" component="h2">
                      {t('checkout.payment.title')}
                    </Typography>
                    {!paymentIntentId || !orderId ? (
                      <Alert severity="error">{t('checkout.payment.sessionMissing')}</Alert>
                    ) : null}

                    <TextField
                      label={t('checkout.payment.cardholder')}
                      inputProps={{ 'data-testid': 'checkout-payment-cardholder' }}
                      value={payment.cardholderName}
                      onChange={(event) =>
                        setPayment((old) => ({ ...old, cardholderName: event.target.value }))
                      }
                    />
                    <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
                      <TextField
                        fullWidth
                        label={t('checkout.payment.last4')}
                        inputProps={{ 'data-testid': 'checkout-payment-last4' }}
                        value={payment.cardLast4}
                        onChange={(event) =>
                          setPayment((old) => ({
                            ...old,
                            cardLast4: event.target.value.replace(/\D/g, '').slice(0, 4),
                          }))
                        }
                        helperText={t('checkout.payment.last4Hint')}
                      />
                      <TextField
                        fullWidth
                        label={t('checkout.payment.expiry')}
                        inputProps={{ 'data-testid': 'checkout-payment-expiry' }}
                        value={payment.expiry}
                        onChange={(event) =>
                          setPayment((old) => ({ ...old, expiry: event.target.value.slice(0, 5) }))
                        }
                      />
                      <TextField
                        fullWidth
                        label={t('checkout.payment.cvc')}
                        inputProps={{ 'data-testid': 'checkout-payment-cvc' }}
                        value={payment.cvc}
                        onChange={(event) =>
                          setPayment((old) => ({
                            ...old,
                            cvc: event.target.value.replace(/\D/g, '').slice(0, 4),
                          }))
                        }
                      />
                    </Stack>
                    <Typography color="text.secondary">
                      {t('checkout.payment.processing', {
                        orderId: orderId || '-',
                      })}
                    </Typography>

                    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.2} sx={{ pt: 0.6 }}>
                      <Button variant="outlined" disabled={confirmingPayment} onClick={() => setStep(1)}>
                        {t('checkout.payment.back')}
                      </Button>
                      <Button
                        data-testid="checkout-payment-confirm"
                        variant="contained"
                        disabled={!canConfirmPayment || !paymentIntentId || confirmingPayment}
                        onClick={() => {
                          void submitPayment();
                        }}
                      >
                        {t('checkout.payment.confirm')}
                      </Button>
                    </Stack>
                  </Stack>
                ) : null}

                {step === 3 ? (
                  <Stack
                    key="step-confirmation"
                    component={motion.div}
                    initial={reducedMotion ? { opacity: 0 } : { opacity: 0, y: 12 }}
                    animate={reducedMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
                    exit={reducedMotion ? { opacity: 0 } : { opacity: 0, y: -8 }}
                    transition={{ duration: reducedMotion ? 0.01 : 0.24, ease: 'easeOut' }}
                    spacing={1.5}
                  >
                    <Typography variant="h5">{t('checkout.confirmation.title')}</Typography>
                    <Typography color="text.secondary">{t('checkout.confirmation.description')}</Typography>
                    <Typography>
                      {t('checkout.confirmation.orderId', {
                        orderId: confirmedData?.confirmPayment?.order?.id || orderId,
                      })}
                    </Typography>
                    <Typography>
                      {t('checkout.confirmation.paymentStatus', {
                        status: confirmedData?.confirmPayment?.payment?.status || 'SUCCEEDED',
                      })}
                    </Typography>
                    <Button component={RouterLink} to="/account" variant="contained">
                      {t('checkout.confirmation.viewOrders')}
                    </Button>
                  </Stack>
                ) : null}
              </AnimatePresence>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card className="surface-glass">
            <CardContent>
              <Typography variant="h6" component="h2" sx={{ mb: 1.2 }}>
                {t('checkout.demo.title')}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                {t('checkout.demo.description1')}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {t('checkout.demo.description2')}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
}
