import { jest } from '@jest/globals';
import '@testing-library/jest-dom';

// Mock Chrome API
global.chrome = {
  storage: {
    local: {
      get: jest.fn((keys, callback) => {
        const result = {};
        // Simulate returning API key
        if (Array.isArray(keys) && keys.includes('api_key')) {
          result.api_key = 'test-api-key';
        }
        callback(result);
      }),
      set: jest.fn((data, callback) => {
        if (callback) callback();
      }),
      remove: jest.fn((keys, callback) => {
        if (callback) callback();
      }),
      clear: jest.fn((callback) => {
        if (callback) callback();
      })
    }
  }
};

// Mock localStorage
const localStorageMock = {
    getItem: jest.fn(),
    setItem: jest.fn(),
    removeItem: jest.fn(),
    clear: jest.fn(),
};

// Create proper Jest mocks for localStorage methods
localStorageMock.getItem.mockImplementation(() => null);
localStorageMock.setItem.mockImplementation(() => {});
localStorageMock.removeItem.mockImplementation(() => {});
localStorageMock.clear.mockImplementation(() => {});

Object.defineProperty(window, 'localStorage', {
    value: localStorageMock,
    writable: true
});

// Mock clipboard API
const clipboardMock = {
    writeText: jest.fn().mockImplementation(() => Promise.resolve()),
};

Object.defineProperty(navigator, 'clipboard', {
    value: clipboardMock,
    writable: true
});

// Mock StorageService
jest.mock('../js/utils/storage.js', () => ({
    StorageService: jest.fn().mockImplementation(() => ({
        getHistory: jest.fn(),
        clearHistory: jest.fn(),
        exportHistory: jest.fn(),
        importHistory: jest.fn(),
        addToHistory: jest.fn()
    }))
}));

// Mock ApiService
jest.mock('../js/utils/api.js', () => ({
    ApiService: jest.fn().mockImplementation(() => ({
        translate: jest.fn(),
        checkGrammar: jest.fn(),
        chat: jest.fn()
    }))
}));

// Reset all mocks before each test
beforeEach(() => {
    jest.clearAllMocks();
    document.body.innerHTML = '';
}); 