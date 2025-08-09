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
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'lcov'],
      reportsDirectory: './coverage',
      include: ['**/*.{js,mjs}'],
      exclude: ['tests/**', '**/*.test.*', 'vitest.config.mjs'],
    },
  },
});
