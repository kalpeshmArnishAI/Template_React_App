import path from 'path';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  server: {
    port: 5173, // frontend runs here
    proxy: {
      '/api': {
        target: 'http://localhost:8000', // backend URL
        changeOrigin: true,
        secure: false,
      },
    },
  },
});
