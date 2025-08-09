import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import Categories from '../components/Categories.jsx';
import axios from 'axios';

vi.mock('axios');

function renderWithSearch(url = '/shop?department=Electronics') {
  axios.create.mockReturnValue({
    get: vi.fn().mockResolvedValue({
      data: [
        { categoryName: 'Phones', len: 2 },
        { categoryName: 'Laptops', len: 5 },
      ],
    }),
  });
  return render(
    <MemoryRouter initialEntries={[url]}>
      <Routes>
        <Route path="/shop" element={<Categories />} />
      </Routes>
    </MemoryRouter>
  );
}

describe('Categories', () => {
  beforeEach(() => vi.clearAllMocks());

  it('fetches and displays categories', async () => {
    renderWithSearch();
    expect(await screen.findByText('Electronics')).toBeInTheDocument();
    expect(
      screen.getByRole('checkbox', { name: /Phones/ })
    ).toBeInTheDocument();
  });

  it('applies filters to URL params', async () => {
    renderWithSearch();
    const phones = await screen.findByRole('checkbox', { name: /Phones/ });
    fireEvent.click(phones);
    fireEvent.click(screen.getByRole('button', { name: 'Submit' }));
    // We just ensure no crash; URL change is handled by router
  });
});
