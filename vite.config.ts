import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port,
    host: true,
    allowedHosts: [
      'shakesense.onrender.com',
      '.onrender.com',
      'localhost',
      '127.0.0.1',
    ],
  },
  preview: {
    port,
    host: true,
    allowedHosts: [
      'shakesense.onrender.com',
      '.onrender.com',
      'localhost',
      '127.0.0.1',
    ],
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
  },
});

