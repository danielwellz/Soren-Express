import { fireEvent, screen } from '@testing-library/react';
import React from 'react';
import { MiniCartDrawer } from '../components/Cart/MiniCartDrawer';
import { CART_QUERY, FEATURED_PRODUCTS_QUERY } from '../graphql/documents';
import { renderWithProviders } from '../test-utils/renderWithProviders';

describe('Mini cart accessibility', () => {
  beforeEach(() => {
    localStorage.setItem('soren_guest_session_id', 'sess_mini_cart');
  });

  it('renders with dialog semantics and responds to escape key', async () => {
    const onClose = jest.fn();

    renderWithProviders(<MiniCartDrawer open onClose={onClose} />, {
      mocks: [
        {
          request: { query: CART_QUERY, variables: { context: { sessionId: 'sess_mini_cart' } } },
          result: {
            data: {
              cart: {
                id: 1,
                sessionId: 'sess_mini_cart',
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
                      sku: 'SKU-1',
                      color: 'Black',
                      size: 'One Size',
                      product: { id: 1, name: 'JBL Flip 6', thumbnail: '/images/150x150.png', basePrice: 129.99 },
                      inventory: { quantity: 10, reserved: 0 },
                    },
                  },
                ],
              },
            },
          },
        },
        {
          request: { query: FEATURED_PRODUCTS_QUERY },
          result: { data: { featuredProducts: [] } },
        },
      ],
    });

    await screen.findByText(/cart preview/i);
    expect(screen.getByRole('dialog')).toBeInTheDocument();

    fireEvent.keyDown(document, { key: 'Escape' });
    expect(onClose).toHaveBeenCalled();
  });
});
