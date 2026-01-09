import { Web, EncryptedUserInfo, UserInfo } from './interfaces';
import { getData } from './utils';
import { decryptUserInfo, importKey } from './crypto';
async function getAutoLoginWebNames(): Promise<string[]> {
	const webs: Web[] = (await getData('WEBS')) || [];
	const autoLoginWebsUrls = webs
		.filter((web) => web.isAutoLogin) // Step 1: Filter the objects where `isAutoLogin` is true
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
		'input[id*="field-username"]', // Cho DKHP Modal
		'#login-account-name', // Cho Forum mới
		'.js-login-username'
	];
	const passwordInputSelectors = [
		'#edit-pass',
		'#password',
		'input[id*="field-password"]', // Cho DKHP Modal
		'#login-account-password', // Cho Forum mới
		'.js-login-password'
	];
	const btnSelectors = [
		'input[name=op]',
		'#loginbtn',
		'button[type="submit"].chakra-button', // Cho DKHP Modal
		'#login-button', // Cho Forum mới
		'.js-login-button',
		'.css-1ou1lp0'
	];

	// Hàm thực hiện điền và submit, có hỗ trợ retry
	function attemptFillAndSubmit(retryCount = 0) {
		const MAX_RETRIES = 3; // Thử tối đa 3 lần

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

		// Safety check: Only proceed if inputs are found
		// Nếu không tìm thấy input, có thể đã login thành công hoặc đang ở trang khác -> Stop
		if (!usernameInput || !passwordInput) return;

		console.log(`Auto Login attempt ${retryCount + 1}/${MAX_RETRIES + 1}`);

		usernameInput.value = userInfo.username;
		passwordInput.value = userInfo.password;

		usernameInput.dispatchEvent(new Event('input', { bubbles: true }));
		passwordInput.dispatchEvent(new Event('input', { bubbles: true }));

		// Handle captcha if exists
		const captchaInput = document.querySelector<HTMLInputElement>(
			'#edit-english-captcha-answer'
		);
		if (captchaInput) {
			const captchaLabel = document.querySelector<HTMLLabelElement>(
				'label[for="edit-english-captcha-answer"]'
			);
			if (captchaLabel) {
				const labelText = captchaLabel.textContent || '';
				const match = labelText.match(/\(([^)]+)\)/);
				if (match && match[1]) {
					const answer = match[1];
					captchaInput.value = answer;
					captchaInput.dispatchEvent(new Event('input', { bubbles: true }));
				}
			}
		}

		setTimeout(() => {
			btn?.click();

			// Nếu vẫn còn lượt retry, đợi 2s rồi check xem còn ở trang login không
			if (retryCount < MAX_RETRIES) {
				setTimeout(() => {
					// Check lại xem input user còn tồn tại không
					// Nếu còn tồn tại => Vẫn chưa login xong hoặc thất bại => Thử lại
					const stillOnPage = document.querySelector(usernameInputSelectors.join(','));
					if (stillOnPage) {
						console.log('Login failed or taking too long, retrying...');
						attemptFillAndSubmit(retryCount + 1);
					}
				}, 2000);
			}
		}, 1000);
	}

	// Bắt đầu thử
	attemptFillAndSubmit(0);
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
		} else if (message.type === 'PING_SERVER') {
			// Ping server để refresh session
			try {
				await fetch(window.location.origin, {
					credentials: 'include'
				});
				console.log('Keep-alive ping successful');
			} catch (error) {
				console.error('Keep-alive ping failed:', error);
			}
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