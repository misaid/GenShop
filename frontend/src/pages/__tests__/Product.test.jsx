import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { CartProvider } from '@/context/CartContext.jsx';
import Product from '../components/Product.jsx';
import axios from 'axios';

vi.mock('axios');

const product = {
  _id: 'p1',
  name: 'Item',
  averageRating: 4,
  countInStock: 5,
  price: 9.99,
  image: 'https://example.com/x.jpg',
};

function setup() {
  axios.create.mockReturnValue({
    post: vi.fn().mockResolvedValue({ status: 200 }),
  });
  return render(
    <CartProvider>
      <MemoryRouter>
        <Product product={product} />
      </MemoryRouter>
    </CartProvider>
  );
}

describe('Product', () => {
  beforeEach(() => vi.clearAllMocks());

  it('adds to cart', async () => {
    setup();
    fireEvent.click(
      await screen.findByRole('button', { name: /Add to Cart/i })
    );
    await waitFor(() => {
      const instance = axios.create.mock.results[0].value;
      expect(instance.post).toHaveBeenCalled();
    });
  });
});
