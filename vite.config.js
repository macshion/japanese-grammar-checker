import { defineConfig } from 'vite';
import { BUILD_CONFIG } from './config.js';

export default defineConfig({
  server: {
    port: 3000,
    open: true
  },
  build: {
    outDir: BUILD_CONFIG.OUTPUT_DIR,
    assetsDir: BUILD_CONFIG.ASSETS_DIR,
    sourcemap: true
  }
}); 