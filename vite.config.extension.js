import { defineConfig } from 'vite';
import { resolve } from 'path';
import { copyFileSync, mkdirSync, existsSync } from 'fs';
import { BUILD_CONFIG } from './config.js';

// 更新输出目录为当前目录
const OUTPUT_DIR = '.';

// Custom plugin to copy manifest.json and other static files
const copyManifestPlugin = () => {
  return {
    name: 'copy-manifest',
    closeBundle() {
      // Create directories if they don't exist
      if (!existsSync(`${OUTPUT_DIR}/js`)) {
        mkdirSync(`${OUTPUT_DIR}/js`, { recursive: true });
      }
      if (!existsSync(`${OUTPUT_DIR}/css`)) {
        mkdirSync(`${OUTPUT_DIR}/css`, { recursive: true });
      }
    }
  };
};

export default defineConfig({
  build: {
    outDir: OUTPUT_DIR,
    emptyOutDir: false, // 不清空输出目录，避免删除项目文件
    rollupOptions: {
      input: {
        'js/sidebar': resolve(__dirname, `${BUILD_CONFIG.SOURCE_DIR}/js/sidebar.js`),
        'js/background': resolve(__dirname, `${BUILD_CONFIG.SOURCE_DIR}/js/background.js`),
        'js/content': resolve(__dirname, `${BUILD_CONFIG.SOURCE_DIR}/js/content.js`),
        'js/config': resolve(__dirname, `${BUILD_CONFIG.SOURCE_DIR}/js/config.js`),
        'css/sidebar': resolve(__dirname, `${BUILD_CONFIG.SOURCE_DIR}/css/sidebar.css`)
      },
      output: {
        entryFileNames: '[name].js',
        chunkFileNames: `assets/[name].[hash].js`,
        assetFileNames: (assetInfo) => {
          const info = assetInfo.name.split('.');
          const ext = info.pop();
          const name = info.join('.');
          
          if (ext === 'css') {
            return `css/sidebar.css`;
          }
          
          return `assets/[name][extname]`;
        }
      }
    }
  },
  plugins: [copyManifestPlugin()],
  resolve: {
    alias: {
      '@': resolve(__dirname, BUILD_CONFIG.SOURCE_DIR)
    }
  }
}); 