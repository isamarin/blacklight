// @ts-nocheck - Type conflicts due to yarn workspace hoisting of different vite versions
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import dts from 'vite-plugin-dts';
import { resolve } from 'path';

export default defineConfig({
  plugins: [
    react(),
    dts({
      include: ['src/client/**/*', 'src/types/**/*'],
      outDir: 'dist',
      rollupTypes: true,
      entryRoot: 'src/client',
    }),
  ],
  build: {
    lib: {
      entry: resolve(__dirname, 'src/client/index.tsx'),
      name: 'GreenlightPlayer',
      fileName: 'client',
      formats: ['es'],
    },
    rollupOptions: {
      external: ['react', 'react-dom', 'react/jsx-runtime'],
      output: {
        globals: {
          react: 'React',
          'react-dom': 'ReactDOM',
        },
      },
    },
    outDir: 'dist',
    emptyOutDir: false,
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
});
