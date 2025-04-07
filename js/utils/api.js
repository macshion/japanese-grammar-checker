import { API_CONFIG, STORAGE_CONFIG, SYSTEM_PROMPTS, getStorageKey } from './config.js';

export class ApiService {
    constructor() {
        this.API_ENDPOINT = API_CONFIG.ENDPOINT;
        this.MODEL_CONFIG = API_CONFIG.MODEL_CONFIG;
    }

    async getApiKey() {
        return new Promise((resolve) => {
            chrome.storage.local.get([getStorageKey(STORAGE_CONFIG.KEYS.API_KEY)], (result) => {
                resolve(result[getStorageKey(STORAGE_CONFIG.KEYS.API_KEY)]);
            });
        });
    }

    async makeRequest(messages) {
        const apiKey = await this.getApiKey();
        if (!apiKey) {
            throw new Error('APIキーが設定されていません。');
        }

        try {
            const response = await fetch(this.API_ENDPOINT, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${apiKey}`
                },
                body: JSON.stringify({
                    ...this.MODEL_CONFIG,
                    messages: messages
                })
            });

            const data = await response.json();
            if (data.error) {
                throw new Error(data.error.message);
            }

            return data.choices[0].message.content;
        } catch (error) {
            throw new Error(`API呼び出しエラー: ${error.message}`);
        }
    }

    // Grammar check specific request
    async checkGrammar(text) {
        const messages = [
            {
                role: "system",
                content: SYSTEM_PROMPTS.GRAMMAR_CHECK
            },
            {
                role: "user",
                content: text
            }
        ];
        return this.makeRequest(messages);
    }

    // Translation specific request
    async translate(text, sourceLanguage, targetLanguage) {
        const messages = [
            {
                role: "system",
                content: SYSTEM_PROMPTS.TRANSLATION + `\n${sourceLanguage}から${targetLanguage}に翻訳してください。`
            },
            {
                role: "user",
                content: text
            }
        ];
        return this.makeRequest(messages);
    }

    // AI Chat specific request
    async chat(text) {
        const messages = [
            {
                role: "system",
                content: SYSTEM_PROMPTS.AI_CHAT
            },
            {
                role: "user",
                content: text
            }
        ];
        return this.makeRequest(messages);
    }
} 