import { ApiService } from '../utils/api.js';
import { StorageService } from '../utils/storage.js';
import { UI_ELEMENTS, MESSAGES } from '../utils/config.js';

export class GrammarChecker {
    constructor() {
        this.apiService = new ApiService();
        this.storageService = new StorageService();
        this.initializeElements();
        this.initializeEventListeners();
    }

    initializeElements() {
        this.inputText = document.getElementById(UI_ELEMENTS.GRAMMAR_INPUT);
        this.checkButton = document.getElementById(UI_ELEMENTS.GRAMMAR_CHECK_BUTTON);
        this.clearButton = document.getElementById(UI_ELEMENTS.GRAMMAR_CLEAR_BUTTON);
        this.loadingSpinner = document.getElementById(UI_ELEMENTS.GRAMMAR_LOADING);
        this.resultContainer = document.getElementById(UI_ELEMENTS.GRAMMAR_RESULT_CONTAINER);
        this.result = document.getElementById(UI_ELEMENTS.GRAMMAR_RESULT);
        this.copyButton = document.getElementById(UI_ELEMENTS.GRAMMAR_COPY_BUTTON);
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

        // Check button functionality
        this.checkButton.addEventListener('click', () => {
            this.checkGrammar();
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

    async checkGrammar() {
        const text = this.inputText.value.trim();
        if (!text) {
            alert(MESSAGES.EMPTY_INPUT);
            return;
        }

        this.loadingSpinner.classList.remove('hidden');
        this.resultContainer.classList.add('hidden');

        try {
            const response = await this.apiService.checkGrammar(text);
            
            // Extract corrected text and explanation if available
            let correctedText = response;
            let explanation = '';
            
            const correctionMatch = response.match(/```修正\n([\s\S]*?)\n```/);
            const explanationMatch = response.match(/```説明\n([\s\S]*?)\n```/);
            
            if (correctionMatch && correctionMatch[1]) {
                correctedText = correctionMatch[1].trim();
            }
            
            if (explanationMatch && explanationMatch[1]) {
                explanation = explanationMatch[1].trim();
            }

            // Update UI
            this.result.textContent = correctedText;
            this.resultContainer.classList.remove('hidden');

            // Save to history
            await this.storageService.addToHistory({
                type: 'grammar',
                originalText: text,
                correctedText: correctedText,
                explanation: explanation,
                fullResponse: response
            });

        } catch (error) {
            this.result.textContent = `${MESSAGES.ERROR_PREFIX}${error.message}`;
            this.resultContainer.classList.remove('hidden');
        } finally {
            this.loadingSpinner.classList.add('hidden');
        }
    }

    // Method to handle text updates from external sources (e.g., context menu)
    updateText(text) {
        this.inputText.value = text;
        this.updateClearButtonVisibility();
        this.resultContainer.classList.add('hidden');
    }
} 