import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { CartPage } from '../pages/CartPage';
import {
  APPLY_CART_PROMO_MUTATION,
  CART_QUERY,
  CHECKOUT_PREVIEW_QUERY,
  FEATURED_PRODUCTS_QUERY,
  SHIPPING_ESTIMATE_QUERY,
} from '../graphql/documents';
import { renderWithProviders } from '../test-utils/renderWithProviders';

const sessionId = 'sess_promo_retry';

const cartWithoutPromo = {
  id: 1,
  sessionId,
  active: true,
  promoCode: null,
  giftCardCode: null,
  items: [
    {
      id: 1,
      quantity: 1,
      unitPrice: 129.99,
      variant: {
        id: 10,
        sku: 'SKU',
        color: 'Black',
        size: 'One Size',
        product: {
          id: 1,
          name: 'JBL Flip 6',
          thumbnail: '/images/150x150.png',
          basePrice: 129.99,
        },
        inventory: { quantity: 8, reserved: 0 },
      },
    },
  ],
};

describe('Promo mutation retry flow', () => {
  beforeEach(() => {
    localStorage.setItem('soren_guest_session_id', sessionId);
  });

  it('shows error on failed promo and succeeds on retry', async () => {
    renderWithProviders(<CartPage />, {
      mocks: [
        {
          request: { query: CART_QUERY, variables: { context: { sessionId } } },
          result: { data: { cart: cartWithoutPromo } },
        },
        {
          request: { query: FEATURED_PRODUCTS_QUERY },
          result: { data: { featuredProducts: [] } },
        },
        {
          request: {
            query: CHECKOUT_PREVIEW_QUERY,
            variables: {
              input: {
                region: 'US-DEFAULT',
                couponCode: undefined,
                sessionId,
              },
            },
          },
          result: {
            data: {
              checkoutPreview: {
                totals: { subtotal: 129.99, discount: 0, shipping: 8, tax: 9.66, total: 147.65 },
                cart: { id: 1, items: [] },
              },
            },
          },
        },
        {
          request: {
            query: SHIPPING_ESTIMATE_QUERY,
            variables: { input: { region: 'US-DEFAULT', subtotal: 129.99 } },
          },
          result: {
            data: {
              shippingEstimate: {
                region: 'US-DEFAULT',
                flatRate: 8,
                freeShippingOver: 150,
                remainingForFreeShipping: 20.01,
                eligibleForFreeShipping: false,
                estimatedMinDays: 2,
                estimatedMaxDays: 5,
              },
            },
          },
        },
        {
          request: {
            query: APPLY_CART_PROMO_MUTATION,
            variables: { input: { couponCode: 'FAIL', sessionId } },
          },
          error: new Error('Invalid coupon'),
        },
        {
          request: {
            query: APPLY_CART_PROMO_MUTATION,
            variables: { input: { couponCode: 'SAVE10', sessionId } },
          },
          result: {
            data: {
              applyCartPromo: {
                id: 1,
                promoCode: 'SAVE10',
                items: [{ id: 1 }],
              },
            },
          },
        },
        {
          request: { query: CART_QUERY, variables: { context: { sessionId } } },
          result: {
            data: {
              cart: {
                ...cartWithoutPromo,
                promoCode: 'SAVE10',
              },
            },
          },
        },
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
                totals: { subtotal: 129.99, discount: 10, shipping: 8, tax: 8.96, total: 136.95 },
                cart: { id: 1, items: [] },
              },
            },
          },
        },
      ],
    });

    await screen.findByText(/^cart$/i);

    const promoInput = screen.getByLabelText(/promo code/i);
    await userEvent.clear(promoInput);
    await userEvent.type(promoInput, 'FAIL');
    await userEvent.click(screen.getByRole('button', { name: /apply promo/i }));

    await screen.findByText(/promo code is invalid/i);

    await userEvent.clear(promoInput);
    await userEvent.type(promoInput, 'SAVE10');
    await userEvent.click(screen.getByRole('button', { name: /apply promo/i }));

    await waitFor(() => {
      expect(screen.getByText(/promo applied/i)).toBeInTheDocument();
    });
  });
});
