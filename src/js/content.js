// This content script runs on web pages that match the patterns in manifest.json
console.log('Japanese Grammar Checker content script loaded');

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
  }
});

// Add a context menu item when text is selected
document.addEventListener('mouseup', () => {
  const selectedText = window.getSelection().toString();
  if (selectedText) {
    chrome.runtime.sendMessage({ 
      action: 'textSelected', 
      text: selectedText 
    });
  }
}); 