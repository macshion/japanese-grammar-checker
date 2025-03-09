import { UI_ELEMENTS, UI_MESSAGES, STORAGE_CONFIG } from '../config.js';

// Helper function to update history list UI
export async function updateHistoryList() {
    const historyList = document.getElementById(UI_ELEMENTS.HISTORY_LIST);
    const historyContainer = document.getElementById(UI_ELEMENTS.HISTORY_CONTAINER);
    
    try {
        chrome.storage.local.get([STORAGE_CONFIG.KEYS.HISTORY], (result) => {
            const history = result[STORAGE_CONFIG.KEYS.HISTORY] || [];
            
            if (history.length === 0) {
                historyList.innerHTML = `<li class="text-gray-500">${UI_MESSAGES.HISTORY_EMPTY}</li>`;
                return;
            }

            // Helper function to sanitize text for safe HTML display
            const sanitizeText = (text) => {
                return text
                    .replace(/</g, '&lt;')
                    .replace(/>/g, '&gt;')
                    .replace(/"/g, '&quot;')
                    .replace(/'/g, '&#039;');
            };

            // Helper function to format text for display
            const formatTextForDisplay = (text) => {
                const sanitized = sanitizeText(text);
                return sanitized
                    .replace(/\n/g, '<br>')
                    .replace(/\s{2,}/g, match => '&nbsp;'.repeat(match.length));
            };

            historyList.innerHTML = history.map((item, index) => `
                <li class="history-item ${index === 0 ? 'selected' : ''}" data-index="${index}">
                    <div class="history-item-header">
                        <div class="history-timestamp">${new Date(item.timestamp).toLocaleString('ja-JP')}</div>
                        <div class="history-actions">
                            <button class="history-copy-btn icon-button" title="修正文をコピー">📋</button>
                            <button class="history-view-original-btn icon-button" title="原文を表示">📄</button>
                            ${item.explanation ? `<button class="history-view-explanation-btn icon-button" title="説明を表示">ℹ️</button>` : ''}
                            ${item.fullResponse ? `<button class="history-view-full-btn icon-button" title="完全な応答を表示">👁️</button>` : ''}
                            <button class="history-delete-btn icon-button" title="削除">🗑️</button>
                        </div>
                    </div>
                    <div class="corrected-text">${formatTextForDisplay(item.correctedText)}</div>
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
                    
                    // Format the corrected text for display
                    const resultElement = document.getElementById(UI_ELEMENTS.RESULT);
                    resultElement.innerHTML = formatTextForDisplay(history[index].correctedText);
                    
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
                        
                        const originalText = document.createElement('div');
                        originalText.className = 'original-text-modal';
                        originalText.innerHTML = formatTextForDisplay(history[index].originalText);
                        
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
                        
                        const explanationText = document.createElement('div');
                        explanationText.className = 'explanation-text-modal';
                        explanationText.innerHTML = formatTextForDisplay(history[index].explanation);
                        
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
                        
                        const fullResponseText = document.createElement('div');
                        fullResponseText.className = 'full-response-text';
                        fullResponseText.innerHTML = formatTextForDisplay(history[index].fullResponse);
                        
                        modalBody.appendChild(fullResponseText);
                        
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