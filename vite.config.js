import { defineConfig } from 'vite';
import path from 'path';

export default defineConfig({
  root: 'src/part4',
  base: './',
  server: {
    port: 8004,
    open: true
  },
  build: {
    outDir: '../../dist/part4',
    emptyOutDir: true
  }
});

