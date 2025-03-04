// Enable the side panel to open when the extension action is clicked
chrome.sidePanel
  .setPanelBehavior({ openPanelOnActionClick: true })
  .catch((error) => console.error(error));

// Listen for messages from content scripts
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'textSelected') {
    // Store the selected text in storage for the sidebar to access
    chrome.storage.local.set({ selectedText: message.text }, () => {
      // Open the side panel when text is selected
      chrome.sidePanel.open({ windowId: sender.tab.windowId });
    });
  }
  return true;
}); 