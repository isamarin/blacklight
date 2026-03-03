import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  root: 'src/client',
  publicDir: '../../public',
  resolve: {
    alias: {
      '@greenlight/platform': path.resolve(__dirname, '../platform/dist/src/index.js'),
      '@greenlight/player': path.resolve(__dirname, '../player/dist/'),
    },
  },
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
