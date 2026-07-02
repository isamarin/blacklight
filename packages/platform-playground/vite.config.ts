import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  root: 'src/client',
  publicDir: '../../public',
  resolve: {},
  build: {
    outDir: '../../dist',
    emptyOutDir: true,
  },
  server: {
    port: 5173,
    hmr: {
      overlay: true,
    },
  },
})
