import { axe } from 'jest-axe';
import React from 'react';
import { screen } from '@testing-library/react';
import { CartPage } from '../pages/CartPage';
import { CheckoutPage } from '../pages/CheckoutPage';
import { HomePage } from '../pages/HomePage';
import { ProductDetailPage } from '../pages/ProductDetailPage';
import { ProductsPage } from '../pages/ProductsPage';
import {
  BRANDS_QUERY,
  CART_QUERY,
  CATEGORIES_QUERY,
  FEATURED_PRODUCTS_QUERY,
  PRODUCT_QUERY,
  PRODUCTS_QUERY,
  REVIEWS_QUERY,
} from '../graphql/documents';
import { renderWithProviders } from '../test-utils/renderWithProviders';

const sessionId = 'sess_a11y_test';

describe('Core page accessibility', () => {
  beforeEach(() => {
    localStorage.setItem('soren_guest_session_id', sessionId);
  });

  it('Home page has no critical axe violations', async () => {
    const { container } = renderWithProviders(<HomePage />, {
      mocks: [
        {
          request: { query: CATEGORIES_QUERY },
          result: { data: { categories: [{ id: 1, name: 'Speakers', description: '' }] } },
        },
        {
          request: { query: FEATURED_PRODUCTS_QUERY },
          result: {
            data: {
              featuredProducts: [
                {
                  id: 1,
                  name: 'JBL Flip 6',
                  basePrice: 129.99,
                  thumbnail: 'https://example.com/p.jpg',
                  brand: { name: 'JBL' },
                  category: { name: 'Speakers' },
                  variants: [{ id: 10, inventory: { quantity: 8, reserved: 0 } }],
                },
              ],
            },
          },
        },
      ],
    });

    await screen.findByText(/featured products/i);
    expect(await axe(container)).toHaveNoViolations();
  });

  it('Products page has no critical axe violations', async () => {
    const { container } = renderWithProviders(<ProductsPage />, {
      mocks: [
        {
          request: { query: CATEGORIES_QUERY },
          result: { data: { categories: [{ id: 1, name: 'Speakers', description: '' }] } },
        },
        {
          request: { query: BRANDS_QUERY },
          result: { data: { brands: [{ id: 1, name: 'JBL', description: '' }] } },
        },
        {
          request: {
            query: PRODUCTS_QUERY,
            variables: {
              filter: {
                search: undefined,
                categoryIds: undefined,
                brandIds: undefined,
                minPrice: 0,
                maxPrice: 2000,
                inStockOnly: false,
              },
              pagination: { page: 1, pageSize: 12 },
              sort: { field: 'createdAt', direction: 'DESC' },
            },
          },
          result: {
            data: {
              products: {
                total: 1,
                page: 1,
                pageSize: 12,
                items: [
                  {
                    id: 1,
                    name: 'JBL Flip 6',
                    slug: 'jbl-flip-6',
                    description: 'Portable',
                    basePrice: 129.99,
                    thumbnail: 'https://example.com/p.jpg',
                    galleryUrls: [],
                    averageRating: 4.5,
                    brand: { id: 1, name: 'JBL' },
                    category: { id: 1, name: 'Speakers' },
                    variants: [{ id: 10, sku: 'SKU', color: 'Black', size: 'OS', priceAdjustment: 0, inventory: { quantity: 5, reserved: 0 } }],
                  },
                ],
              },
            },
          },
        },
      ],
    });

    await screen.findByRole('heading', { name: /^products$/i });
    expect(await axe(container)).toHaveNoViolations();
  });

  it('Product detail page has no critical axe violations', async () => {
    const { container } = renderWithProviders(<ProductDetailPage />, {
      route: '/products/1',
      path: '/products/:id',
      withAuthProvider: true,
      mocks: [
        {
          request: { query: PRODUCT_QUERY, variables: { id: 1, sessionId } },
          result: {
            data: {
              product: {
                id: 1,
                name: 'JBL Flip 6',
                slug: 'jbl-flip-6',
                description: 'Portable speaker',
                basePrice: 129.99,
                thumbnail: 'https://example.com/p.jpg',
                galleryUrls: ['https://example.com/p2.jpg'],
                averageRating: 4.5,
                brand: { id: 1, name: 'JBL' },
                category: { id: 1, name: 'Speakers' },
                variants: [{ id: 10, sku: 'SKU', color: 'Black', size: 'OS', priceAdjustment: 0, inventory: { quantity: 5, reserved: 0 } }],
                relatedProducts: [],
              },
            },
          },
        },
        {
          request: { query: REVIEWS_QUERY, variables: { filter: { productId: 1 } } },
          result: { data: { reviews: [] } },
        },
      ],
    });

    await screen.findByRole('button', { name: /add to cart/i });
    expect(await axe(container)).toHaveNoViolations();
  });

  it('Cart page has no critical axe violations', async () => {
    const { container } = renderWithProviders(<CartPage />, {
      mocks: [
        {
          request: { query: CART_QUERY, variables: { context: { sessionId } } },
          result: {
            data: {
              cart: {
                id: 1,
                sessionId,
                active: true,
                items: [
                  {
                    id: 1,
                    quantity: 1,
                    unitPrice: 129.99,
                    variant: {
                      id: 10,
                      sku: 'SKU',
                      color: 'Black',
                      size: 'OS',
                      product: {
                        id: 1,
                        name: 'JBL Flip 6',
                        thumbnail: 'https://example.com/p.jpg',
                        basePrice: 129.99,
                      },
                      inventory: { quantity: 5, reserved: 0 },
                    },
                  },
                ],
              },
            },
          },
        },
      ],
    });

    await screen.findByText(/^cart$/i);
    expect(await axe(container)).toHaveNoViolations();
  });

  it('Checkout page has no critical axe violations', async () => {
    const { container } = renderWithProviders(<CheckoutPage />);
    await screen.findByText(/^checkout$/i);
    expect(await axe(container)).toHaveNoViolations();
  });
});
