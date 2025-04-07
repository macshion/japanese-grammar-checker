import { STORAGE_CONFIG, getStorageKey } from '../utils/config.js';

export class TabManager {
    constructor() {
        this.tabs = document.querySelectorAll('.tab-button');
        this.tabContents = document.querySelectorAll('.tab-content');
        this.activeTab = 'grammar'; // Default tab
        this.initializeEventListeners();
    }

    initializeEventListeners() {
        this.tabs.forEach(tab => {
            tab.addEventListener('click', () => {
                const tabId = tab.getAttribute('data-tab');
                this.switchTab(tabId);
            });
        });
    }

    switchTab(tabId) {
        // Remove active class from all tabs and contents
        this.tabs.forEach(tab => tab.classList.remove('active'));
        this.tabContents.forEach(content => content.classList.remove('active'));
        
        // Add active class to selected tab and content
        document.querySelector(`.tab-button[data-tab="${tabId}"]`).classList.add('active');
        document.getElementById(`${tabId}-tab`).classList.add('active');
        
        // Update active tab and save to storage
        this.activeTab = tabId;
        this.saveActiveTab();
    }

    saveActiveTab() {
        chrome.storage.local.set({ [getStorageKey(STORAGE_CONFIG.KEYS.ACTIVE_TAB)]: this.activeTab });
    }

    restoreActiveTab() {
        chrome.storage.local.get([getStorageKey(STORAGE_CONFIG.KEYS.ACTIVE_TAB)], result => {
            const activeTab = result[getStorageKey(STORAGE_CONFIG.KEYS.ACTIVE_TAB)];
            if (activeTab) {
                this.switchTab(activeTab);
            }
        });
    }
} 