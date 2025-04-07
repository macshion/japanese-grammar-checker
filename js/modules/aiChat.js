import { ApiService } from '../utils/api.js';
import { StorageService } from '../utils/storage.js';
import { UI_ELEMENTS, MESSAGES } from '../utils/config.js';

export class AiChat {
    constructor() {
        this.apiService = new ApiService();
        this.storageService = new StorageService();
        this.initializeElements();
        this.initializeEventListeners();
    }

    initializeElements() {
        this.inputText = document.getElementById(UI_ELEMENTS.CHAT_INPUT);
        this.sendButton = document.getElementById(UI_ELEMENTS.CHAT_SEND_BUTTON);
        this.clearButton = document.getElementById(UI_ELEMENTS.CHAT_CLEAR_BUTTON);
        this.loadingSpinner = document.getElementById(UI_ELEMENTS.CHAT_LOADING);
        this.resultContainer = document.getElementById(UI_ELEMENTS.CHAT_RESULT_CONTAINER);
        this.result = document.getElementById(UI_ELEMENTS.CHAT_RESULT);
        this.copyButton = document.getElementById(UI_ELEMENTS.CHAT_COPY_BUTTON);
    }

    initializeEventListeners() {
        // Clear button functionality
        this.clearButton.addEventListener('click', () => {
            this.inputText.value = '';
            this.resultContainer.classList.add('hidden');
            this.inputText.focus();
            this.updateClearButtonVisibility();
        });

        // Show/hide clear button based on input
        this.inputText.addEventListener('input', () => {
            this.updateClearButtonVisibility();
        });

        // Send button functionality
        this.sendButton.addEventListener('click', () => {
            this.sendMessage();
        });

        // Enter key to send (Shift + Enter for new line)
        this.inputText.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.sendMessage();
            }
        });

        // Copy button functionality
        this.copyButton.addEventListener('click', async () => {
            try {
                await navigator.clipboard.writeText(this.result.textContent);
                this.copyButton.classList.add('copied');
                setTimeout(() => {
                    this.copyButton.classList.remove('copied');
                }, 2000);
            } catch (err) {
                console.error('Failed to copy text:', err);
            }
        });
    }

    updateClearButtonVisibility() {
        this.clearButton.style.display = this.inputText.value.length > 0 ? 'flex' : 'none';
    }

    async sendMessage() {
        const text = this.inputText.value.trim();
        if (!text) {
            alert(MESSAGES.EMPTY_INPUT);
            return;
        }

        this.loadingSpinner.classList.remove('hidden');
        this.resultContainer.classList.add('hidden');

        try {
            const response = await this.apiService.chat(text);

            // Update UI
            this.result.textContent = response;
            this.resultContainer.classList.remove('hidden');

            // Save to history
            await this.storageService.addToHistory({
                type: 'chat',
                question: text,
                answer: response
            });

        } catch (error) {
            this.result.textContent = `${MESSAGES.ERROR_PREFIX}${error.message}`;
            this.resultContainer.classList.remove('hidden');
        } finally {
            this.loadingSpinner.classList.add('hidden');
        }
    }

    // Method to handle text updates from external sources
    updateText(text) {
        this.inputText.value = text;
        this.updateClearButtonVisibility();
        this.resultContainer.classList.add('hidden');
    }
} 