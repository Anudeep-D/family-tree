import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path';
import { fileURLToPath } from 'url';

// Get __dirname equivalent in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'), // Use @ for base src/
      '@styles': path.resolve(__dirname, 'src/styles'), // Custom alias for styles
      '@components': path.resolve(__dirname, 'src/routes'), // Alias for components
    },
  },
})
