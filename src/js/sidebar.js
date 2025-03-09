import { API_CONFIG, SYSTEM_PROMPT, UI_ELEMENTS, UI_MESSAGES, STORAGE_CONFIG } from './config.js';
import { showApiKeyPrompt } from './modules/showApiKeyPrompt.js';
import { updateHistoryList } from './modules/updateHistoryList.js';

// Listen for messages from content script to update the text
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    console.log('Sidebar received message:', message.action);
    
    if (message.action === 'updateSidebarText') {
        console.log('Updating sidebar text with selected text');
        const inputText = document.getElementById(UI_ELEMENTS.INPUT_TEXT);
        const resultContainer = document.getElementById(UI_ELEMENTS.RESULT_CONTAINER);
        
        // Update the input text
        if (inputText) {
            // Save current text to history if there's a result showing
            const currentText = inputText.value.trim();
            const resultElement = document.getElementById(UI_ELEMENTS.RESULT);
            
            if (currentText && !resultContainer.classList.contains('hidden') && resultElement && resultElement.textContent) {
                // Save current text and result to history before updating
                saveToHistory(currentText, resultElement.textContent);
            }
            
            // Update the input field with the new selected text
            inputText.value = message.text;
            
            // Hide the result container for the new text
            if (resultContainer) {
                resultContainer.classList.add('hidden');
            }
            
            // Focus the input field
            inputText.focus();
            
            // Show the clear button if there's text
            const clearButton = document.getElementById(UI_ELEMENTS.CLEAR_BUTTON);
            if (clearButton) {
                clearButton.style.display = inputText.value.length > 0 ? 'flex' : 'none';
            }
        } else {
            console.error('Input text element not found');
            // If the input element is not found, store the text in storage
            // so it can be retrieved when the DOM is fully loaded
            chrome.storage.local.set({ selectedText: message.text });
        }
        
        // Send a response to acknowledge receipt
        if (sendResponse) {
            sendResponse({ success: true });
        }
    } else if (message.action === 'checkForSelectedText') {
        // Trigger a check for selected text in storage
        checkForSelectedText();
        if (sendResponse) {
            sendResponse({ success: true });
        }
    }
    return true;
});

// Check for selected text in storage when sidebar loads
document.addEventListener('DOMContentLoaded', () => {
    console.log('Sidebar loaded, checking for API key and selected text');
    
    // Load API key from storage
    chrome.storage.local.get([API_CONFIG.STORAGE_KEYS.API_KEY], (result) => {
        if (!result[API_CONFIG.STORAGE_KEYS.API_KEY]) {
            // Show API key input if not set
            showApiKeyPrompt();
        }
    });

    // Check for selected text
    checkForSelectedText();
    
    // Load initial history
    updateHistoryList();
});

// Function to check for selected text in storage
function checkForSelectedText() {
    console.log('Checking for selected text in storage');
    chrome.storage.local.get(['selectedText'], (result) => {
        if (result.selectedText) {
            console.log('Found selected text in storage:', result.selectedText.substring(0, 20) + '...');
            const inputText = document.getElementById(UI_ELEMENTS.INPUT_TEXT);
            if (inputText) {
                inputText.value = result.selectedText;
                
                // Show the clear button if there's text
                const clearButton = document.getElementById(UI_ELEMENTS.CLEAR_BUTTON);
                if (clearButton) {
                    clearButton.style.display = inputText.value.length > 0 ? 'flex' : 'none';
                }
                
                // Focus the input field
                inputText.focus();
            }
            
            // Clear the storage after retrieving
            chrome.storage.local.remove(['selectedText'], () => {
                console.log('Cleared selected text from storage');
            });
        } else {
            console.log('No selected text found in storage');
        }
    });
}

// Function to save text and result to history
function saveToHistory(originalText, correctedText, fullResponse = '', explanation = '') {
    try {
        chrome.storage.local.get([STORAGE_CONFIG.KEYS.HISTORY], (result) => {
            const history = result[STORAGE_CONFIG.KEYS.HISTORY] || [];
            
            // Add new entry to the beginning of the history array
            history.unshift({
                timestamp: new Date().toISOString(),
                originalText: originalText,
                correctedText: correctedText,
                fullResponse: fullResponse || correctedText,
                explanation: explanation
            });

            // Keep only the latest MAX_HISTORY_ITEMS items
            if (history.length > STORAGE_CONFIG.MAX_HISTORY_ITEMS) {
                history.length = STORAGE_CONFIG.MAX_HISTORY_ITEMS;
            }

            chrome.storage.local.set({ [STORAGE_CONFIG.KEYS.HISTORY]: history }, () => {
                updateHistoryList();
            });
        });
    } catch (historyError) {
        console.error('Failed to save to history:', historyError);
    }
}

