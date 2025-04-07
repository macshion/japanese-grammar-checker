import { STORAGE_CONFIG, getStorageKey } from './config.js';

export class StorageService {
    constructor() {
        this.STORAGE_KEYS = STORAGE_CONFIG.KEYS;
        this.MAX_HISTORY_ITEMS = STORAGE_CONFIG.MAX_HISTORY_ITEMS;
    }

    async getHistory() {
        return new Promise((resolve) => {
            chrome.storage.local.get([getStorageKey(this.STORAGE_KEYS.HISTORY)], (result) => {
                resolve(result[getStorageKey(this.STORAGE_KEYS.HISTORY)] || []);
            });
        });
    }

    async getApiKey() {
        return new Promise((resolve) => {
            chrome.storage.local.get([getStorageKey(this.STORAGE_KEYS.API_KEY)], (result) => {
                resolve(result[getStorageKey(this.STORAGE_KEYS.API_KEY)]);
            });
        });
    }

    async setApiKey(apiKey) {
        return new Promise((resolve) => {
            chrome.storage.local.set({
                [getStorageKey(this.STORAGE_KEYS.API_KEY)]: apiKey
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
                [getStorageKey(this.STORAGE_KEYS.HISTORY)]: history
            }, () => resolve(history));
        });
    }

    async clearHistory() {
        return new Promise((resolve) => {
            chrome.storage.local.remove([getStorageKey(this.STORAGE_KEYS.HISTORY)], resolve);
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
                [getStorageKey(this.STORAGE_KEYS.HISTORY)]: uniqueHistory
            }, () => resolve(uniqueHistory));
        });
    }

    async exportAllSettings() {
        return new Promise((resolve) => {
            chrome.storage.local.get(null, (data) => {
                // 筛选出当前环境的设置（开发版或生产版）
                const prefix = getStorageKey('').replace('_', '');
                const filteredData = {};
                
                Object.keys(data).forEach(key => {
                    if (!prefix || key.startsWith(prefix)) {
                        // 如果是导出开发版设置，移除dev_前缀以便可以导入到生产版
                        const normalizedKey = prefix ? key.replace(prefix + '_', '') : key;
                        filteredData[normalizedKey] = data[key];
                    }
                });
                
                const exportData = {
                    exportDate: new Date().toISOString(),
                    settings: filteredData
                };
                resolve(exportData);
            });
        });
    }

    async importAllSettings(data) {
        if (!data.settings || typeof data.settings !== 'object') {
            throw new Error('無効なファイル形式です。');
        }

        // 添加当前环境的前缀
        const prefix = getStorageKey('').replace('_', '');
        const prefixedData = {};
        
        Object.keys(data.settings).forEach(key => {
            const prefixedKey = prefix ? `${prefix}_${key}` : key;
            prefixedData[prefixedKey] = data.settings[key];
        });

        return new Promise((resolve) => {
            chrome.storage.local.set(prefixedData, () => {
                resolve(true);
            });
        });
    }
} 