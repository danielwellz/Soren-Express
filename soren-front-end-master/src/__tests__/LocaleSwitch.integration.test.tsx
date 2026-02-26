import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { Header } from '../components/Layout/StoreHeader';
import { CART_QUERY } from '../graphql/documents';
import { renderWithProviders } from '../test-utils/renderWithProviders';

describe('Language switch and RTL smoke', () => {
  beforeEach(() => {
    localStorage.setItem('soren_guest_session_id', 'sess_locale_test');
    localStorage.setItem('soren_language', 'en');
  });

  it('switches to Persian and flips document direction to rtl', async () => {
    renderWithProviders(<Header />, {
      mocks: [
        {
          request: { query: CART_QUERY, variables: { context: { sessionId: 'sess_locale_test' } } },
          result: {
            data: {
              cart: {
                id: 1,
                sessionId: 'sess_locale_test',
                active: true,
                promoCode: null,
                giftCardCode: null,
                items: [],
              },
            },
          },
        },
      ],
    });

    expect(document.documentElement.getAttribute('dir')).toBe('ltr');

    const switcher = screen.getAllByLabelText(/switch language/i)[0];
    await userEvent.click(switcher);

    await waitFor(() => {
      expect(document.documentElement.getAttribute('dir')).toBe('rtl');
    });

    await screen.findByText('خانه');
  });
});
