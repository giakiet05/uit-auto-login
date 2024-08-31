import { EncryptedUserInfo, UserInfo, Web } from './interfaces';
import { getData } from './utils';
import { decryptUserInfo, importKey } from './crypto';
async function getAutoLoginWebNames(): Promise<string[]> {
	const webs: Web[] = (await getData('WEBS')) || [];
	const autoLoginWebsUrls = webs
		.filter((web) => web.checked) // Step 1: Filter the objects where `checked` is true
		.map((web) => web.name.toLowerCase()); // Step 2: Extract the `url` property

	return autoLoginWebsUrls;
}

async function handleAutoLogin() {
	const jwk: JsonWebKey | undefined = await getData('KEY');

	if (!jwk) return; //This function only works if the userInfo is set

	const key = await importKey(jwk);

	const encryptedUserInfo: EncryptedUserInfo = (await getData('USER_INFO')) || {
		username: '',
		password: '',
		ivPassword: '',
		ivUsername: ''
	};
	//*console.log(encryptedUserInfo);

	const userInfo: UserInfo = await decryptUserInfo(key, encryptedUserInfo);

	const usernameInputSelectors = [
		'#edit-name',
		'#username',
		'#formiz-\\:r3\\:-field-username__\\:r4\\:',
		'.js-login-username'
	];
	const passwordInputSelectors = [
		'#edit-pass',
		'#password',
		'#formiz-\\:r3\\:-field-password__\\:r6\\:',
		'.js-login-password'
	];
	const btnSelectors = [
		'input[name=op]',
		'#loginbtn',
		'.js-login-button',
		'.css-1ou1lp0'
	];

	let usernameInput: HTMLInputElement | null = null;
	let passwordInput: HTMLInputElement | null = null;
	let btn: HTMLButtonElement | null = null;

	// Find username input
	for (let selector of usernameInputSelectors) {
		usernameInput = document.querySelector<HTMLInputElement>(selector);
		if (usernameInput) break;
	}

	// Find password input
	for (let selector of passwordInputSelectors) {
		passwordInput = document.querySelector<HTMLInputElement>(selector);
		if (passwordInput) break;
	}

	// Find login button
	for (let selector of btnSelectors) {
		btn = document.querySelector<HTMLButtonElement>(selector);
		if (btn) break;
	}

	usernameInput!.value = userInfo.username;
	passwordInput!.value = userInfo.password;

	usernameInput!.dispatchEvent(new Event('input', { bubbles: true }));
	passwordInput!.dispatchEvent(new Event('input', { bubbles: true }));
	setTimeout(() => {
		btn?.click();
	}, 1000);
}

interface Message {
	type: string;
	url: string;
}

function addMessageListener() {
	chrome.runtime.onMessage.addListener(async (message: Message) => {
		if (message.type === 'URL_UPDATE') {
			const autoLoginWebsNames = await getAutoLoginWebNames();
			const regex = new RegExp(autoLoginWebsNames.join('|'), 'i');
			if (regex.test(message.url)) handleAutoLogin();
		}
	});
}

// Check if the DOM is already loaded
if (document.readyState === 'loading') {
	// If the DOM is still loading, wait for it to be ready
	document.addEventListener('DOMContentLoaded', addMessageListener);
} else {
	// If the DOM is already fully loaded, immediately add the listener
	addMessageListener();
}
