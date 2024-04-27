import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      'api': path.resolve(__dirname, './src/api'),
      "utils": path.resolve(__dirname, './src/utils'),
      "security": path.resolve(__dirname, './src/security'),
    },
  },
});