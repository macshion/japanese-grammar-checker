import { API_CONFIG } from '../config.js';

// Function to show API key input prompt
export function showApiKeyPrompt() {
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
    const promptDiv = document.createElement('div');
    promptDiv.className = 'api-key-prompt';
    promptDiv.innerHTML = `
        <h3>APIキーの設定</h3>
        <p>OpenAI APIキーを入力してください：</p>
        <input type="password" id="apiKeyInput" placeholder="sk-..." />
        <button id="saveApiKey">保存</button>
    `;
    container.prepend(promptDiv);

    document.getElementById('saveApiKey').addEventListener('click', () => {
        const apiKey = document.getElementById('apiKeyInput').value.trim();
        if (apiKey) {
            chrome.storage.local.set({ [API_CONFIG.STORAGE_KEYS.API_KEY]: apiKey }, () => {
                promptDiv.remove();
            });
        }
    });
}