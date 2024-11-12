import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: '/arnavon/',
  build: {
    outDir: 'dist',
    assetsDir: 'assets'
  },
  server: {
    host: true
  }
}); 