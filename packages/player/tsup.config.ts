import { defineConfig } from 'tsup';

export default defineConfig({
  entry: {
    server: 'src/server/index.ts',
  },
  format: ['esm'],
  outDir: 'dist',
  dts: true,
  clean: false,
  sourcemap: true,
  target: 'es2020',
  external: [],
  async onSuccess() {
    console.log('Server build completed');
  },
});
