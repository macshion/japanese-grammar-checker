// 应用程序基本配置
export const APP_CONFIG = {
  NAME: 'Japanese Grammar Checker',
  VERSION: '1.0.0',
  AUTHOR: 'Macshion',
  DESCRIPTION: 'AI-powered Japanese grammar checker and optimizer'
};

// 构建配置
export const BUILD_CONFIG = {
  OUTPUT_DIR: 'dist',
  ASSETS_DIR: 'assets',
  SOURCE_DIR: 'src'
};

// 导入实际的应用程序配置
export * from './src/js/config.js'; 