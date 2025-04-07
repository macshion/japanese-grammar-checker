import { StorageService } from '../utils/storage.js';
import { UI_ELEMENTS, MESSAGES, HISTORY_CONFIG } from '../utils/config.js';

export class History {
    constructor() {
        this.storageService = new StorageService();
        this.currentFilter = null; // null means show all
        this.initializeElements();
        this.initializeFilterButtons();
        this.initializeEventListeners();
        this.updateHistoryList();
    }

    initializeElements() {
        this.historyList = document.getElementById(UI_ELEMENTS.HISTORY_LIST);
        this.historyContainer = document.getElementById(UI_ELEMENTS.HISTORY_CONTAINER);
        this.filterContainer = document.getElementById(UI_ELEMENTS.HISTORY_FILTER_CONTAINER);
        this.clearButton = document.getElementById(UI_ELEMENTS.HISTORY_CLEAR_BUTTON);
        this.exportButton = document.getElementById(UI_ELEMENTS.HISTORY_EXPORT_BUTTON);
        this.importButton = document.getElementById(UI_ELEMENTS.HISTORY_IMPORT_BUTTON);
        this.importFile = document.getElementById(UI_ELEMENTS.HISTORY_IMPORT_FILE);
    }

    initializeFilterButtons() {
        // Create "All" filter button
        const allButton = this.createFilterButton('all', '全て');
        this.filterContainer.appendChild(allButton);

        // Create filter button for each type
        Object.entries(HISTORY_CONFIG.TYPE_LABELS).forEach(([type, label]) => {
            const button = this.createFilterButton(type, label);
            this.filterContainer.appendChild(button);
        });
    }

    createFilterButton(type, label) {
        const button = document.createElement('button');
        button.className = 'history-filter-button' + (type === 'all' ? ' active' : '');
        button.dataset.type = type;
        button.textContent = label;
        button.addEventListener('click', () => this.filterHistory(type));
        return button;
    }

    initializeEventListeners() {
        // Clear history button
        this.clearButton?.addEventListener('click', () => {
            if (confirm(MESSAGES.CONFIRM_CLEAR_HISTORY)) {
                this.clearHistory();
            }
        });

        // Export history button
        this.exportButton?.addEventListener('click', () => {
            this.exportHistory();
        });

        // Import history button
        this.importButton?.addEventListener('click', () => {
            this.importFile.click();
        });

        // Import file change
        this.importFile?.addEventListener('change', (event) => {
            this.handleImportFile(event);
        });
    }

    async updateHistoryList() {
        try {
            const history = await this.storageService.getHistory();
            const filteredHistory = this.currentFilter
                ? history.filter(item => item.type === this.currentFilter)
                : history;

            if (filteredHistory.length === 0) {
                this.historyList.innerHTML = `<li class="text-gray-500">${MESSAGES.HISTORY_EMPTY}</li>`;
                return;
            }

            this.historyList.innerHTML = filteredHistory.map((item, index) => this.createHistoryItemHTML(item, index)).join('');
            this.addHistoryItemEventListeners(filteredHistory);

        } catch (error) {
            console.error('Failed to load history:', error);
            this.historyList.innerHTML = `<li class="text-red-500">${MESSAGES.ERROR_PREFIX}${error.message}</li>`;
        }
    }

