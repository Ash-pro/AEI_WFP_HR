import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 3000,
    open: false,
    proxy: process.env.HR_LOCAL_PREVIEW === '1' ? {
      '/mock': { target: 'http://127.0.0.1:54329', changeOrigin: true, rewrite: path => path.replace(/^\/mock/, '') },
    } : undefined,
  },
});
