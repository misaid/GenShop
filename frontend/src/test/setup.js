import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Mock matchMedia for components that may use it (e.g., Radix, responsive logic)
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  }),
});

// Provide Vite env fallbacks to avoid undefined in tests
import.meta.env = {
  ...(import.meta.env || {}),
  VITE_APP_API_URL: 'http://localhost:3000',
  VITE_STRIPE_PUBLIC_KEY: 'pk_test_dummy',
};

// Mock canvas-confetti to avoid canvas dependency in JSDOM
vi.mock('canvas-confetti', () => ({
  default: vi.fn(),
  create: vi.fn(() => vi.fn()),
}));

// Mock sonner's toast to avoid side effects
vi.mock('sonner', async () => {
  const React = await import('react');
  return {
    toast: {
      success: vi.fn(),
      error: vi.fn(),
    },
    Toaster: ({ children }) => React.createElement('div', null, children),
  };
});

// JSDOM doesn't implement scrollTo
// Provide a noop to silence errors during tests
// eslint-disable-next-line no-undef
window.scrollTo = vi.fn();
