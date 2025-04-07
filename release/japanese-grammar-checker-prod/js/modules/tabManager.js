export class TabManager {
    constructor() {
        this.tabs = document.querySelectorAll('.tab-button');
        this.contents = document.querySelectorAll('.tab-content');
        this.activeTab = 'grammar'; // Default active tab
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
        // Update active tab
        this.activeTab = tabId;

        // Update tab buttons
        this.tabs.forEach(tab => {
            if (tab.getAttribute('data-tab') === tabId) {
                tab.classList.add('active');
            } else {
                tab.classList.remove('active');
            }
        });

        // Update tab contents
        this.contents.forEach(content => {
            if (content.id === `${tabId}-tab`) {
                content.classList.add('active');
            } else {
                content.classList.remove('active');
            }
        });

        // Save active tab to storage
        chrome.storage.local.set({ activeTab: tabId });
    }

    // Restore last active tab
    restoreActiveTab() {
        chrome.storage.local.get(['activeTab'], (result) => {
            if (result.activeTab) {
                this.switchTab(result.activeTab);
            }
        });
    }
} 