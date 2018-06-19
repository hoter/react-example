import {
	USER_AUTH_FAILED,
	USER_AUTH_REQUEST,
	USER_AUTH_SUCCEEDED,
	USER_AUTH_RECOVERY_REQUEST_SUCCEEDED,
	USER_AUTH_RECOVERY_REQUEST_FAILED,
	USER_AUTH_RECOVERY_REQUEST,
} from '../constants/action-types';
import { makeQueryToApi } from '../api';
import localStorage from '../localStorage';

const requestUserAuth = () => ({ type: USER_AUTH_REQUEST });
const requestUserAuthSucceeded = (user) => ({ type: USER_AUTH_SUCCEEDED, payload: { user } });
const requestUserAuthFailed = (error) => ({ type: USER_AUTH_FAILED, payload: { error } });

export const fetchUser = (dispatch) => {
	makeQueryToApi('/auth/whoami')
		.then((user) => {
			dispatch(requestUserAuthSucceeded(user));
			localStorage.setCurrentUser(user);
		})
		.catch((err) => {
			dispatch(requestUserAuthFailed());
			localStorage.setCurrentUser(null);
		});
};

export const logout = (dispatch) => {
	makeQueryToApi('/auth/logout')
		.then(() => {
			localStorage.setCurrentUser(null);
			window.location.reload();
		})
		.catch((err) => {
			console.log(err);
		});
};

export const authUser = (dispatch, credentials) => {
	dispatch(requestUserAuth());

	const formData = new FormData();
	formData.append('username', credentials.username);
	formData.append('password', credentials.password);

	makeQueryToApi('/auth/local', 'POST', new URLSearchParams(formData))
		.then((user) => {
			localStorage.setCurrentUser(user);
			dispatch(requestUserAuthSucceeded(user));
		})
		.catch((err) => {
			dispatch(requestUserAuthFailed('Username or password is incorrect'));
		});
};

const requestRecoveryPassword = () => ({ type: USER_AUTH_RECOVERY_REQUEST });
const requestRecoverySucceeded = () => ({ type: USER_AUTH_RECOVERY_REQUEST_SUCCEEDED });
const requestRecoveryFailed = (error) => ({ type: USER_AUTH_RECOVERY_REQUEST_FAILED, payload: { error } });

export const recoveryPassword = (dispatch, email) => {
	return new Promise((resolve, reject) => {
		dispatch(requestRecoveryPassword());

		const formData = new FormData();
		formData.append('email', email);

		makeQueryToApi('/auth/recovery', 'POST', new URLSearchParams(formData))
			.then((res) => {
				console.log(res);

				if (res && res.ok) {
					dispatch(requestRecoverySucceeded());
				} else {
					dispatch(requestRecoveryFailed(res.error ? res.error : 'Unhandled error'));
				}
			})
			.catch((err) => {
				console.error(err);
				// dispatch(requestRecoveryFailed('Unhandled error'));
			});
	});
};
