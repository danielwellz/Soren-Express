import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { ProductCard } from '../components/common/ProductCard';
import { TRACK_ANALYTICS_EVENT_MUTATION } from '../graphql/documents';
import { renderWithProviders } from '../test-utils/renderWithProviders';

describe('ProductCard', () => {
  it('renders product title, handles add action, and fires analytics event', async () => {
    localStorage.setItem('soren_guest_session_id', 'sess_product_card');
    (window as any).dataLayer = [];

    const onAdd = jest.fn().mockResolvedValue({ ok: true });

    renderWithProviders(
      <ProductCard
        product={{
          id: 1,
          name: 'JBL Flip 6',
          basePrice: 129.99,
          averageRating: 4.6,
          brand: { name: 'JBL' },
          variants: [{ inventory: { quantity: 10, reserved: 1 } }],
        }}
        onAdd={onAdd}
      />,
      {
        mocks: [
          {
            request: {
              query: TRACK_ANALYTICS_EVENT_MUTATION,
              variables: {
                input: {
                  eventType: 'add_to_cart',
                  sessionId: 'sess_product_card',
                  metadata: {
                    productId: 1,
                    productName: 'JBL Flip 6',
                    price: 129.99,
                    locale: 'en',
                    label: 'Add to cart',
                  },
                },
              },
            },
            result: {
              data: {
                trackClientAnalytics: {
                  id: 1,
                  eventType: 'add_to_cart',
                  metadata: {
                    productId: 1,
                  },
                },
              },
            },
          },
        ],
      },
    );

    expect(screen.getByText('JBL Flip 6')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: /add jbl flip 6 to cart/i }));

    await waitFor(() => expect(onAdd).toHaveBeenCalledTimes(1));
    await waitFor(() =>
      expect((window as any).dataLayer.some((event: any) => event.event === 'add_to_cart')).toBeTruthy(),
    );
  });
});
