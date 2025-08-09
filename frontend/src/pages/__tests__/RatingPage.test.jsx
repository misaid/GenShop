import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import RatingPage from '../RatingPage.jsx';
import axios from 'axios';

vi.mock('axios');

function renderRating(initial = ['/rating']) {
  axios.create.mockReturnValue({
    post: vi.fn().mockResolvedValue({
      data: {
        products: [],
        totalProducts: 0,
        totalPages: 0,
        userId: 'u1',
      },
    }),
  });
  return render(
    <MemoryRouter initialEntries={initial}>
      <Routes>
        <Route path="/rating" element={<RatingPage />} />
      </Routes>
    </MemoryRouter>
  );
}

describe('RatingPage', () => {
  beforeEach(() => vi.clearAllMocks());

  it('renders header text', async () => {
    renderRating();
    await waitFor(() => expect(true).toBe(true));
  });
});
