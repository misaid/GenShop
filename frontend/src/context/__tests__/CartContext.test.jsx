import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { CartProvider, useCart } from '../CartContext.jsx';

function Consumer() {
  const { cartCount, setCartCount } = useCart();
  return (
    <div>
      <span data-testid="count">{cartCount}</span>
      <button onClick={() => setCartCount((c) => c + 2)}>add</button>
    </div>
  );
}

describe('CartContext', () => {
  it('provides default count and updates', async () => {
    render(
      <CartProvider>
        <Consumer />
      </CartProvider>
    );

    expect(screen.getByTestId('count')).toHaveTextContent('0');

    fireEvent.click(screen.getByText('add'));
    expect(screen.getByTestId('count')).toHaveTextContent('2');
  });
});


