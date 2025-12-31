export interface Web {
	id: string;
	name: string;
	url: string;
	checked: boolean;
}

export interface UserInfo {
	username: string;
	password: string;
}

export interface EncryptedUserInfo extends UserInfo {
	ivUsername: string;
	ivPassword: string;
}
