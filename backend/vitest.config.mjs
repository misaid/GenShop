import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    setupFiles: ['./tests/setup.js'],
    globals: true,
    clearMocks: true,
    restoreMocks: true,
    isolate: true,
    watch: false,
    pool: 'threads',
  },
});
