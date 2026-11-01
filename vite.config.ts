import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

const defaultAllowedHosts = [
  'shakesense.onrender.com',
  '.onrender.com',
  'localhost',
  '127.0.0.1',
];

const allowedHosts = process.env.VITE_ALLOWED_HOSTS
  ? process.env.VITE_ALLOWED_HOSTS.split(',').map((h) => h.trim())
  : defaultAllowedHosts;

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port,
    host: true,
    allowedHosts,
  },
  preview: {
    port,
    host: true,
    allowedHosts,
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
  },
});


