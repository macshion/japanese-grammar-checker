import { API_CONFIG, SYSTEM_PROMPT, UI_ELEMENTS, UI_MESSAGES, STORAGE_CONFIG } from './config.js';

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

// Function to show API key input prompt
function showApiKeyPrompt() {
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

// Helper function to update history list UI
async function updateHistoryList() {
    const historyList = document.getElementById(UI_ELEMENTS.HISTORY_LIST);
    const historyContainer = document.getElementById(UI_ELEMENTS.HISTORY_CONTAINER);
    
    try {
        chrome.storage.local.get([STORAGE_CONFIG.KEYS.HISTORY], (result) => {
            const history = result[STORAGE_CONFIG.KEYS.HISTORY] || [];
            
            if (history.length === 0) {
                historyList.innerHTML = `<li class="text-gray-500">${UI_MESSAGES.HISTORY_EMPTY}</li>`;
                return;
            }

            historyList.innerHTML = history.map((item, index) => `
                <li class="history-item border-b border-gray-200 p-4 hover:bg-gray-50 ${index === 0 ? 'selected' : ''}" data-index="${index}">
                    <div class="flex justify-between items-start">
                        <div class="text-sm text-gray-600">${new Date(item.timestamp).toLocaleString('ja-JP')}</div>
                        <div class="history-actions">
                            <button class="history-copy-btn icon-button" title="修正文をコピー">📋</button>
                            <button class="history-view-original-btn icon-button" title="原文を表示">📄</button>
                            ${item.explanation ? `<button class="history-view-explanation-btn icon-button" title="説明を表示">ℹ️</button>` : ''}
                            ${item.fullResponse ? `<button class="history-view-full-btn icon-button" title="完全な応答を表示">👁️</button>` : ''}
                            <button class="history-delete-btn icon-button" title="削除">🗑️</button>
                        </div>
                    </div>
                    <div class="mt-2 text-gray-600 corrected-text">${item.correctedText}</div>
                </li>
            `).join('');

            // Add click events to history items
            historyList.querySelectorAll('.history-item').forEach((li) => {
                const index = parseInt(li.getAttribute('data-index'));
                
                // Click on the item to load it into the input and result areas
                li.addEventListener('click', (e) => {
                    // Don't trigger if clicking on buttons
                    if (e.target.closest('.history-actions')) {
                        return;
                    }
                    
                    // Remove selected class from all items
                    historyList.querySelectorAll('.history-item').forEach(item => {
                        item.classList.remove('selected');
                    });
                    
                    // Add selected class to clicked item
                    li.classList.add('selected');
                    
                    document.getElementById(UI_ELEMENTS.INPUT_TEXT).value = history[index].originalText;
                    document.getElementById(UI_ELEMENTS.RESULT).textContent = history[index].correctedText;
                    document.getElementById(UI_ELEMENTS.RESULT_CONTAINER).classList.remove('hidden');
                });
                
                // Copy button - copy corrected text
                li.querySelector('.history-copy-btn').addEventListener('click', (e) => {
                    e.stopPropagation();
                    navigator.clipboard.writeText(history[index].correctedText);
                    
                    // Show feedback
                    const btn = e.target;
                    const originalText = btn.textContent;
                    btn.textContent = '✓';
                    setTimeout(() => {
                        btn.textContent = originalText;
                    }, 1000);
                });
                
                // View original text button
                const viewOriginalBtn = li.querySelector('.history-view-original-btn');
                if (viewOriginalBtn) {
                    viewOriginalBtn.addEventListener('click', (e) => {
                        e.stopPropagation();
                        
                        // Create modal overlay
                        const modal = document.createElement('div');
                        modal.className = 'modal-overlay';
                        
                        // Create modal content
                        const modalContent = document.createElement('div');
                        modalContent.className = 'modal-content';
                        
                        // Create modal header
                        const modalHeader = document.createElement('div');
                        modalHeader.className = 'modal-header';
                        
                        const modalTitle = document.createElement('h3');
                        modalTitle.textContent = UI_MESSAGES.ORIGINAL_TEXT_TITLE;
                        
                        const closeButton = document.createElement('button');
                        closeButton.className = 'modal-close-btn';
                        closeButton.textContent = '✕';
                        closeButton.addEventListener('click', () => {
                            document.body.removeChild(modal);
                        });
                        
                        modalHeader.appendChild(modalTitle);
                        modalHeader.appendChild(closeButton);
                        
                        // Create modal body
                        const modalBody = document.createElement('div');
                        modalBody.className = 'modal-body';
                        
                        const originalText = document.createElement('pre');
                        originalText.className = 'original-text-modal';
                        originalText.textContent = history[index].originalText;
                        
                        modalBody.appendChild(originalText);
                        
                        // Assemble modal
                        modalContent.appendChild(modalHeader);
                        modalContent.appendChild(modalBody);
                        modal.appendChild(modalContent);
                        
                        // Add to document
                        document.body.appendChild(modal);
                        
                        // Close modal when clicking outside
                        modal.addEventListener('click', (e) => {
                            if (e.target === modal) {
                                document.body.removeChild(modal);
                            }
                        });
                    });
                }
                
                // View explanation button
                const viewExplanationBtn = li.querySelector('.history-view-explanation-btn');
                if (viewExplanationBtn) {
                    viewExplanationBtn.addEventListener('click', (e) => {
                        e.stopPropagation();
                        
                        // Create modal overlay
                        const modal = document.createElement('div');
                        modal.className = 'modal-overlay';
                        
                        // Create modal content
                        const modalContent = document.createElement('div');
                        modalContent.className = 'modal-content';
                        
                        // Create modal header
                        const modalHeader = document.createElement('div');
                        modalHeader.className = 'modal-header';
                        
                        const modalTitle = document.createElement('h3');
                        modalTitle.textContent = UI_MESSAGES.EXPLANATION_TITLE;
                        
                        const closeButton = document.createElement('button');
                        closeButton.className = 'modal-close-btn';
                        closeButton.textContent = '✕';
                        closeButton.addEventListener('click', () => {
                            document.body.removeChild(modal);
                        });
                        
                        modalHeader.appendChild(modalTitle);
                        modalHeader.appendChild(closeButton);
                        
                        // Create modal body
                        const modalBody = document.createElement('div');
                        modalBody.className = 'modal-body';
                        
                        const explanationText = document.createElement('pre');
                        explanationText.className = 'explanation-text-modal';
                        explanationText.textContent = history[index].explanation;
                        
                        modalBody.appendChild(explanationText);
                        
                        // Assemble modal
                        modalContent.appendChild(modalHeader);
                        modalContent.appendChild(modalBody);
                        modal.appendChild(modalContent);
                        
                        // Add to document
                        document.body.appendChild(modal);
                        
                        // Close modal when clicking outside
                        modal.addEventListener('click', (e) => {
                            if (e.target === modal) {
                                document.body.removeChild(modal);
                            }
                        });
                    });
                }
                
                // View full response button
                const viewFullBtn = li.querySelector('.history-view-full-btn');
                if (viewFullBtn) {
                    viewFullBtn.addEventListener('click', (e) => {
                        e.stopPropagation();
                        
                        // Create modal overlay
                        const modal = document.createElement('div');
                        modal.className = 'modal-overlay';
                        
                        // Create modal content
                        const modalContent = document.createElement('div');
                        modalContent.className = 'modal-content';
                        
                        // Create modal header
                        const modalHeader = document.createElement('div');
                        modalHeader.className = 'modal-header';
                        
                        const modalTitle = document.createElement('h3');
                        modalTitle.textContent = UI_MESSAGES.FULL_RESPONSE_TITLE;
                        
                        const closeButton = document.createElement('button');
                        closeButton.className = 'modal-close-btn';
                        closeButton.textContent = '✕';
                        closeButton.addEventListener('click', () => {
                            document.body.removeChild(modal);
                        });
                        
                        modalHeader.appendChild(modalTitle);
                        modalHeader.appendChild(closeButton);
                        
                        // Create modal body
                        const modalBody = document.createElement('div');
                        modalBody.className = 'modal-body';
                        
                        const responseText = document.createElement('pre');
                        responseText.className = 'full-response-text';
                        responseText.textContent = history[index].fullResponse;
                        
                        modalBody.appendChild(responseText);
                        
                        // Assemble modal
                        modalContent.appendChild(modalHeader);
                        modalContent.appendChild(modalBody);
                        modal.appendChild(modalContent);
                        
                        // Add to document
                        document.body.appendChild(modal);
                        
                        // Close modal when clicking outside
                        modal.addEventListener('click', (e) => {
                            if (e.target === modal) {
                                document.body.removeChild(modal);
                            }
                        });
                    });
                }
                
                // Delete button
                li.querySelector('.history-delete-btn').addEventListener('click', (e) => {
                    e.stopPropagation();
                    
                    if (confirm('この履歴を削除しますか？')) {
                        const newHistory = [...history];
                        newHistory.splice(index, 1);
                        
                        chrome.storage.local.set({ [STORAGE_CONFIG.KEYS.HISTORY]: newHistory }, () => {
                            updateHistoryList();
                        });
                    }
                });
            });
        });
    } catch (error) {
        console.error('Failed to load history:', error);
        historyList.innerHTML = `<li class="text-red-500">${UI_MESSAGES.ERROR_PREFIX}${error.message}</li>`;
    }
}

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