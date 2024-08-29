// Listen for when a new tab is created (open a new tab)
chrome.tabs.onCreated.addListener((tab) => {
	// Add a small delay to ensure the tab has a URL (a new tab need some seconds before fully loaded)
	setTimeout(() => {
		if (tab.id) {
			chrome.tabs.get(tab.id, (tab) => {
				if (tab.url && tab.id) {
					chrome.tabs.sendMessage(tab.id, { type: 'URL_UPDATE', url: tab.url });
				}
			});
		}
	}, 3000); // Adjust delay if necessary
});

// Listen for when the active tab changes (switch to a tab which has already been opened)
chrome.tabs.onActivated.addListener((activeInfo) => {
	chrome.tabs.get(activeInfo.tabId, (tab) => {
		if (tab.url && tab.id) {
			chrome.tabs.sendMessage(tab.id, { type: 'URL_UPDATE', url: tab.url });
		}
	});
});

// Listen for tab URL updates (update url of the current tab)
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
	if (changeInfo.status === 'complete' && tab.url) {
		chrome.tabs.sendMessage(tabId, { type: 'URL_UPDATE', url: tab.url });
	}
});
