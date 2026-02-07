import React from 'react';
import { screen } from '@testing-library/react';
import App from '../App';
import { CART_QUERY } from '../graphql/documents';
import { renderWithProviders } from '../test-utils/renderWithProviders';

const sessionId = 'sess_routing_test';

describe('Routing integration', () => {
  beforeEach(() => {
    localStorage.setItem('soren_guest_session_id', sessionId);
  });

  it('renders not found page for unknown routes', async () => {
    renderWithProviders(<App />, {
      route: '/some/unknown/path',
      withAuthProvider: true,
      mocks: [
        {
          request: {
            query: CART_QUERY,
            variables: { context: { sessionId } },
          },
          result: {
            data: {
              cart: {
                id: 1,
                sessionId,
                active: true,
                items: [],
              },
            },
          },
        },
      ],
    });

    expect(await screen.findByText(/page not found/i)).toBeInTheDocument();
  });
});
