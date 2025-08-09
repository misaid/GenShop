import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import ProductPage from '../ProductPage.jsx';
import { CartProvider } from '@/context/CartContext.jsx';
import axios from 'axios';

vi.mock('axios');

function renderPage(product) {
  const axiosInstance = {
    get: vi.fn().mockResolvedValue({ data: product }),
    post: vi.fn().mockResolvedValue({ status: 200 }),
  };
  axios.create.mockReturnValue(axiosInstance);

  return render(
    <CartProvider>
      <MemoryRouter initialEntries={[`/product/${product._id}`]}>
        <Routes>
          <Route path="/product/:id" element={<ProductPage />} />
        </Routes>
      </MemoryRouter>
    </CartProvider>
  );
}

describe('ProductPage', () => {
  beforeEach(() => vi.clearAllMocks());

  it('renders product details and adds to cart', async () => {
    const product = {
      _id: 'p1',
      name: 'Test Product',
      image: 'https://example.com/i.jpg',
      price: 12.34,
      countInStock: 5,
      description: 'desc',
      averageRating: 4,
    };

    renderPage(product);

    await waitFor(() =>
      expect(screen.getByText('Test Product')).toBeInTheDocument()
    );
    const button = screen.getByRole('button', { name: 'Cart' });
    fireEvent.click(button);
    await waitFor(() => {
      const instance = axios.create.mock.results[0].value;
      expect(instance.post).toHaveBeenCalled();
    });
  });
});
