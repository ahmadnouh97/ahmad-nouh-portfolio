import { defineConfig } from 'vite';
import { resolve } from 'node:path';

export default defineConfig({
  build: {
    rollupOptions: {
      input: Object.fromEntries(['index', 'work/blink/index', 'work/ment/index', 'work/lableb/index', 'work/second-memory/index', 'privacy/index'].map(page => [page, resolve(`${page}.html`)])),
    },
  },
});
