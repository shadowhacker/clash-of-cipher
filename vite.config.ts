
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'node:path';
import { componentTagger } from "lovable-tagger";

// Set environment variable to skip native modules
process.env.ROLLUP_SKIP_NODEJS = 'true';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  plugins: [
    react(),
    mode === 'development' && componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  optimizeDeps: {
    exclude: ['@rollup/rollup-linux-x64-gnu'],
  },
  build: {
    commonjsOptions: {
      include: [],
    },
    rollupOptions: {
      onwarn(warning, warn) {
        if (warning.code === 'MODULE_LEVEL_DIRECTIVE') {
          return;
        }
        warn(warning);
      },
    },
  },
  server: {
    host: "::",
    port: 8080
  },
}));
