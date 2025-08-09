import '@testing-library/jest-dom';

// Mock matchMedia for components that may use it (e.g., Radix, responsive logic)
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: (query) => ({
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


