// Enable the side panel to open when the extension action is clicked
chrome.sidePanel
  .setPanelBehavior({ openPanelOnActionClick: true })
  .catch((error) => console.error(error));

// Create a context menu item that appears when text is selected
chrome.contextMenus.create({
  id: 'checkJapaneseGrammar',
  title: 'Check Japanese Grammar',
  contexts: ['selection'],
});

// Listen for context menu clicks
chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === 'checkJapaneseGrammar' && info.selectionText) {
    // Store the selected text in storage for the sidebar to access
    chrome.storage.local.set({ selectedText: info.selectionText }, () => {
      // Open the side panel when the context menu option is clicked
      chrome.sidePanel.open({ windowId: tab.windowId });
    });
  }
});

// Listen for messages from content scripts
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  // We've removed the automatic sidebar opening on text selection
  return true;
}); 