import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import PrivateRoutes from '../PrivateRoutes.jsx';
import axios from 'axios';

vi.mock('axios');

function renderWithRouter(initialEntries = ['/protected']) {
  return render(
    <MemoryRouter initialEntries={initialEntries}>
      <Routes>
        <Route element={<PrivateRoutes />}>
          <Route path="/protected" element={<div>secret</div>} />
        </Route>
        <Route path="/login" element={<div>login</div>} />
      </Routes>
    </MemoryRouter>
  );
}

describe('PrivateRoutes', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('navigates to login when verify fails', async () => {
    axios.create.mockReturnValue({
      post: vi.fn().mockRejectedValue(new Error('no auth')),
    });

    renderWithRouter();
    await waitFor(() => expect(screen.getByText('login')).toBeInTheDocument());
  });

  it('renders outlet when verify succeeds', async () => {
    axios.create.mockReturnValue({
      post: vi.fn().mockResolvedValue({ status: 200 }),
    });

    renderWithRouter();
    await waitFor(() => expect(screen.getByText('secret')).toBeInTheDocument());
  });
});


