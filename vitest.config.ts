import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    setupFiles: ['./tests-vitest/vitest.setup.ts'],
    include: ['tests-vitest/**/*.test.ts'],
    coverage: {
      reporter: ['text', 'json', 'html'],
    },
  },
});
