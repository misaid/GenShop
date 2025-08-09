import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Navbar from '../components/Navbar.jsx';
import { CartProvider } from '@/context/CartContext.jsx';
import axios from 'axios';

vi.mock('axios');

function setup() {
  axios.create.mockReturnValue({
    get: vi
      .fn()
      .mockImplementation(path =>
        path === '/user'
          ? Promise.resolve({ data: 'user' })
          : Promise.resolve({ data: { cartInfo: [] } })
      ),
    post: vi.fn(),
  });

  return render(
    <CartProvider>
      <MemoryRouter>
        <Navbar />
      </MemoryRouter>
    </CartProvider>
  );
}

describe('Navbar', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders brand and nav buttons', async () => {
    setup();
    expect(await screen.findByText('GenShop')).toBeInTheDocument();
    expect(screen.getAllByText('Cart')[0]).toBeInTheDocument();
  });

  it('updates search input value', async () => {
    setup();
    const inputs = await screen.findAllByPlaceholderText('Search...');
    const input = inputs[0];
    fireEvent.change(input, { target: { value: 'phone' } });
    expect(input).toHaveValue('phone');
  });
});
