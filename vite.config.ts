import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath, URL } from 'node:url';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],

  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },

  optimizeDeps: {
    exclude: ['lucide-react'],
  },

  server: {
    port: 5173,
    host: true,
  },

  build: {
    sourcemap: false,
    target: 'es2020',
  },

  preview: {
    port: 4173,
  },
});
