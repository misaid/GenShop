import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import MyAccount from '../MyAccount.jsx';
import axios from 'axios';

vi.mock('axios');

function setup() {
  axios.create.mockReturnValue({
    post: vi.fn().mockResolvedValue({ status: 200 }),
  });
  return render(
    <MemoryRouter>
      <MyAccount />
    </MemoryRouter>
  );
}

describe('MyAccount', () => {
  beforeEach(() => vi.clearAllMocks());

  it('renders and opens delete dialog', async () => {
    setup();
    fireEvent.click(screen.getByRole('button', { name: /Delete Account/i }));
    const input = await screen.findByPlaceholderText(
      'Type your password to confirm'
    );
    fireEvent.change(input, { target: { value: 'password123' } });
    fireEvent.click(screen.getByRole('button', { name: 'Delete Account' }));
    await waitFor(() => {
      const instance = axios.create.mock.results[0].value;
      expect(instance.post).toHaveBeenCalledWith(
        '/delete_user',
        { password: 'password123' },
        { withCredentials: true }
      );
    });
  });
});