// Function to sanitize text for safe HTML display
function sanitizeText(text) {
    return text
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

// Function to format text for display with line breaks
function formatTextForDisplay(text) {
    const sanitized = sanitizeText(text);
    return sanitized
        .replace(/\n/g, '<br>')
        .replace(/\s{2,}/g, match => '&nbsp;'.repeat(match.length));
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
    const historyMenuButton = document.getElementById('historyMenuButton');
    const historyMenuDropdown = document.getElementById('historyMenuDropdown');

    // Toggle dropdown menu
    historyMenuButton?.addEventListener('click', (e) => {
        e.stopPropagation();
        historyMenuDropdown.classList.toggle('hidden');
    });

    // Close dropdown when clicking outside
    document.addEventListener('click', () => {
        if (!historyMenuDropdown.classList.contains('hidden')) {
            historyMenuDropdown.classList.add('hidden');
        }
    });

    // Prevent clicks inside dropdown from closing it
    historyMenuDropdown?.addEventListener('click', (e) => {
        e.stopPropagation();
    });

    // Import history button functionality
    importHistoryButton?.addEventListener('click', () => {
        importHistoryFile.click();
        historyMenuDropdown.classList.add('hidden');
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
                    throw new Error('無効なファイル形式です。履歴データが見つかりません。');
                }
                
                // Validate each history item
                for (const item of importedData.history) {
                    if (!item.timestamp || !item.originalText || !item.correctedText) {
                        throw new Error('無効なファイル形式です。履歴項目に必要なデータが不足しています。');
                    }
                    
                    // Ensure timestamp is a valid date
                    if (isNaN(new Date(item.timestamp).getTime())) {
                        throw new Error('無効なタイムスタンプ形式です。');
                    }
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
                
                // Close the dropdown
                historyMenuDropdown.classList.add('hidden');
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
                    
                    // Close the dropdown
                    historyMenuDropdown.classList.add('hidden');
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
                // Pass a callback function to automatically perform the check after saving the API key
                showApiKeyPrompt((newApiKey) => {
                    // Automatically trigger the check with the new API key
                    performGrammarCheck(newApiKey, inputText.value);
                });
                return;
            }

            // Perform the grammar check with the existing API key
            performGrammarCheck(apiKey, inputText.value);
        });
    });

    // Function to perform the grammar check
    async function performGrammarCheck(apiKey, text) {
        loadingSpinner.classList.remove('hidden');
        resultContainer.classList.add('hidden');
        result.innerHTML = ''; // Clear previous content
        
        // Disable check button during API call
        checkButton.disabled = true;
        checkButton.textContent = '処理中...';

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
                            content: text
                        }
                    ]
                })
            });

            // Check for HTTP errors
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                if (response.status === 429) {
                    throw new Error('APIレート制限に達しました。しばらく待ってから再試行してください。');
                } else if (response.status === 401) {
                    throw new Error('APIキーが無効です。正しいAPIキーを入力してください。');
                } else {
                    throw new Error(errorData.error?.message || `HTTP エラー: ${response.status}`);
                }
            }

            const data = await response.json();
            
            if (data.error) {
                throw new Error(data.error.message);
            }
            
            // Validate response structure
            if (!data.choices || !data.choices.length || !data.choices[0].message || !data.choices[0].message.content) {
                throw new Error('APIからの応答が無効です。予期しない形式のレスポンスを受け取りました。');
            }

            const fullResponse = data.choices[0].message.content;
            
            // Check if response is empty
            if (!fullResponse.trim()) {
                throw new Error('APIからの応答が空です。もう一度お試しください。');
            }
            
            // Extract only the corrected text from the response
            let correctedText = fullResponse;
            const correctionMatch = fullResponse.match(/```修正\n([\s\S]*?)\n```/);
            
            if (correctionMatch && correctionMatch[1]) {
                correctedText = correctionMatch[1].trim();
            }
            
            // If no corrected text was found, use the full response
            if (!correctedText.trim()) {
                correctedText = fullResponse.trim();
            }
            
            // Store the full response for reference
            const explanationMatch = fullResponse.match(/```説明\n([\s\S]*?)\n```/);
            const explanation = explanationMatch && explanationMatch[1] ? explanationMatch[1].trim() : '';
            
            // Display only the corrected text in the result
            result.innerHTML = ''; // Clear previous content
            
            // Convert line breaks to <br> tags and preserve formatting
            const formattedText = formatTextForDisplay(correctedText);
            
            result.innerHTML = formattedText;
            resultContainer.classList.remove('hidden');

            // Save to history using the global saveToHistory function
            saveToHistory(text, correctedText, fullResponse, explanation);
            
            // After updating the history list, select the first item automatically
            setTimeout(() => {
                const firstHistoryItem = document.querySelector('.history-item');
                if (firstHistoryItem) {
                    // Add a selected class to highlight the item
                    firstHistoryItem.classList.add('selected');
                    
                    // No need to set input text again as it's already there
                    // But we need to make sure the result is displayed
                    const resultElement = document.getElementById(UI_ELEMENTS.RESULT);
                    if (resultElement) {
                        // The result is already set with the formatted text above
                        document.getElementById(UI_ELEMENTS.RESULT_CONTAINER).classList.remove('hidden');
                    }
                }
            }, 100); // Small delay to ensure the history list is updated
        } catch (error) {
            console.error('Grammar check error:', error);
            result.textContent = `${UI_MESSAGES.ERROR_PREFIX}${error.message}`;
            resultContainer.classList.remove('hidden');
        } finally {
            loadingSpinner.classList.add('hidden');
            
            // Re-enable check button
            checkButton.disabled = false;
            checkButton.textContent = 'チェック';
        }
    }
}); 