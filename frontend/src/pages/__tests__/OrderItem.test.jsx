import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import OrderItem from '../components/OrderItem.jsx';

const order = {
  orderNumber: '12345',
  status: 'Processing',
  createdAt: new Date().toISOString(),
  total: 99.99,
  products: [
    { _id: 'p1', image: 'x', name: 'A', price: 10 },
    { _id: 'p2', image: 'y', name: 'B', price: 20 },
  ],
  orderItems: [
    { productId: 'p1', quantity: 2, price: 10 },
    { productId: 'p2', quantity: 1, price: 20 },
  ],
};

describe('OrderItem', () => {
  it('renders order data', () => {
    render(
      <MemoryRouter>
        <OrderItem order={order} />
      </MemoryRouter>
    );
    expect(screen.getByText(/Order #/)).toBeInTheDocument();
  });
});
