import { useLazyQuery, useMutation } from '@apollo/client';
import {
  Alert,
  Button,
  Card,
  CardContent,
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
import { Link as RouterLink } from 'react-router-dom';
import { EmptyState } from '../components/common/EmptyState';
import { useToast } from '../context/ToastContext';
import {
  CHECKOUT_PREVIEW_QUERY,
  CONFIRM_PAYMENT_MUTATION,
  CREATE_ORDER_MUTATION,
  CREATE_PAYMENT_INTENT_MUTATION,
} from '../graphql/documents';
import { AnimatePresence, motion } from 'framer-motion';
import { useMutationAction } from '../hooks/useMutationAction';
import { getSessionId } from '../lib/session';

const STEPS = ['Address', 'Shipping/Tax', 'Payment', 'Confirmation'];

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

export function CheckoutPage() {
  const { showToast } = useToast();
  const runMutation = useMutationAction();
  const sessionId = getSessionId();

  const [step, setStep] = useState(0);
  const [couponCode, setCouponCode] = useState('');
  const [orderId, setOrderId] = useState<number | null>(null);
  const [paymentIntentId, setPaymentIntentId] = useState<string | null>(null);

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
      { errorMessage: 'Unable to calculate shipping and tax.' },
    );

    if (!result) {
      return;
    }

    resetPaymentStep();
    setStep(1);
  };

  const startPaymentStep = async () => {
    const orderResult = await runMutation(
      () =>
        createOrder({
          variables: {
            input: {
              ...address,
              couponCode: couponCode || undefined,
              sessionId,
            },
          },
        }),
      { errorMessage: 'Unable to create order.' },
    );

    const nextOrderId = orderResult?.data?.createOrder?.id;
    if (!nextOrderId) {
      showToast('Order creation failed.', 'error');
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
        }),
      { errorMessage: 'Unable to initialize payment.' },
    );

    const intentId = intentResult?.data?.createPaymentIntent?.payment?.intentId;
    if (!intentId) {
      showToast('Payment setup failed.', 'error');
      return;
    }

    setOrderId(Number(nextOrderId));
    setPaymentIntentId(intentId);
    setStep(2);
  };

  const submitPayment = async () => {
    if (!paymentIntentId || !orderId) {
      showToast('Payment intent is missing. Please retry from shipping/tax.', 'error');
      return;
    }

    if (!canConfirmPayment) {
      showToast('Enter valid payment details before confirming.', 'error');
      return;
    }

    const result = await runMutation(
      () =>
        confirmPayment({
          variables: {
            input: {
              intentId: paymentIntentId,
              cardLast4: payment.cardLast4,
            },
          },
        }),
      {
        successMessage: 'Payment succeeded in Demo Mode',
        errorMessage: 'Payment confirmation failed.',
      },
    );

    if (!result) {
      return;
    }

    setStep(3);
  };

  return (
    <Container maxWidth="lg" sx={{ py: { xs: 3, md: 4 } }}>
      <Typography variant="h4" sx={{ mb: 2 }}>
        Checkout
      </Typography>

      <Stepper activeStep={step} alternativeLabel sx={{ mb: 4 }}>
        {STEPS.map((label) => (
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
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.24, ease: 'easeOut' }}
                  spacing={2}
                >
                  <TextField
                    label="Full name"
                    inputProps={{ 'data-testid': 'checkout-shipping-name' }}
                    value={address.shippingName}
                    onChange={(event) =>
                      setAddress((old) => ({ ...old, shippingName: event.target.value }))
                    }
                  />
                  <TextField
                    label="Address"
                    inputProps={{ 'data-testid': 'checkout-shipping-address' }}
                    value={address.shippingAddress}
                    onChange={(event) =>
                      setAddress((old) => ({ ...old, shippingAddress: event.target.value }))
                    }
                  />
                  <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
                    <TextField
                      fullWidth
                      label="City"
                      inputProps={{ 'data-testid': 'checkout-shipping-city' }}
                      value={address.shippingCity}
                      onChange={(event) =>
                        setAddress((old) => ({ ...old, shippingCity: event.target.value }))
                      }
                    />
                    <TextField
                      fullWidth
                      label="Region"
                      inputProps={{ 'data-testid': 'checkout-shipping-region' }}
                      helperText="Use seeded regions: US-CA, US-NY, US-TX, US-DEFAULT"
                      value={address.shippingRegion}
                      onChange={(event) =>
                        setAddress((old) => ({ ...old, shippingRegion: event.target.value }))
                      }
                    />
                    <TextField
                      fullWidth
                      label="Postal code"
                      inputProps={{ 'data-testid': 'checkout-shipping-postal' }}
                      value={address.shippingPostalCode}
                      onChange={(event) =>
                        setAddress((old) => ({ ...old, shippingPostalCode: event.target.value }))
                      }
                    />
                  </Stack>
                  <TextField
                    label="Coupon code (optional)"
                    inputProps={{ 'data-testid': 'checkout-coupon' }}
                    value={couponCode}
                    onChange={(event) => setCouponCode(event.target.value.toUpperCase())}
                  />
                  <Button
                    data-testid="checkout-address-next"
                    variant="contained"
                    disabled={!canContinueAddress || previewLoading}
                    onClick={() => {
                      void runPreview();
                    }}
                  >
                    Continue to shipping/tax
                  </Button>
                </Stack>
              ) : null}

              {step === 1 ? (
                <Stack
                  key="step-shipping-tax"
                  component={motion.div}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.24, ease: 'easeOut' }}
                  spacing={1.2}
                >
                  <Typography variant="h6" component="h2">Shipping and tax preview</Typography>
                  {previewLoading ? <Typography>Calculating...</Typography> : null}
                  {totals ? (
                    <>
                      <Typography>Subtotal: ${Number(totals.subtotal).toFixed(2)}</Typography>
                      <Typography>Discount: -${Number(totals.discount).toFixed(2)}</Typography>
                      <Typography>Shipping: ${Number(totals.shipping).toFixed(2)}</Typography>
                      <Typography>Tax: ${Number(totals.tax).toFixed(2)}</Typography>
                      <Typography variant="h6" component="p">Total: ${Number(totals.total).toFixed(2)}</Typography>
                    </>
                  ) : (
                    <EmptyState
                      title="No cart available"
                      description="Add items to cart first."
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
                      Back to address
                    </Button>
                    <Button
                      data-testid="checkout-shipping-next"
                      variant="contained"
                      disabled={!totals || creatingOrder || creatingIntent || confirmingPayment}
                      onClick={() => {
                        void startPaymentStep();
                      }}
                    >
                      Continue to payment
                    </Button>
                  </Stack>
                </Stack>
              ) : null}

              {step === 2 ? (
                <Stack
                  key="step-payment"
                  component={motion.div}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.24, ease: 'easeOut' }}
                  spacing={1.2}
                >
                  <Typography variant="h6" component="h2">Payment details</Typography>
                  {!paymentIntentId || !orderId ? (
                    <Alert severity="error">
                      Payment session is missing. Go back to shipping/tax and try again.
                    </Alert>
                  ) : null}

                  <TextField
                    label="Cardholder name"
                    inputProps={{ 'data-testid': 'checkout-payment-cardholder' }}
                    value={payment.cardholderName}
                    onChange={(event) =>
                      setPayment((old) => ({ ...old, cardholderName: event.target.value }))
                    }
                  />
                  <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
                    <TextField
                      fullWidth
                      label="Card last 4"
                      inputProps={{ 'data-testid': 'checkout-payment-last4' }}
                      value={payment.cardLast4}
                      onChange={(event) =>
                        setPayment((old) => ({
                          ...old,
                          cardLast4: event.target.value.replace(/\D/g, '').slice(0, 4),
                        }))
                      }
                      helperText="Demo provider: any 4 digits"
                    />
                    <TextField
                      fullWidth
                      label="Expiry (MM/YY)"
                      inputProps={{ 'data-testid': 'checkout-payment-expiry' }}
                      value={payment.expiry}
                      onChange={(event) =>
                        setPayment((old) => ({ ...old, expiry: event.target.value.slice(0, 5) }))
                      }
                    />
                    <TextField
                      fullWidth
                      label="CVC"
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
                    Processing order #{orderId || '-'} with FakePay provider.
                  </Typography>

                  <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.2} sx={{ pt: 0.6 }}>
                    <Button
                      variant="outlined"
                      disabled={confirmingPayment}
                      onClick={() => setStep(1)}
                    >
                      Back to shipping/tax
                    </Button>
                    <Button
                      data-testid="checkout-payment-confirm"
                      variant="contained"
                      disabled={!canConfirmPayment || !paymentIntentId || confirmingPayment}
                      onClick={() => {
                        void submitPayment();
                      }}
                    >
                      Confirm payment
                    </Button>
                  </Stack>
                </Stack>
              ) : null}

              {step === 3 ? (
                <Stack
                  key="step-confirmation"
                  component={motion.div}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.24, ease: 'easeOut' }}
                  spacing={1.5}
                >
                  <Typography variant="h5">Order confirmed</Typography>
                  <Typography color="text.secondary">
                    Your simulated payment succeeded. No real charge was made.
                  </Typography>
                  <Typography>
                    Order ID: {confirmedData?.confirmPayment?.order?.id || orderId}
                  </Typography>
                  <Typography>
                    Payment status: {confirmedData?.confirmPayment?.payment?.status || 'SUCCEEDED'}
                  </Typography>
                  <Button component={RouterLink} to="/account" variant="contained">
                    View order history
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
                Demo mode
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                This checkout uses a Stripe-like fake provider with deterministic success. No secrets required.
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Email/SMS are mocked and stored in notification logs on backend.
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
}
