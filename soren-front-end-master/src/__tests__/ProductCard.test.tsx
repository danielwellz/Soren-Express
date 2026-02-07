import { fireEvent, render, screen } from '@testing-library/react';
import React from 'react';
import { MemoryRouter } from 'react-router-dom';
import { ProductCard } from '../components/common/ProductCard';

describe('ProductCard', () => {
  it('renders product title and handles add action', () => {
    const onAdd = jest.fn();

    render(
      <MemoryRouter>
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
        />
      </MemoryRouter>,
    );

    expect(screen.getByText('JBL Flip 6')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /add jbl flip 6 to cart/i }));
    expect(onAdd).toHaveBeenCalledTimes(1);
  });
});
