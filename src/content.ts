import { Web, EncryptedUserInfo, UserInfo } from './interfaces';
import { getData } from './utils';
import { decryptUserInfo, importKey } from './crypto';

async function getAutoLoginHostnames(): Promise<string[]> {
	const webs: Web[] = (await getData('WEBS')) || [];
	return webs
		.filter((web) => web.isAutoLogin)
		.map((web) => {
			try {
				return new URL(web.url).hostname;
			} catch {
				return '';
			}
		})
		.filter((h) => h !== '');
}

async function handleAutoLogin() {
	const jwk: JsonWebKey | undefined = await getData('KEY');

	if (!jwk) return;

	const key = await importKey(jwk);

	const encryptedUserInfo: EncryptedUserInfo = (await getData('USER_INFO')) || {
		username: '',
		password: '',
		ivPassword: '',
		ivUsername: ''
	};

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

		// --- XỬ LÝ LỖI COURSES (Đã đăng nhập) ---
		// Nếu gặp thông báo "cần đăng xuất trước khi đăng nhập", bấm nút Huỷ bỏ để vào trang chủ
		if (document.body.textContent?.includes('cần đăng xuất trước khi đăng nhập')) {
			const cancelButton = Array.from(document.querySelectorAll('button.btn.btn-secondary'))
				.find(b => b.textContent?.trim() === 'Huỷ bỏ');
			
			if (cancelButton) {
				console.log('Detected Courses anomaly modal, clicking Cancel...');
				(cancelButton as HTMLButtonElement).click();
				return;
			}
		}
		// ----------------------------------------

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
			try {
				const autoLoginHostnames = await getAutoLoginHostnames();
				// Nếu URL không hợp lệ (ví dụ chrome://) thì new URL() sẽ throw error -> catch
				const currentHostname = new URL(message.url).hostname;
				
				if (autoLoginHostnames.includes(currentHostname)) {
					handleAutoLogin();
				}
			} catch (e) {
				// Bỏ qua lỗi nếu URL không hợp lệ
			}
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
	document.addEventListener('DOMContentLoaded', addMessageListener);
} else {
	addMessageListener();
}
