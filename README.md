# Japanese Grammar Checker Chrome Extension

AI-powered Japanese grammar checker and optimizer Chrome extension.

## How to use?

1. Click the extension icon to open the sidebar;
2. Enter your own openai key;
3. Enter some japanese and click check button;
4. You can see the proper expression fixed by AI.

## The other way to use

1. Select some text in a website;
2. Right click and open the menu;
3. Click "日本語文法をチェック" button;
4. The text will automatically entered in the input;
5. Click the check button to see the grammar fix result.

## Installation

### Option 1: Install from ZIP file (Recommended)

1. Download the latest release ZIP file from the [Releases page](https://github.com/macshion/japanese-grammar-checker/releases)
2. Extract the ZIP file to a folder on your computer
3. Open Chrome and navigate to `chrome://extensions/`
4. Enable "Developer mode" (toggle in the top-right corner)
5. Click "Load unpacked" and select the extracted folder
6. The extension should now be installed and ready to use

### Option 2: Build from source

1. Clone the repository
2. Install dependencies: `npm install`
3. Build the extension: `npm run clean:build`
4. Load the `dist` directory in Chrome as an unpacked extension

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
