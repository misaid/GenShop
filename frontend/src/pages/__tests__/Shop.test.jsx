import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import Shop from '../Shop.jsx';
import axios from 'axios';

vi.mock('axios');

function renderShop(initial = ['/shop']) {
  axios.create.mockReturnValue({
    post: vi.fn().mockResolvedValue({
      data: {
        products: [],
        totalProducts: 0,
        totalPages: 0,
      },
    }),
  });
  return render(
    <MemoryRouter initialEntries={initial}>
      <Routes>
        <Route path="/shop" element={<Shop />} />
      </Routes>
    </MemoryRouter>
  );
}

describe('Shop', () => {
  beforeEach(() => vi.clearAllMocks());

  it('renders empty products state without crashing', async () => {
    renderShop();
    await waitFor(() =>
      expect(screen.getByText(/products/i)).toBeInTheDocument()
    );
  });
});
