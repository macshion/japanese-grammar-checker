# Japanese Grammar Checker Chrome Extension

AI-powered Japanese grammar checker and optimizer Chrome extension.

## Project Structure

```
japanese-grammar-checker/
├── config.js                # Root configuration file
├── manifest.json            # Chrome extension manifest
├── icon.svg                 # Extension icon
├── sidebar.html             # Sidebar HTML
├── vite.config.js           # Vite configuration for development
├── vite.config.extension.js # Vite configuration for extension build
├── package.json             # NPM package configuration
├── src/                     # Source code directory
│   ├── js/                  # JavaScript files
│   │   ├── background.js    # Extension background script
│   │   ├── content.js       # Content script
│   │   ├── config.js        # Application configuration
│   │   └── sidebar.js       # Sidebar functionality
│   └── css/                 # CSS files
│       └── sidebar.css      # Sidebar styles
└── dist/                    # Build output directory
```

## Development

### Prerequisites

- Node.js (v14 or later)
- npm (v6 or later)

### Setup

1. Clone the repository
2. Install dependencies:

```bash
npm install
```

### Development Commands

- Start development server:

```bash
npm run dev
```

- Build for production:

```bash
npm run build
```

- Build Chrome extension:

```bash
npm run build:extension
```

- Clean build directory and rebuild extension:

```bash
npm run clean:build
```

## Loading the Extension in Chrome

1. Build the extension:

```bash
npm run clean:build
```

2. Open Chrome and navigate to `chrome://extensions/`
3. Enable "Developer mode" (toggle in the top-right corner)
4. Click "Load unpacked" and select the `dist` directory
5. The extension should now be installed and ready to use

## Usage

1. Click on the extension icon in the Chrome toolbar
2. The sidebar will open with the Japanese Grammar Checker
3. Enter Japanese text in the input area
4. Click "チェック" to check the grammar
5. View the corrected text in the result area
6. Use the copy button to copy the corrected text
7. View and manage your history in the history section

## Configuration

You can modify the extension's configuration in the following files:

- `config.js`: Root configuration file
- `src/js/config.js`: Application-specific configuration
- `manifest.json`: Chrome extension configuration
