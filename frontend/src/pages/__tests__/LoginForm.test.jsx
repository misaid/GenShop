import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import LoginForm from '../components/LoginForm.jsx';
import axios from 'axios';

vi.mock('axios');

function setup() {
  axios.create.mockReturnValue({
    post: vi.fn().mockResolvedValue({ status: 200 }),
  });
  return render(
    <MemoryRouter>
      <LoginForm />
    </MemoryRouter>
  );
}

describe('LoginForm', () => {
  beforeEach(() => vi.clearAllMocks());

  it('submits credentials', async () => {
    setup();
    fireEvent.change(screen.getByLabelText(/Username/i), {
      target: { value: 'user' },
    });
    fireEvent.change(screen.getByLabelText(/Password/i), {
      target: { value: 'password123' },
    });

    fireEvent.click(screen.getByRole('button', { name: /submit/i }));
    await waitFor(() => {
      const instance = axios.create.mock.results[0].value;
      expect(instance.post).toHaveBeenCalledWith(
        '/login',
        { username: 'user', password: 'password123' },
        { withCredentials: true }
      );
    });
  });
});
