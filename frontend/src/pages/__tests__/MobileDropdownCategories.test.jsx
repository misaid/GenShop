import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import MobileDropdownCategories from '../components/MobileDropdownCategories.jsx';
import axios from 'axios';

vi.mock('axios');

function renderMobile(url = '/shop?department=Electronics') {
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
        <Route path="/shop" element={<MobileDropdownCategories />} />
      </Routes>
    </MemoryRouter>
  );
}

describe('MobileDropdownCategories', () => {
  beforeEach(() => vi.clearAllMocks());

  it('renders and opens popover', async () => {
    renderMobile();
    const button = await screen.findByRole('button', { name: /filters/i });
    fireEvent.click(button);
    // Just ensure no crash on open
  });
});
