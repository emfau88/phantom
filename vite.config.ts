import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  base: process.env.GITHUB_ACTIONS ? '/phantom/' : '/',
  plugins: [react()],
  test: {
    exclude: ['tests/e2e/**', 'node_modules/**'],
  },
  build: {
    target: 'es2022',
    sourcemap: true,
  },
});