    createHistoryItemHTML(item, index) {
        const typeLabel = HISTORY_CONFIG.TYPE_LABELS[item.type];
        let contentHtml = '';

        switch (item.type) {
            case HISTORY_CONFIG.TYPES.GRAMMAR:
                contentHtml = `
                    <div class="mt-2 text-gray-600 corrected-text">${item.correctedText}</div>
                    ${item.explanation ? '<div class="mt-1 text-gray-500 explanation-text">' + item.explanation + '</div>' : ''}
                `;
                break;
            case HISTORY_CONFIG.TYPES.TRANSLATION:
                contentHtml = `
                    <div class="mt-2 text-gray-600">
                        <span class="font-semibold">${item.sourceLanguage} → ${item.targetLanguage}</span>
                        <div class="mt-1 translated-text">${item.translatedText}</div>
                    </div>
                `;
                break;
            case HISTORY_CONFIG.TYPES.CHAT:
                contentHtml = `
                    <div class="mt-2 text-gray-600">
                        <div class="font-semibold">Q: ${item.question}</div>
                        <div class="mt-1 chat-answer">A: ${item.answer}</div>
                    </div>
                `;
                break;
        }

        return `
            <li class="history-item border-b border-gray-200 p-4 hover:bg-gray-50 ${index === 0 ? 'selected' : ''}" data-index="${index}">
                <div class="flex justify-between items-start">
                    <div class="flex items-center gap-2">
                        <span class="text-sm text-gray-600">${new Date(item.timestamp).toLocaleString('ja-JP')}</span>
                        <span class="text-xs px-2 py-1 rounded bg-gray-100">${typeLabel}</span>
                    </div>
                    <div class="history-actions">
                        <button class="history-copy-btn icon-button" title="コピー">📋</button>
                        <button class="history-view-original-btn icon-button" title="原文を表示">📄</button>
                        ${item.explanation ? '<button class="history-view-explanation-btn icon-button" title="説明を表示">ℹ️</button>' : ''}
                        ${item.fullResponse ? '<button class="history-view-full-btn icon-button" title="完全な応答を表示">👁️</button>' : ''}
                        <button class="history-delete-btn icon-button" title="削除">🗑️</button>
                    </div>
                </div>
                ${contentHtml}
            </li>
        `;
    }

    addHistoryItemEventListeners(history) {
        this.historyList.querySelectorAll('.history-item').forEach(item => {
            const index = parseInt(item.getAttribute('data-index'));

            // Copy button
            item.querySelector('.history-copy-btn').addEventListener('click', (e) => {
                e.stopPropagation();
                const textToCopy = this.getHistoryItemText(history[index]);
                navigator.clipboard.writeText(textToCopy);
                const button = e.target;
                const originalText = button.textContent;
                button.textContent = '✓';
                setTimeout(() => {
                    button.textContent = originalText;
                }, 1000);
            });

            // Delete button
            item.querySelector('.history-delete-btn').addEventListener('click', async (e) => {
                e.stopPropagation();
                if (confirm('この履歴を削除しますか？')) {
                    const updatedHistory = [...history];
                    updatedHistory.splice(index, 1);
                    await this.storageService.clearHistory();
                    await this.storageService.importHistory({ history: updatedHistory });
                    this.updateHistoryList();
                }
            });

            // Add other button event listeners as needed
            // View original, explanation, full response, etc.
        });
    }

    getHistoryItemText(item) {
        switch (item.type) {
            case HISTORY_CONFIG.TYPES.GRAMMAR:
                return item.correctedText;
            case HISTORY_CONFIG.TYPES.TRANSLATION:
                return item.translatedText;
            case HISTORY_CONFIG.TYPES.CHAT:
                return item.answer;
            default:
                return '';
        }
    }

    filterHistory(type) {
        // Update filter buttons
        this.filterContainer.querySelectorAll('.history-filter-button').forEach(button => {
            button.classList.toggle('active', button.dataset.type === type);
        });

        // Update current filter
        this.currentFilter = type === 'all' ? null : type;

        // Update history list
        this.updateHistoryList();
    }

    async clearHistory() {
        try {
            await this.storageService.clearHistory();
            this.updateHistoryList();
            alert(MESSAGES.HISTORY_CLEARED);
        } catch (error) {
            console.error('Failed to clear history:', error);
            alert(`${MESSAGES.ERROR_PREFIX}${error.message}`);
        }
    }

    async exportHistory() {
        try {
            const exportData = await this.storageService.exportHistory();
            const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `japanese-grammar-history-${new Date().toISOString().slice(0, 10)}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Failed to export history:', error);
            alert(`${MESSAGES.HISTORY_EXPORT_ERROR}${error.message}`);
        }
    }

    async handleImportFile(event) {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = async (e) => {
            try {
                const data = JSON.parse(e.target.result);
                if (confirm(MESSAGES.CONFIRM_IMPORT_HISTORY)) {
                    await this.storageService.importHistory(data);
                    this.updateHistoryList();
                    alert(`${data.history.length}件の履歴をインポートしました。`);
                }
            } catch (error) {
                console.error('Failed to import history:', error);
                alert(`${MESSAGES.HISTORY_IMPORT_ERROR}${error.message}`);
            }
            event.target.value = ''; // Reset file input
        };
        reader.readAsText(file);
    }
} 