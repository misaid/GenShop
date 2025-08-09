import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import Orders from '../Orders.jsx';
import axios from 'axios';

vi.mock('axios');

function renderOrders(initial = ['/orders']) {
  axios.create.mockReturnValue({
    post: vi.fn().mockResolvedValue({
      data: {
        totalOrders: 0,
        totalPages: 0,
        fullOrder: [],
      },
    }),
  });
  return render(
    <MemoryRouter initialEntries={initial}>
      <Routes>
        <Route path="/orders" element={<Orders />} />
      </Routes>
    </MemoryRouter>
  );
}

describe('Orders', () => {
  beforeEach(() => vi.clearAllMocks());

  it('renders without items', async () => {
    renderOrders();
    await waitFor(() =>
      expect(screen.getByText(/orders/i)).toBeInTheDocument()
    );
  });
});
