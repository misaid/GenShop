import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Cart from '../Cart.jsx';
import { CartProvider } from '@/context/CartContext.jsx';
import axios from 'axios';

vi.mock('axios');

function renderCart(cartInfo = []) {
  axios.create.mockReturnValue({
    get: vi.fn().mockResolvedValue({ data: { cartInfo } }),
    post: vi.fn(),
  });

  return render(
    <CartProvider>
      <MemoryRouter>
        <Cart />
      </MemoryRouter>
    </CartProvider>
  );
}

describe('Cart', () => {
  beforeEach(() => vi.clearAllMocks());

  it('shows empty cart message when no items', async () => {
    renderCart([]);
    expect(await screen.findByText('Cart is empty')).toBeInTheDocument();
  });
});


