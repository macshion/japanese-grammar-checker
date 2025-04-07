import { StorageService } from './storage.js';

export class SettingsManager {
    constructor() {
        this.storageService = new StorageService();
    }

    /**
     * Export all settings to a JSON file
     */
    async exportSettings() {
        try {
            const data = await this.storageService.exportAllSettings();
            const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            
            // Create a temporary link and trigger download
            const a = document.createElement('a');
            a.href = url;
            a.download = `japanese-grammar-checker-settings-${new Date().toISOString().split('T')[0]}.json`;
            document.body.appendChild(a);
            a.click();
            
            // Cleanup
            setTimeout(() => {
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
            }, 100);
            
            return true;
        } catch (error) {
            console.error('Failed to export settings:', error);
            throw error;
        }
    }

    /**
     * Import settings from a JSON file
     * @param {File} file - The JSON file containing settings
     */
    async importSettings(file) {
        try {
            return new Promise((resolve, reject) => {
                const reader = new FileReader();
                
                reader.onload = async (event) => {
                    try {
                        const data = JSON.parse(event.target.result);
                        await this.storageService.importAllSettings(data);
                        resolve(true);
                    } catch (error) {
                        reject(error);
                    }
                };
                
                reader.onerror = () => {
                    reject(new Error('ファイルの読み込みに失敗しました。'));
                };
                
                reader.readAsText(file);
            });
        } catch (error) {
            console.error('Failed to import settings:', error);
            throw error;
        }
    }

    /**
     * Create a file input and trigger it for importing settings
     */
    triggerImportDialog() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'application/json';
        
        input.onchange = async (event) => {
            if (event.target.files && event.target.files.length > 0) {
                const file = event.target.files[0];
                try {
                    await this.importSettings(file);
                    alert('設定がインポートされました。アプリを再起動してください。');
                } catch (error) {
                    alert(`設定のインポートに失敗しました: ${error.message}`);
                }
            }
        };
        
        input.click();
    }
} 