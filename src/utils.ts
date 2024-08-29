function saveData(key: string, value: {}) {
	return new Promise<void>((resolve, reject) => {
		chrome.storage.local.set({ [key]: JSON.stringify(value) }, () => {
			if (chrome.runtime.lastError) {
				console.error('Error storing data:', chrome.runtime.lastError);
				reject(chrome.runtime.lastError);
			} else {
				console.log('Stored', key, 'successfully');
				resolve();
			}
		});
	});
}

async function getData<T>(key: string): Promise<T | undefined> {
	return new Promise((resolve, reject) => {
		chrome.storage.local.get([key], (result) => {
			if (chrome.runtime.lastError)
				reject(new Error(chrome.runtime.lastError.message));
			else resolve(result[key] ? JSON.parse(result[key]) : undefined);
		});
	});
}

export { saveData, getData };
