import { defineConfig } from 'vitest/config';
export default defineConfig({
  test: {
    include: ['tests/**/*.test.ts'],
    testTimeout: 120000,
    hookTimeout: 30000,
    minWorkers: 1,
    maxWorkers: 2,
  },
});
