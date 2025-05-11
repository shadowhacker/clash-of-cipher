
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import path from 'node:path';
import { componentTagger } from "lovable-tagger";

// Tell Rollup to skip trying to use Node.js modules
process.env.ROLLUP_SKIP_NODEJS = 'true';

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
    include: ['react', 'react-dom'],
    esbuildOptions: {
      jsx: 'automatic'
    }
  },
  build: {
    rollupOptions: {
      onwarn(warning, warn) {
        if (warning.code === 'MODULE_LEVEL_DIRECTIVE' || 
            warning.code === 'MISSING_EXPORT') return;
        warn(warning);
      },
      external: [
        '@rollup/rollup-linux-x64-gnu',
        'esbuild/bin/esbuild',
        '@esbuild/linux-x64'
      ]
    },
  },
  server: {
    host: "::",
    port: 8080
  },
}));
