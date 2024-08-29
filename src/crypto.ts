import { UserInfo, EncryptedUserInfo } from './interfaces';

// Function to generate an AES-GCM key
async function generateKey(): Promise<CryptoKey> {
	return window.crypto.subtle.generateKey(
		{
			name: 'AES-GCM',
			length: 256 // 256-bit key length
		},
		true, // Key is exportable
		['encrypt', 'decrypt'] // Usages of the key
	);
}

// Function to export a CryptoKey to JWK format
async function exportKey(key: CryptoKey): Promise<JsonWebKey> {
	return window.crypto.subtle.exportKey('jwk', key);
}

// Function to import a CryptoKey from JWK format
async function importKey(jwk: JsonWebKey): Promise<CryptoKey> {
	return window.crypto.subtle.importKey(
		'jwk',
		jwk,
		{ name: 'AES-GCM', length: 256 },
		false,
		['encrypt', 'decrypt']
	);
}

// Function to encrypt data using AES-GCM
async function encryptData(
	key: CryptoKey,
	data: string
): Promise<{ encryptedData: ArrayBuffer; iv: Uint8Array }> {
	try {
		const encoder = new TextEncoder();
		const encodedData = encoder.encode(data);

		// Generate a random initialization vector (IV)
		const iv = window.crypto.getRandomValues(new Uint8Array(12));

		// Encrypt the data
		const encryptedData = await window.crypto.subtle.encrypt(
			{
				name: 'AES-GCM',
				iv: iv // IV for AES-GCM
			},
			key,
			encodedData // Data to encrypt (ArrayBuffer)
		);

		return { encryptedData, iv };
	} catch (error) {
		console.error('Error during encryption:', error);
		throw error; // Re-throw the error for higher-level handling
	}
}

// Function to decrypt data using AES-GCM
async function decryptData(
	key: CryptoKey,
	encryptedData: string,
	iv: string
): Promise<string> {
	try {
		const encryptedArrayBuffer = base64ToArrayBuffer(encryptedData); // Convert encrypted data to ArrayBuffer
		const ivArrayBuffer = base64ToArrayBuffer(iv); // Convert IV to ArrayBuffer
		const ivUint8Array = new Uint8Array(ivArrayBuffer); // Convert to Uint8Array for use in decryption

		// Decrypt the data
		const decryptedData = await window.crypto.subtle.decrypt(
			{
				name: 'AES-GCM',
				iv: ivUint8Array // Initialization vector used during encryption
			},
			key,
			encryptedArrayBuffer // Encrypted data in ArrayBuffer
		);

		// Convert decrypted ArrayBuffer back to string
		const decoder = new TextDecoder();
		return decoder.decode(decryptedData);
	} catch (error) {
		console.error('Error during decryption:', error);
		throw error; // Re-throw the error for higher-level handling
	}
}

// Function to convert ArrayBuffer to base64 string
function arrayBufferToBase64(buffer: ArrayBuffer): string {
	try {
		let binary = '';
		const bytes = new Uint8Array(buffer);
		for (let i = 0; i < bytes.byteLength; i++) {
			binary += String.fromCharCode(bytes[i]);
		}
		return window.btoa(binary);
	} catch (error) {
		console.error('Error converting ArrayBuffer to base64:', error);
		throw error; // Re-throw the error for higher-level handling
	}
}

// Function to convert base64 string to ArrayBuffer
function base64ToArrayBuffer(base64: string): ArrayBuffer {
	try {
		const binaryString = window.atob(base64);
		const len = binaryString.length;
		const bytes = new Uint8Array(len);
		for (let i = 0; i < len; i++) {
			bytes[i] = binaryString.charCodeAt(i);
		}
		return bytes.buffer;
	} catch (error) {
		console.error('Error converting base64 to ArrayBuffer:', error);
		throw error; // Re-throw the error for higher-level handling
	}
}

// Function to encrypt UserInfo and return EncryptedUserInfo
async function encryptUserInfo(
	key: CryptoKey,
	userInfo: UserInfo
): Promise<EncryptedUserInfo> {
	try {
		// Encrypt username
		const { encryptedData: encryptedUsername, iv: ivUsername } =
			await encryptData(key, userInfo.username);
		const encryptedUsernameBase64 = arrayBufferToBase64(encryptedUsername);
		const ivUsernameBase64 = arrayBufferToBase64(ivUsername);

		// Encrypt password
		const { encryptedData: encryptedPassword, iv: ivPassword } =
			await encryptData(key, userInfo.password);
		const encryptedPasswordBase64 = arrayBufferToBase64(encryptedPassword);
		const ivPasswordBase64 = arrayBufferToBase64(ivPassword);

		// Create EncryptedUserInfo object
		const encryptedUserInfo: EncryptedUserInfo = {
			username: encryptedUsernameBase64,
			password: encryptedPasswordBase64,
			ivUsername: ivUsernameBase64,
			ivPassword: ivPasswordBase64
		};

		return encryptedUserInfo; // Return EncryptedUserInfo object
	} catch (error) {
		console.error('Error encrypting user info:', error);
		throw error; // Re-throw the error for higher-level handling
	}
}

// Function to decrypt EncryptedUserInfo and return UserInfo
async function decryptUserInfo(
	key: CryptoKey,
	encryptedUserInfo: EncryptedUserInfo
): Promise<UserInfo> {
	try {
		// Decrypt username
		const username = await decryptData(
			key,
			encryptedUserInfo.username,
			encryptedUserInfo.ivUsername
		);

		// Decrypt password
		const password = await decryptData(
			key,
			encryptedUserInfo.password,
			encryptedUserInfo.ivPassword
		);

		// Create UserInfo object
		const decryptedUserInfo: UserInfo = {
			username,
			password
		};

		return decryptedUserInfo;
	} catch (error) {
		console.error('Error decrypting user info:', error);
		throw error; // Re-throw the error for higher-level handling
	}
}

export { generateKey, encryptUserInfo, decryptUserInfo, exportKey, importKey };
