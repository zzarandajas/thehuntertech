import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// En desarrollo el frontend (vite) llama al backend (nodemon) vía proxy /api → :4000.
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    host: true,
    proxy: {
      '/api': {
        target: 'http://localhost:4000',
        changeOrigin: true,
      },
    },
  },
});
