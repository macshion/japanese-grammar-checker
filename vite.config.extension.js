import { defineConfig } from 'vite';
import { resolve } from 'path';
import { copyFileSync, mkdirSync, existsSync } from 'fs';
import { BUILD_CONFIG } from './config.js';

// 使用配置文件中定义的输出目录
const OUTPUT_DIR = BUILD_CONFIG.OUTPUT_DIR;

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
      
      // Copy manifest.json to the output directory
      copyFileSync('manifest.json', `${OUTPUT_DIR}/manifest.json`);
      
      // Copy sidebar.html to the output directory
      copyFileSync('sidebar.html', `${OUTPUT_DIR}/sidebar.html`);
      
      // Copy icon.svg to the output directory
      if (existsSync('icon.svg')) {
        copyFileSync('icon.svg', `${OUTPUT_DIR}/icon.svg`);
      }
    }
  };
};

export default defineConfig({
  build: {
    outDir: OUTPUT_DIR,
    emptyOutDir: true, // 清空输出目录，确保干净的构建
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