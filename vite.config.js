import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  base: '/LUNA-the-last-light/',
  plugins: [react()],
  server: {
    port: 5173,
    host: true
  }
});
