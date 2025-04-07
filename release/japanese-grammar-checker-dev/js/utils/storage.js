import { STORAGE_CONFIG } from './config.js';

export class StorageService {
    constructor() {
        this.STORAGE_KEYS = STORAGE_CONFIG.KEYS;
        this.MAX_HISTORY_ITEMS = STORAGE_CONFIG.MAX_HISTORY_ITEMS;
    }

    async getHistory() {
        return new Promise((resolve) => {
            chrome.storage.local.get([this.STORAGE_KEYS.HISTORY], (result) => {
                resolve(result[this.STORAGE_KEYS.HISTORY] || []);
            });
        });
    }

    async getApiKey() {
        return new Promise((resolve) => {
            chrome.storage.local.get([this.STORAGE_KEYS.API_KEY], (result) => {
                resolve(result[this.STORAGE_KEYS.API_KEY]);
            });
        });
    }

    async setApiKey(apiKey) {
        return new Promise((resolve) => {
            chrome.storage.local.set({
                [this.STORAGE_KEYS.API_KEY]: apiKey
            }, resolve);
        });
    }

    async addToHistory(item) {
        const history = await this.getHistory();
        history.unshift({
            ...item,
            timestamp: new Date().toISOString()
        });

        // Limit history size
        if (history.length > this.MAX_HISTORY_ITEMS) {
            history.length = this.MAX_HISTORY_ITEMS;
        }

        return new Promise((resolve) => {
            chrome.storage.local.set({
                [this.STORAGE_KEYS.HISTORY]: history
            }, () => resolve(history));
        });
    }

    async clearHistory() {
        return new Promise((resolve) => {
            chrome.storage.local.remove([this.STORAGE_KEYS.HISTORY], resolve);
        });
    }

    async exportHistory() {
        const history = await this.getHistory();
        return {
            exportDate: new Date().toISOString(),
            history: history
        };
    }

    async importHistory(data) {
        if (!data.history || !Array.isArray(data.history)) {
            throw new Error('無効なファイル形式です。');
        }

        let combinedHistory = [...data.history];
        const existingHistory = await this.getHistory();

        // Combine and deduplicate based on timestamp
        combinedHistory = [...combinedHistory, ...existingHistory];
        const uniqueHistory = Array.from(new Map(combinedHistory.map(item => [item.timestamp, item])).values());

        // Sort by timestamp (newest first) and limit size
        uniqueHistory.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
        if (uniqueHistory.length > this.MAX_HISTORY_ITEMS) {
            uniqueHistory.length = this.MAX_HISTORY_ITEMS;
        }

        return new Promise((resolve) => {
            chrome.storage.local.set({
                [this.STORAGE_KEYS.HISTORY]: uniqueHistory
            }, () => resolve(uniqueHistory));
        });
    }

    async exportAllSettings() {
        return new Promise((resolve) => {
            chrome.storage.local.get(null, (data) => {
                const exportData = {
                    exportDate: new Date().toISOString(),
                    settings: data
                };
                resolve(exportData);
            });
        });
    }

    async importAllSettings(data) {
        if (!data.settings || typeof data.settings !== 'object') {
            throw new Error('無効なファイル形式です。');
        }

        return new Promise((resolve) => {
            chrome.storage.local.set(data.settings, () => {
                resolve(true);
            });
        });
    }
} 