import { jest, describe, test, expect, beforeEach } from '@jest/globals';
import { ApiService } from '../../js/utils/api.js';
import { API_CONFIG, MESSAGES, SYSTEM_PROMPTS, STORAGE_CONFIG } from '../../js/utils/config.js';

describe('ApiService', () => {
    let apiService;
    let mockFetch;

    beforeEach(() => {
        // Mock fetch
        mockFetch = jest.fn();
        global.fetch = mockFetch;
        
        // Setup Chrome API mock for specific tests
        chrome.storage.local.get.mockImplementation((keys, callback) => {
            const result = {};
            if (Array.isArray(keys) && keys.includes(STORAGE_CONFIG.KEYS.API_KEY)) {
                result[STORAGE_CONFIG.KEYS.API_KEY] = 'test-api-key';
            }
            callback(result);
        });
        
        apiService = new ApiService();
    });

    describe('checkGrammar', () => {
        const mockText = '私は日本語を勉強します';
        const mockResponse = {
            choices: [{
                message: {
                    content: `\`\`\`修正
私は日本語を勉強しています
\`\`\`
\`\`\`説明
より自然な表現に修正しました。
\`\`\``
                }
            }]
        };

        test('should handle successful grammar check', async () => {
            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: () => Promise.resolve(mockResponse)
            });

            const result = await apiService.checkGrammar(mockText);

            expect(mockFetch).toHaveBeenCalledWith(expect.any(String), expect.objectContaining({
                method: 'POST',
                headers: expect.objectContaining({
                    'Authorization': 'Bearer test-api-key'
                })
            }));

            // Just check that the result contains the right text, without specifying exact format
            expect(result).toContain('私は日本語を勉強しています');
            expect(result).toContain('より自然な表現に修正しました');
        });

        test('should handle API error', async () => {
            const errorMessage = 'API error';
            mockFetch.mockResolvedValueOnce({
                ok: false,
                statusText: errorMessage,
                json: () => Promise.resolve({})
            });

            await expect(apiService.checkGrammar(mockText))
                .rejects
                .toThrow('API呼び出しエラー');
        });

        test('should handle network error', async () => {
            mockFetch.mockRejectedValueOnce(new Error('Network error'));

            await expect(apiService.checkGrammar(mockText))
                .rejects
                .toThrow('API呼び出しエラー');
        });

        test('should handle missing API key', async () => {
            // Mock no API key returned
            chrome.storage.local.get.mockImplementationOnce((keys, callback) => {
                callback({});
            });

            await expect(apiService.checkGrammar(mockText))
                .rejects
                .toThrow('APIキーが設定されていません');
        });
    });

    describe('translate', () => {
        const mockText = 'こんにちは';
        const mockSourceLang = '日本語';
        const mockTargetLang = '英語';
        const mockResponse = {
            choices: [{
                message: {
                    content: 'Hello'
                }
            }]
        };

        test('should handle successful translation', async () => {
            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: () => Promise.resolve(mockResponse)
            });

            const result = await apiService.translate(mockText, mockSourceLang, mockTargetLang);

            expect(mockFetch).toHaveBeenCalledWith(expect.any(String), expect.objectContaining({
                method: 'POST',
                headers: expect.objectContaining({
                    'Authorization': 'Bearer test-api-key'
                })
            }));

            expect(result).toBe('Hello');
        });

        test('should handle API error', async () => {
            const errorMessage = 'API error';
            mockFetch.mockResolvedValueOnce({
                ok: false,
                statusText: errorMessage,
                json: () => Promise.resolve({})
            });

            await expect(apiService.translate(mockText, mockSourceLang, mockTargetLang))
                .rejects
                .toThrow('API呼び出しエラー');
        });
    });

    describe('chat', () => {
        const mockQuestion = '日本語の勉強方法を教えてください';
        const mockResponse = {
            choices: [{
                message: {
                    content: '以下の方法がおすすめです...'
                }
            }]
        };

        test('should handle successful chat', async () => {
            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: () => Promise.resolve(mockResponse)
            });

            const result = await apiService.chat(mockQuestion);

            expect(mockFetch).toHaveBeenCalledWith(expect.any(String), expect.objectContaining({
                method: 'POST',
                headers: expect.objectContaining({
                    'Authorization': 'Bearer test-api-key'
                })
            }));

            expect(result).toBe('以下の方法がおすすめです...');
        });

        test('should handle API error', async () => {
            const errorMessage = 'API error';
            mockFetch.mockResolvedValueOnce({
                ok: false,
                statusText: errorMessage,
                json: () => Promise.resolve({})
            });

            await expect(apiService.chat(mockQuestion))
                .rejects
                .toThrow('API呼び出しエラー');
        });
    });
}); 