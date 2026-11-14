import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  // GitHub Pages 專案站台位於 /<repo>/ 子路徑；CI 以 VITE_BASE 設定，本機開發維持 '/'
  base: process.env.VITE_BASE || '/',
  plugins: [react(), tailwindcss()]
});
