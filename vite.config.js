import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Clean environment-based base path:
// Default is '/' for Vercel, custom domains, and local development.
// Can be overridden via VITE_BASE_PATH or GITHUB_PAGES for GitHub Pages subpath.
const base = process.env.VITE_BASE_PATH || (process.env.GITHUB_PAGES === 'true' ? '/LUNA-the-last-light/' : '/');

export default defineConfig({
  base,
  plugins: [react()],
  server: {
    port: 5173,
    host: true
  }
});
