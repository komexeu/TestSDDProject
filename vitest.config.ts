

import { defineConfig } from 'vitest/config';
import * as path from 'path';

export default defineConfig({
  resolve: {
    alias: {
  '@/app': path.resolve(__dirname, 'src/app'),
  '@core': path.resolve(__dirname, 'src/core'),
  '@domains': path.resolve(__dirname, 'src/domains'),
  '@interfaces': path.resolve(__dirname, 'src/interfaces'),
  '@shared': path.resolve(__dirname, 'src/shared'),
  '@models': path.resolve(__dirname, 'src/interfaces/models'),
  '@tests': path.resolve(__dirname, 'tests-vitest'),
    },
  },
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
