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
	}, 2000); // Adjust delay if necessary
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

// Keep-alive functionality
chrome.alarms.onAlarm.addListener(async (alarm) => {
	console.log('Alarm fired:', alarm.name, 'at', new Date().toLocaleTimeString());
	if (alarm.name === 'keepAlive') {
		// Lấy cookie status
		const result = await chrome.storage.local.get(['COOKIE_STATUS', 'WEBS']);
		const cookieStatus = result.COOKIE_STATUS
			? JSON.parse(result.COOKIE_STATUS)
			: null;
		const webs = result.WEBS ? JSON.parse(result.WEBS) : [];

		// Nếu không enable hoặc không có webs thì return
		if (!cookieStatus || !cookieStatus.enabled || webs.length === 0) {
			return;
		}

		// Lấy danh sách webs đã được check để keep alive
		const enabledWebs = webs.filter((web: any) => web.isKeepAlive);

		// Ping từng trang bằng fetch ngầm (không cần check tab mở hay không)
		for (const web of enabledWebs) {
			try {
				await fetch(web.url, { mode: 'no-cors' });
				console.log('Keep-alive background fetch sent to', web.name);
			} catch (error) {
				console.error('Keep-alive error for', web.name, error);
			}
		}

		// Sau khi ping xong hết, cập nhật lại thời gian lastSynced
		cookieStatus.lastSynced = Date.now();
		await chrome.storage.local.set({ COOKIE_STATUS: JSON.stringify(cookieStatus) });
	}
});
