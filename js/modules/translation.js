import { ApiService } from '../utils/api.js';
import { StorageService } from '../utils/storage.js';
import { UI_ELEMENTS, MESSAGES, LANGUAGE_CONFIG, HISTORY_CONFIG } from '../utils/config.js';

export class Translator {
    constructor() {
        this.apiService = new ApiService();
        this.storageService = new StorageService();
        this.initializeElements();
        this.initializeLanguageOptions();
        this.initializeEventListeners();
    }

    initializeElements() {
        this.inputText = document.getElementById(UI_ELEMENTS.TRANSLATION_INPUT);
        this.sourceLanguage = document.getElementById(UI_ELEMENTS.TRANSLATION_SOURCE);
        this.targetLanguage = document.getElementById(UI_ELEMENTS.TRANSLATION_TARGET);
        this.translateButton = document.getElementById(UI_ELEMENTS.TRANSLATION_BUTTON);
        this.clearButton = document.getElementById(UI_ELEMENTS.TRANSLATION_CLEAR_BUTTON);
        this.loadingSpinner = document.getElementById(UI_ELEMENTS.TRANSLATION_LOADING);
        this.resultContainer = document.getElementById(UI_ELEMENTS.TRANSLATION_RESULT_CONTAINER);
        this.result = document.getElementById(UI_ELEMENTS.TRANSLATION_RESULT);
        this.copyButton = document.getElementById(UI_ELEMENTS.TRANSLATION_COPY_BUTTON);
    }

    initializeLanguageOptions() {
        // Clear existing options
        this.sourceLanguage.innerHTML = '';
        this.targetLanguage.innerHTML = '';

        // Add language options
        Object.entries(LANGUAGE_CONFIG.LANGUAGES).forEach(([code, name]) => {
            const sourceOption = document.createElement('option');
            sourceOption.value = code;
            sourceOption.textContent = name;
            this.sourceLanguage.appendChild(sourceOption);

            const targetOption = document.createElement('option');
            targetOption.value = code;
            targetOption.textContent = name;
            this.targetLanguage.appendChild(targetOption);
        });

        // Set default values
        this.sourceLanguage.value = LANGUAGE_CONFIG.DEFAULT_SOURCE;
        this.targetLanguage.value = LANGUAGE_CONFIG.DEFAULT_TARGET;
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

        // Translate button functionality
        this.translateButton.addEventListener('click', () => {
            this.translate();
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

        // Language swap prevention and validation
        this.sourceLanguage.addEventListener('change', () => {
            this.validateLanguageSelection();
        });

        this.targetLanguage.addEventListener('change', () => {
            this.validateLanguageSelection();
        });
    }

    validateLanguageSelection() {
        const sourceLang = this.sourceLanguage.value;
        const targetLang = this.targetLanguage.value;

        if (sourceLang === targetLang) {
            // Find a different target language
            const availableLangs = Object.keys(LANGUAGE_CONFIG.LANGUAGES);
            const otherLang = availableLangs.find(lang => lang !== sourceLang);
            if (otherLang) {
                this.targetLanguage.value = otherLang;
            }
        }

        // Validate selected languages
        if (!LANGUAGE_CONFIG.LANGUAGES[sourceLang] || !LANGUAGE_CONFIG.LANGUAGES[targetLang]) {
            alert(MESSAGES.INVALID_LANGUAGE);
            return false;
        }

        return true;
    }

    updateClearButtonVisibility() {
        this.clearButton.style.display = this.inputText.value.length > 0 ? 'flex' : 'none';
    }

    getLanguageName(code) {
        return LANGUAGE_CONFIG.LANGUAGES[code] || code;
    }

    async translate() {
        const text = this.inputText.value.trim();
        if (!text) {
            alert(MESSAGES.EMPTY_INPUT);
            return;
        }

        if (!this.validateLanguageSelection()) {
            return;
        }

        this.loadingSpinner.classList.remove('hidden');
        this.resultContainer.classList.add('hidden');

        try {
            const sourceLang = this.getLanguageName(this.sourceLanguage.value);
            const targetLang = this.getLanguageName(this.targetLanguage.value);
            
            const response = await this.apiService.translate(
                text,
                sourceLang,
                targetLang
            );

            // Update UI
            this.result.textContent = response;
            this.resultContainer.classList.remove('hidden');

            // Save to history
            await this.storageService.addToHistory({
                type: HISTORY_CONFIG.TYPES.TRANSLATION,
                originalText: text,
                translatedText: response,
                sourceLanguage: sourceLang,
                targetLanguage: targetLang
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