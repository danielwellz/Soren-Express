import { fireEvent, screen, waitFor } from '@testing-library/react';
import React from 'react';
import { ProductDetailPage } from '../pages/ProductDetailPage';
import { PRODUCT_QUERY, REVIEWS_QUERY, SHIPPING_ESTIMATE_QUERY } from '../graphql/documents';
import { renderWithProviders } from '../test-utils/renderWithProviders';

const sessionId = 'sess_gallery_test';

describe('Product gallery accessibility', () => {
  beforeEach(() => {
    localStorage.setItem('soren_guest_session_id', sessionId);
  });

  it('supports aria pressed state and keyboard navigation', async () => {
    renderWithProviders(<ProductDetailPage />, {
      route: '/products/1',
      path: '/products/:id',
      withAuthProvider: true,
      mocks: [
        {
          request: {
            query: PRODUCT_QUERY,
            variables: { id: 1, sessionId },
          },
          result: {
            data: {
              product: {
                id: 1,
                name: 'JBL Flip 6',
                slug: 'jbl-flip-6',
                description: 'Portable speaker',
                basePrice: 129.99,
                thumbnail: 'https://example.com/main.jpg',
                galleryUrls: [
                  'https://example.com/side.jpg',
                  'https://example.com/back.jpg',
                ],
                averageRating: 4.5,
                brand: { id: 1, name: 'JBL' },
                category: { id: 1, name: 'Speakers' },
                variants: [
                  {
                    id: 10,
                    sku: 'JBL-1',
                    color: 'Black',
                    size: 'One Size',
                    priceAdjustment: 0,
                    inventory: { quantity: 5, reserved: 0 },
                  },
                ],
                relatedProducts: [],
              },
            },
          },
        },
        {
          request: {
            query: REVIEWS_QUERY,
            variables: { filter: { productId: 1 } },
          },
          result: {
            data: {
              reviews: [],
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
      ],
    });

    const firstThumb = await screen.findByRole('button', { name: /show image 1 of 3/i });
    const secondThumb = screen.getByRole('button', { name: /show image 2 of 3/i });
    const thirdThumb = screen.getByRole('button', { name: /show image 3 of 3/i });

    expect(firstThumb).toHaveAttribute('aria-pressed', 'true');
    expect(secondThumb).toHaveAttribute('aria-pressed', 'false');

    firstThumb.focus();
    fireEvent.keyDown(firstThumb, { key: 'ArrowRight' });

    await waitFor(() => {
      expect(secondThumb).toHaveAttribute('aria-pressed', 'true');
    });

    fireEvent.keyDown(secondThumb, { key: 'End' });
    await waitFor(() => {
      expect(thirdThumb).toHaveAttribute('aria-pressed', 'true');
    });
  });
});
