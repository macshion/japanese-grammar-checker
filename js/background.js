chrome.sidePanel.setPanelBehavior({openPanelOnActionClick:!0}).catch(e=>console.error(e));chrome.runtime.onMessage.addListener((e,t,n)=>(e.action==="textSelected"&&chrome.storage.local.set({selectedText:e.text},()=>{chrome.sidePanel.open({windowId:t.tab.windowId})}),!0));
