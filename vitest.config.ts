import { defineConfig } from 'vitest/config';

/**
 * Vitest runs against the PURE domain layer only (no React Native imports).
 * These tests guard the financial calculations that the whole app depends on.
 */
export default defineConfig({
  test: {
    environment: 'node',
    include: ['src/domain/**/*.test.ts'],
  },
  resolve: {
    alias: {
      '@': new URL('./src', import.meta.url).pathname,
    },
  },
});
