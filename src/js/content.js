// This content script runs on web pages that match the patterns in manifest.json
console.log('Japanese Grammar Checker content script loaded');

// Set a flag to indicate the content script is loaded
window.japaneseGrammarCheckerLoaded = true;

// Listen for messages from the background script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'checkText') {
    // Get selected text from the page
    const selectedText = window.getSelection().toString();
    if (selectedText) {
      sendResponse({ text: selectedText });
    } else {
      sendResponse({ error: 'No text selected' });
    }
    return true; // Required for async response
  } else if (message.action === 'updateSelectedText') {
    // Store the selected text in storage first (as a backup)
    chrome.storage.local.set({ selectedText: message.text }, () => {
      // Then try to forward the message to the sidebar
      chrome.runtime.sendMessage({
        action: 'updateSidebarText',
        text: message.text
      }, (response) => {
        // If we got no response, the sidebar might not be open yet
        // The text is already stored in storage, so it will be loaded when the sidebar opens
        if (chrome.runtime.lastError) {
          console.log('Sidebar not ready, text saved to storage');
        }
      });
    });
    
    // Send a response to acknowledge receipt
    sendResponse({ success: true });
    return true;
  } else if (message.action === 'ping') {
    // Respond to ping to confirm content script is loaded
    sendResponse({ pong: true });
    return true;
  }
});

// We've removed the automatic mouseup event listener that opened the sidebar
// The context menu functionality will be handled by the background script