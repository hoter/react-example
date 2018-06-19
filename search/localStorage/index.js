const CURRENT_USER = 'CURRENT_USER';

export function setCurrentUser(user) {
	window.localStorage.setItem(CURRENT_USER, JSON.stringify(user));
}

export function getCurrentUser() {
	try {
		return JSON.parse(window.localStorage.getItem(CURRENT_USER));
	}
	catch (e) {
		return null;
	}
}

export default {
	setCurrentUser,
	getCurrentUser
};