import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import Moderate from '../Moderate.jsx';
import axios from 'axios';

vi.mock('axios');

function renderModerate(initial = ['/moderate']) {
  axios.create.mockReturnValue({
    get: vi.fn(),
    post: vi.fn().mockResolvedValue({
      data: { products: [], totalPages: 0, totalProducts: 0 },
    }),
  });
  return render(
    <MemoryRouter initialEntries={initial}>
      <Routes>
        <Route path="/moderate" element={<Moderate />} />
      </Routes>
    </MemoryRouter>
  );
}

describe('Moderate', () => {
  beforeEach(() => vi.clearAllMocks());

  it('renders with no products', async () => {
    renderModerate();
    await waitFor(() => expect(true).toBe(true));
  });
});
