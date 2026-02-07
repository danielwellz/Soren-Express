import { fireEvent, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { CheckoutPage } from '../pages/CheckoutPage';
import {
  CHECKOUT_PREVIEW_QUERY,
  CONFIRM_PAYMENT_MUTATION,
  CREATE_ORDER_MUTATION,
  CREATE_PAYMENT_INTENT_MUTATION,
} from '../graphql/documents';
import { renderWithProviders } from '../test-utils/renderWithProviders';

const sessionId = 'sess_checkout_test';

describe('CheckoutPage integration', () => {
  beforeEach(() => {
    localStorage.setItem('soren_guest_session_id', sessionId);
  });

  it('only confirms payment after payment details are completed', async () => {
    renderWithProviders(<CheckoutPage />, {
      mocks: [
        {
          request: {
            query: CHECKOUT_PREVIEW_QUERY,
            variables: {
              input: {
                region: 'US-DEFAULT',
                couponCode: 'SAVE10',
                sessionId,
              },
            },
          },
          result: {
            data: {
              checkoutPreview: {
                totals: {
                  subtotal: 100,
                  discount: 10,
                  shipping: 8,
                  tax: 7,
                  total: 105,
                },
                cart: { id: 1, items: [{ id: 1, quantity: 1, unitPrice: 100, variant: { id: 1, sku: 'SKU', product: { name: 'JBL Flip' } } }] },
              },
            },
          },
        },
        {
          request: {
            query: CREATE_ORDER_MUTATION,
            variables: {
              input: {
                shippingName: 'Jane Doe',
                shippingAddress: '1 Main Street',
                shippingCity: 'Austin',
                shippingRegion: 'US-DEFAULT',
                shippingPostalCode: '78701',
                couponCode: 'SAVE10',
                sessionId,
              },
            },
          },
          result: {
            data: {
              createOrder: {
                id: 81,
                total: 105,
                status: 'PENDING',
              },
            },
          },
        },
        {
          request: {
            query: CREATE_PAYMENT_INTENT_MUTATION,
            variables: {
              input: {
                orderId: 81,
              },
            },
          },
          result: {
            data: {
              createPaymentIntent: {
                clientSecret: 'secret',
                payment: {
                  id: 12,
                  intentId: 'pi_81',
                  status: 'REQUIRES_CONFIRMATION',
                },
              },
            },
          },
        },
        {
          request: {
            query: CONFIRM_PAYMENT_MUTATION,
            variables: {
              input: {
                intentId: 'pi_81',
                cardLast4: '4242',
              },
            },
          },
          result: {
            data: {
              confirmPayment: {
                order: {
                  id: 81,
                  status: 'PAID',
                  total: 105,
                },
                payment: {
                  id: 12,
                  status: 'SUCCEEDED',
                  last4: '4242',
                },
              },
            },
          },
        },
      ],
    });

    fireEvent.change(screen.getByLabelText(/full name/i), { target: { value: 'Jane Doe' } });
    fireEvent.change(screen.getByLabelText(/^address$/i), { target: { value: '1 Main Street' } });
    fireEvent.change(screen.getByLabelText(/city/i), { target: { value: 'Austin' } });
    fireEvent.change(screen.getByLabelText(/postal code/i), { target: { value: '78701' } });
    fireEvent.change(screen.getByLabelText(/coupon code/i), { target: { value: 'save10' } });
    await waitFor(() => {
      expect(screen.getByLabelText(/coupon code/i)).toHaveValue('SAVE10');
    });

    await userEvent.click(screen.getByRole('button', { name: /continue to shipping\/tax/i }));

    await screen.findByText(/shipping and tax preview/i);
    await userEvent.click(screen.getByRole('button', { name: /continue to payment/i }));

    await screen.findByText(/payment details/i);
    expect(screen.queryByText(/order confirmed/i)).not.toBeInTheDocument();

    expect(screen.getByRole('button', { name: /confirm payment/i })).toBeDisabled();

    fireEvent.change(screen.getByLabelText(/cardholder name/i), { target: { value: 'Jane Doe' } });
    fireEvent.change(screen.getByLabelText(/card last 4/i), { target: { value: '4242' } });
    fireEvent.change(screen.getByLabelText(/expiry/i), { target: { value: '12/28' } });
    fireEvent.change(screen.getByLabelText(/cvc/i), { target: { value: '123' } });

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /confirm payment/i })).toBeEnabled();
    });

    await userEvent.click(screen.getByRole('button', { name: /confirm payment/i }));
    await screen.findByText(/order confirmed/i);
  });
});
