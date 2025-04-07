import { API_CONFIG } from '../config.js';

// Function to show API key input prompt
export function showApiKeyPrompt(onSaveCallback) {
    // Check if the API key prompt already exists
    if (document.querySelector('.api-key-prompt')) {
        // If it already exists, just focus on the input field
        const apiKeyInput = document.getElementById('apiKeyInput');
        if (apiKeyInput) {
            apiKeyInput.focus();
            return;
        }
    }

    const container = document.querySelector('.container');
    if (!container) {
        console.error('Container element not found');
        return;
    }
    
    const promptDiv = document.createElement('div');
    promptDiv.className = 'api-key-prompt';
    promptDiv.innerHTML = `
        <h3>APIキーの設定</h3>
        <p>OpenAI APIキーを入力してください：</p>
        <input type="password" id="apiKeyInput" placeholder="sk-..." />
        <button id="saveApiKey">保存</button>
    `;
    container.prepend(promptDiv);

    const saveApiKey = () => {
        const apiKeyInput = document.getElementById('apiKeyInput');
        if (!apiKeyInput) {
            console.error('API key input element not found');
            return;
        }
        
        const apiKey = apiKeyInput.value.trim();
        
        // Validate API key format (should start with "sk-")
        if (!apiKey) {
            alert('APIキーを入力してください。');
            return;
        }
        
        if (!apiKey.startsWith('sk-')) {
            alert('無効なAPIキー形式です。OpenAI APIキーは "sk-" で始まります。');
            return;
        }
        
        if (apiKey.length < 20) {
            alert('APIキーが短すぎます。有効なOpenAI APIキーを入力してください。');
            return;
        }
        
        chrome.storage.local.set({ [API_CONFIG.STORAGE_KEYS.API_KEY]: apiKey }, () => {
            promptDiv.remove();
            // If a callback was provided, call it after saving the API key
            if (typeof onSaveCallback === 'function') {
                onSaveCallback(apiKey);
            }
        });
    };

    // Add click event listener
    const saveButton = document.getElementById('saveApiKey');
    saveButton?.addEventListener('click', saveApiKey);
    
    // Add Enter key support
    const apiKeyInput = document.getElementById('apiKeyInput');
    apiKeyInput?.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            saveApiKey();
        }
    });
    
    // Focus the input field
    apiKeyInput?.focus();
}