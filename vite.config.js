import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    sourcemap: false,
    chunkSizeWarningLimit: 1000,
  },
});

