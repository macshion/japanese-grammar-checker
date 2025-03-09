// Flag to track if the extension has been initialized
let isInitialized = false;

// Initialize the extension
function initialize() {
  // Only initialize once
  if (isInitialized) {
    console.log('Extension already initialized, skipping initialization');
    return;
  }
  
  console.log('Initializing Japanese Grammar Checker extension');
  
  // Enable the side panel to open when the extension action is clicked
  // Use a callback instead of promises for better compatibility
  chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true }, () => {
    console.log('Panel behavior set successfully');
  });

  // First remove any existing context menu items to prevent duplicates
  chrome.contextMenus.removeAll(() => {
    console.log('Removed all existing context menu items');
    
    // Create a context menu item that appears when text is selected
    chrome.contextMenus.create({
      id: 'checkJapaneseGrammar',
      title: '日本語文法をチェック',
      contexts: ['selection'],
    }, () => {
      // Check for any errors during creation
      if (chrome.runtime.lastError) {
        console.error('Error creating context menu:', chrome.runtime.lastError);
      } else {
        console.log('Context menu created successfully');
        // Mark as initialized only after successful creation
        isInitialized = true;
      }
    });
  });
}

// Initialize the extension when the service worker starts
initialize();

// Also initialize when the extension is installed or updated
chrome.runtime.onInstalled.addListener((details) => {
  console.log('Extension installed or updated:', details.reason);
  initialize();
});

// Also initialize when the browser starts
chrome.runtime.onStartup.addListener(() => {
  console.log('Browser started, initializing extension');
  initialize();
});

// Function to ensure content script is loaded
function ensureContentScriptLoaded(tabId) {
  return new Promise((resolve) => {
    // First check if we can communicate with the content script
    chrome.tabs.sendMessage(tabId, { action: 'ping' }, (response) => {
      if (chrome.runtime.lastError || !response) {
        // Content script is not loaded or not responding, inject it
        chrome.scripting.executeScript({
          target: { tabId: tabId },
          files: ['js/content.js']
        }).then(() => {
          // Give it a moment to initialize
          setTimeout(resolve, 100);
        }).catch((error) => {
          console.error('Failed to inject content script:', error);
          resolve(); // Resolve anyway to continue the flow
        });
      } else {
        // Content script is already loaded
        resolve();
      }
    });
  });
}

// Function to ensure the sidebar has received the selected text
function ensureSidebarHasText(maxAttempts = 5) {
  let attempts = 0;
  
  function checkSidebar() {
    if (attempts >= maxAttempts) {
      console.log('Max attempts reached for checking sidebar');
      return;
    }
    
    attempts++;
    console.log(`Checking if sidebar has received text (attempt ${attempts})`);
    
    // Try to send a message to the sidebar to check for selected text
    chrome.runtime.sendMessage({ action: 'checkForSelectedText' }, (response) => {
      if (chrome.runtime.lastError || !response || !response.success) {
        console.log('Sidebar not ready yet, will retry in 500ms');
        // Retry after a delay
        setTimeout(checkSidebar, 500);
      } else {
        console.log('Sidebar has successfully received the message');
      }
    });
  }
  
  // Start checking after a short delay to allow the sidebar to initialize
  setTimeout(checkSidebar, 300);
}

// Listen for context menu clicks
chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  if (info.menuItemId === 'checkJapaneseGrammar' && info.selectionText) {
    // Check if the selected text contains Japanese characters
    const containsJapanese = /[\u3000-\u303f\u3040-\u309f\u30a0-\u30ff\uff00-\uff9f\u4e00-\u9faf\u3400-\u4dbf]/.test(info.selectionText);
    
    if (!containsJapanese) {
      // If no Japanese characters are detected, show a notification
      chrome.notifications.create({
        type: 'basic',
        iconUrl: 'icon.svg',
        title: '日本語文法チェッカー',
        message: '選択されたテキストに日本語が含まれていません。',
        priority: 2
      });
      return;
    }
    
    // Always store the selected text in storage for the sidebar to access
    chrome.storage.local.set({ selectedText: info.selectionText }, () => {
      try {
        // Open the side panel with the correct parameters and a callback
        // This will open the panel in all the pages on the current window
        chrome.sidePanel.open({ windowId: tab.windowId }, () => {
          console.log('Side panel opened successfully');
          
          // Ensure content script is loaded before sending message
          ensureContentScriptLoaded(tab.id).then(() => {
            // Try to send a message to update the text
            try {
              chrome.tabs.sendMessage(tab.id, { 
                action: 'updateSelectedText', 
                text: info.selectionText 
              }, (response) => {
                // Check for errors in sending the message
                if (chrome.runtime.lastError) {
                  console.error('Error sending message to tab:', chrome.runtime.lastError);
                  // The text is already in storage, so it will be loaded when the sidebar opens
                  // Start checking if the sidebar has received the text
                  ensureSidebarHasText();
                }
              });
            } catch (error) {
              console.error('Error sending message to tab:', error);
              // The text is already in storage, so it will be loaded when the sidebar opens
              // Start checking if the sidebar has received the text
              ensureSidebarHasText();
            }
          });
        });
      } catch (error) {
        console.error('Error opening side panel:', error);
        // Start checking if the sidebar has received the text
        ensureSidebarHasText();
      }
    });
  }
});

// Listen for messages from content scripts
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'updateSidebarText') {
    // Forward the message to the sidebar if it's open
    chrome.storage.local.set({ selectedText: message.text });
    sendResponse({ success: true });
  } else if (message.action === 'ping') {
    // Respond to ping to confirm content script is loaded
    sendResponse({ pong: true });
  }
  return true;
}); 