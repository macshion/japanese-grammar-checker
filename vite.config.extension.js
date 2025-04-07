import { defineConfig } from 'vite';
import { resolve } from 'path';
import { copyFileSync, mkdirSync, existsSync, writeFileSync, readFileSync } from 'fs';
import { BUILD_CONFIG, APP_CONFIG, DEV_CONFIG } from './config.js';
import crypto from 'crypto';

// 使用命令行参数来确定是否构建开发版本
const isDev = process.env.BUILD_ENV === 'development';
const OUTPUT_DIR = isDev ? BUILD_CONFIG.OUTPUT_DIR_DEV : BUILD_CONFIG.OUTPUT_DIR;

// 生成唯一的扩展ID密钥（仅在开发版中使用）
const generateExtensionKey = () => {
  // 为了保持开发版扩展ID一致，使用固定种子
  const seed = 'japanese-grammar-checker-dev-key-seed';
  return crypto.createHash('sha256').update(seed).digest('base64');
};

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
      
      // Read the manifest.json file
      let manifest;
      try {
        const manifestContent = readFileSync('manifest.json', 'utf8');
        manifest = JSON.parse(manifestContent);
      } catch (err) {
        console.error('Error reading manifest.json:', err);
        return;
      }
      
      // Update manifest for development version if needed
      if (isDev) {
        manifest.name = DEV_CONFIG.NAME;
        manifest.description = DEV_CONFIG.DESCRIPTION;
        
        // 为开发版添加唯一的key，确保不同的扩展ID
        manifest.key = generateExtensionKey();
      }
      
      // Write the updated manifest.json to the output directory
      writeFileSync(`${OUTPUT_DIR}/manifest.json`, JSON.stringify(manifest, null, 2));
      
      // Copy sidebar.html to the output directory
      copyFileSync('sidebar.html', `${OUTPUT_DIR}/sidebar.html`);
      
      // Handle icon based on environment
      if (isDev) {
        // Development version icon with DEV label
        const devIcon = `<svg width="128" height="128" viewBox="0 0 128 128" xmlns="http://www.w3.org/2000/svg">
          <rect width="128" height="128" rx="16" fill="#2196F3"/>
          <text x="64" y="64" font-size="72" font-family="Arial, sans-serif" fill="white" text-anchor="middle" dominant-baseline="middle">
            開発
          </text>
          <rect x="0" y="100" width="128" height="28" fill="rgba(255,0,0,0.7)"/>
          <text x="64" y="118" font-size="18" font-family="Arial, sans-serif" fill="white" text-anchor="middle" dominant-baseline="middle">
            DEV版
          </text>
          <path d="M16 96 L112 96" stroke="white" stroke-width="4" stroke-opacity="0.3"/>
        </svg>`;
        writeFileSync(`${OUTPUT_DIR}/icon.svg`, devIcon);
      } else {
        // For production, use the original icon.svg
        if (existsSync('icon.svg')) {
          copyFileSync('icon.svg', `${OUTPUT_DIR}/icon.svg`);
        }
      }

      // Also copy CSS file directly to avoid double nested directories
      if (existsSync('css/sidebar.css')) {
        copyFileSync('css/sidebar.css', `${OUTPUT_DIR}/css/sidebar.css`);
      }

      // Update the sidebar.html to use the correct CSS path
      if (existsSync(`${OUTPUT_DIR}/sidebar.html`)) {
        let sidebarHtml = readFileSync(`${OUTPUT_DIR}/sidebar.html`, 'utf8');
        sidebarHtml = sidebarHtml.replace(
          '<link rel="stylesheet" href="css/css/sidebar.css">',
          '<link rel="stylesheet" href="css/sidebar.css">'
        );
        writeFileSync(`${OUTPUT_DIR}/sidebar.html`, sidebarHtml);
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
        'js/sidebar': resolve(__dirname, 'js/sidebar.js'),
        'js/background': resolve(__dirname, 'js/background.js'),
        'js/content': resolve(__dirname, 'js/content.js'),
        'js/modules/grammar': resolve(__dirname, 'js/modules/grammar.js'),
        'js/modules/translation': resolve(__dirname, 'js/modules/translation.js'),
        'js/modules/aiChat': resolve(__dirname, 'js/modules/aiChat.js'),
        'js/modules/tabManager': resolve(__dirname, 'js/modules/tabManager.js'),
        'js/utils/api': resolve(__dirname, 'js/utils/api.js'),
        'js/utils/config': resolve(__dirname, 'js/utils/config.js'),
        'js/utils/storage': resolve(__dirname, 'js/utils/storage.js'),
        'js/utils/settings': resolve(__dirname, 'js/utils/settings.js'),
        'css/sidebar': resolve(__dirname, 'css/sidebar.css')
      },
      output: {
        entryFileNames: '[name].js',
        chunkFileNames: `assets/[name].[hash].js`,
        assetFileNames: (assetInfo) => {
          const info = assetInfo.name.split('.');
          const ext = info.pop();
          const name = info.join('.');
          
          if (ext === 'css') {
            // Use a flat structure for CSS files
            const fileName = name.split('/').pop();
            return `css/${fileName}.css`;
          }
          
          return `assets/[name][extname]`;
        }
      }
    }
  },
  plugins: [copyManifestPlugin()],
  resolve: {
    alias: {
      '@': resolve(__dirname, '.')
    }
  }
}); 