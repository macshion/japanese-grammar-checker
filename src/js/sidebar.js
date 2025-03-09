import { API_CONFIG, SYSTEM_PROMPT, UI_ELEMENTS, UI_MESSAGES, STORAGE_CONFIG } from './config.js';
import { showApiKeyPrompt } from './modules/showApiKeyPrompt.js';
import { updateHistoryList } from './modules/updateHistoryList.js';

// Check for selected text in storage when sidebar loads
document.addEventListener('DOMContentLoaded', () => {
    // Load API key from storage
    chrome.storage.local.get([API_CONFIG.STORAGE_KEYS.API_KEY], (result) => {
        if (!result[API_CONFIG.STORAGE_KEYS.API_KEY]) {
            // Show API key input if not set
            showApiKeyPrompt();
        }
    });

    // Check for selected text
    chrome.storage.local.get(['selectedText'], (result) => {
        if (result.selectedText) {
            document.getElementById(UI_ELEMENTS.INPUT_TEXT).value = result.selectedText;
            // Clear the storage after retrieving
            chrome.storage.local.remove(['selectedText']);
        }
    });

    // Load initial history
    updateHistoryList();
});


document.addEventListener('DOMContentLoaded', () => {
    const inputText = document.getElementById(UI_ELEMENTS.INPUT_TEXT);
    const checkButton = document.getElementById(UI_ELEMENTS.CHECK_BUTTON);
    const clearButton = document.getElementById(UI_ELEMENTS.CLEAR_BUTTON);
    const loadingSpinner = document.getElementById(UI_ELEMENTS.LOADING_SPINNER);
    const resultContainer = document.getElementById(UI_ELEMENTS.RESULT_CONTAINER);
    const result = document.getElementById(UI_ELEMENTS.RESULT);
    const copyButton = document.getElementById(UI_ELEMENTS.COPY_BUTTON);
    const clearHistoryButton = document.getElementById(UI_ELEMENTS.CLEAR_HISTORY_BUTTON);
    const exportHistoryButton = document.getElementById(UI_ELEMENTS.EXPORT_HISTORY_BUTTON);
    const importHistoryButton = document.getElementById(UI_ELEMENTS.IMPORT_HISTORY_BUTTON);
    const importHistoryFile = document.getElementById(UI_ELEMENTS.IMPORT_HISTORY_FILE);

    // Import history button functionality
    importHistoryButton?.addEventListener('click', () => {
        importHistoryFile.click();
    });

    // Import history file change handler
    importHistoryFile?.addEventListener('change', (event) => {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const importedData = JSON.parse(e.target.result);
                
                // Validate the imported data
                if (!importedData.history || !Array.isArray(importedData.history)) {
                    throw new Error('無効なファイル形式です。');
                }
                
                // Confirm import
                if (confirm(`${importedData.history.length}件の履歴をインポートしますか？既存の履歴と統合されます。`)) {
                    // Get current history
                    chrome.storage.local.get([STORAGE_CONFIG.KEYS.HISTORY], (result) => {
                        let currentHistory = result[STORAGE_CONFIG.KEYS.HISTORY] || [];
                        
                        // Merge histories (add imported items to the beginning)
                        const mergedHistory = [...importedData.history, ...currentHistory];
                        
                        // Remove duplicates based on timestamp
                        const uniqueHistory = [];
                        const timestamps = new Set();
                        
                        for (const item of mergedHistory) {
                            if (!timestamps.has(item.timestamp)) {
                                timestamps.add(item.timestamp);
                                uniqueHistory.push(item);
                            }
                        }
                        
                        // Sort by timestamp (newest first)
                        uniqueHistory.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
                        
                        // Limit to max history items
                        if (uniqueHistory.length > STORAGE_CONFIG.MAX_HISTORY_ITEMS) {
                            uniqueHistory.length = STORAGE_CONFIG.MAX_HISTORY_ITEMS;
                        }
                        
                        // Save merged history
                        chrome.storage.local.set({ [STORAGE_CONFIG.KEYS.HISTORY]: uniqueHistory }, () => {
                            updateHistoryList();
                            alert(`${importedData.history.length}件の履歴をインポートしました。`);
                        });
                    });
                }
            } catch (error) {
                console.error('Failed to import history:', error);
                alert(`インポート中にエラーが発生しました: ${error.message}`);
            }
            
            // Reset the file input
            importHistoryFile.value = '';
        };
        
        reader.readAsText(file);
    });

    // Export history button functionality
    exportHistoryButton?.addEventListener('click', () => {
        try {
            chrome.storage.local.get([STORAGE_CONFIG.KEYS.HISTORY], (result) => {
                const history = result[STORAGE_CONFIG.KEYS.HISTORY] || [];
                
                if (history.length === 0) {
                    alert('エクスポートする履歴がありません。');
                    return;
                }
                
                // Create a formatted history object with timestamp
                const exportData = {
                    exportDate: new Date().toISOString(),
                    history: history
                };
                
                // Convert to JSON string
                const jsonString = JSON.stringify(exportData, null, 2);
                
                // Create a blob with the data
                const blob = new Blob([jsonString], { type: 'application/json' });
                
                // Create a URL for the blob
                const url = URL.createObjectURL(blob);
                
                // Create a temporary link element
                const a = document.createElement('a');
                a.href = url;
                a.download = `japanese-grammar-history-${new Date().toISOString().slice(0, 10)}.json`;
                
                // Append to the document, click it, and remove it
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                
                // Release the URL object
                URL.revokeObjectURL(url);
            });
        } catch (error) {
            console.error('Failed to export history:', error);
            alert(`エクスポート中にエラーが発生しました: ${error.message}`);
        }
    });

    // Clear history button functionality
    clearHistoryButton?.addEventListener('click', () => {
        if (confirm('すべての履歴を削除しますか？')) {
            try {
                chrome.storage.local.remove([STORAGE_CONFIG.KEYS.HISTORY], () => {
                    updateHistoryList();
                    alert(UI_MESSAGES.HISTORY_CLEARED);
                });
            } catch (error) {
                console.error('Failed to clear history:', error);
                alert(`${UI_MESSAGES.ERROR_PREFIX}${error.message}`);
            }
        }
    });

    // Clear button functionality
    clearButton.addEventListener('click', () => {
        inputText.value = '';
        resultContainer.classList.add('hidden');
        inputText.focus();
    });

    // Show/hide clear button based on input
    inputText.addEventListener('input', () => {
        clearButton.style.display = inputText.value.length > 0 ? 'flex' : 'none';
    });

    // Initially hide clear button
    clearButton.style.display = 'none';

    // Copy button functionality
    copyButton.addEventListener('click', async () => {
        try {
            await navigator.clipboard.writeText(result.textContent);
            copyButton.classList.add('copied');
            
            // Reset button state after 2 seconds
            setTimeout(() => {
                copyButton.classList.remove('copied');
            }, 2000);
        } catch (err) {
            console.error('Failed to copy text:', err);
        }
    });

    checkButton.addEventListener('click', async () => {
        if (!inputText.value.trim()) {
            alert(UI_MESSAGES.EMPTY_INPUT);
            return;
        }

        // Get API key from storage
        chrome.storage.local.get([API_CONFIG.STORAGE_KEYS.API_KEY], async (result) => {
            const apiKey = result[API_CONFIG.STORAGE_KEYS.API_KEY];
            
            if (!apiKey) {
                alert(UI_MESSAGES.API_KEY_MISSING);
                showApiKeyPrompt();
                return;
            }

            loadingSpinner.classList.remove('hidden');
            resultContainer.classList.add('hidden');
            result.textContent = '';

            try {
                const response = await fetch(API_CONFIG.API_ENDPOINT, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${apiKey}`
                    },
                    body: JSON.stringify({
                        ...API_CONFIG.MODEL_CONFIG,
                        messages: [
                            {
                                role: "system",
                                content: SYSTEM_PROMPT.GRAMMAR_CHECK
                            },
                            {
                                role: "user",
                                content: inputText.value
                            }
                        ]
                    })
                });

                const data = await response.json();
                
                if (data.error) {
                    throw new Error(data.error.message);
                }

                const fullResponse = data.choices[0].message.content;
                
                // Extract only the corrected text from the response
                let correctedText = fullResponse;
                const correctionMatch = fullResponse.match(/```修正\n([\s\S]*?)\n```/);
                
                if (correctionMatch && correctionMatch[1]) {
                    correctedText = correctionMatch[1].trim();
                }
                
                // Store the full response for reference
                const explanationMatch = fullResponse.match(/```説明\n([\s\S]*?)\n```/);
                const explanation = explanationMatch && explanationMatch[1] ? explanationMatch[1].trim() : '';
                
                // Display only the corrected text in the result
                result.textContent = correctedText;
                resultContainer.classList.remove('hidden');

                // Save to history
                try {
                    chrome.storage.local.get([STORAGE_CONFIG.KEYS.HISTORY], (result) => {
                        const history = result[STORAGE_CONFIG.KEYS.HISTORY] || [];
                        history.unshift({
                            timestamp: new Date().toISOString(),
                            originalText: inputText.value,
                            correctedText: correctedText,
                            fullResponse: fullResponse,
                            explanation: explanation
                        });

                        // Keep only the latest MAX_HISTORY_ITEMS items
                        if (history.length > STORAGE_CONFIG.MAX_HISTORY_ITEMS) {
                            history.length = STORAGE_CONFIG.MAX_HISTORY_ITEMS;
                        }

                        chrome.storage.local.set({ [STORAGE_CONFIG.KEYS.HISTORY]: history }, () => {
                            updateHistoryList();
                            // After updating the history list, select the first item automatically
                            setTimeout(() => {
                                const firstHistoryItem = document.querySelector('.history-item');
                                if (firstHistoryItem) {
                                    // Add a selected class to highlight the item
                                    firstHistoryItem.classList.add('selected');
                                    
                                    // No need to set input text again as it's already there
                                    // But we need to make sure the result is displayed
                                    document.getElementById(UI_ELEMENTS.RESULT).textContent = history[0].correctedText;
                                    document.getElementById(UI_ELEMENTS.RESULT_CONTAINER).classList.remove('hidden');
                                }
                            }, 100); // Small delay to ensure the history list is updated
                        });
                    });
                } catch (historyError) {
                    console.error('Failed to save to history:', historyError);
                }
            } catch (error) {
                result.textContent = `${UI_MESSAGES.ERROR_PREFIX}${error.message}`;
                resultContainer.classList.remove('hidden');
            } finally {
                loadingSpinner.classList.add('hidden');
            }
        });
    });
}); 