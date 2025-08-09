import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import RegisterForm from '../components/RegisterForm.jsx';
import axios from 'axios';

vi.mock('axios');

function setup() {
  axios.create.mockReturnValue({
    post: vi.fn().mockResolvedValue({ status: 200 }),
  });
  return render(
    <MemoryRouter>
      <RegisterForm />
    </MemoryRouter>
  );
}

describe('RegisterForm', () => {
  beforeEach(() => vi.clearAllMocks());

  it('submits registration', async () => {
    setup();
    fireEvent.change(screen.getByLabelText(/Username/i), {
      target: { value: 'newuser' },
    });
    fireEvent.change(screen.getByLabelText('Password'), {
      target: { value: 'password123' },
    });
    fireEvent.change(screen.getByLabelText('Confirm password'), {
      target: { value: 'password123' },
    });

    fireEvent.click(screen.getByRole('button', { name: /submit/i }));
    await waitFor(() => {
      const instance = axios.create.mock.results[0].value;
      expect(instance.post).toHaveBeenCalledWith(
        '/register',
        { username: 'newuser', password: 'password123' },
        { withCredentials: true }
      );
    });
  });
});
