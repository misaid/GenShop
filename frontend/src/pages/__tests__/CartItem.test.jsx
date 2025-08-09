import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import CartItem from '../components/CartItem.jsx';
import axios from 'axios';

vi.mock('axios');

const product = {
  _id: 'p1',
  name: 'Item',
  price: 9.99,
  countInStock: 3,
  image: 'https://example.com/x.jpg',
};

function setup() {
  const onChange = vi.fn();
  axios.create.mockReturnValue({
    post: vi.fn().mockResolvedValue({ status: 200 }),
  });
  render(
    <MemoryRouter>
      <CartItem
        product={product}
        productid={product._id}
        quantity={1}
        onChange={onChange}
      />
    </MemoryRouter>
  );
  return { onChange };
}

describe('CartItem', () => {
  beforeEach(() => vi.clearAllMocks());

  it('deletes item and triggers onChange', async () => {
    const { onChange } = setup();
    fireEvent.click(screen.getByRole('button', { name: /Delete/i }));
    await waitFor(() => expect(onChange).toHaveBeenCalled());
  });
});
