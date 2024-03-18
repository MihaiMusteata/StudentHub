import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    // https: true,
    strictPort: true,
    proxy: {
      '/api': {
        target: 'https://localhost:7277',
        changeOrigin: true,
        secure: false,
      }
    }
  }
});
