export const API_URL = process.env.NODE_ENV === 'production' ? '/api' : `${process.env.REACT_APP_LOCAL_API}/api`;
export const API_ADMIN_URL = process.env.NODE_ENV === 'production' ? '/api/admin' : `${process.env.REACT_APP_LOCAL_API}/api/admin`;

export async function makeQuery (path, method = 'GET', body = null) {
	const query = await fetch(`${API_ADMIN_URL}${path}`, {
		method,
		body,
		credentials: 'include'
	});
	const result = await query.json();

	return result;
}

export async function makeQueryToApi (path, method = 'GET', body = null) {
	const query = await fetch(`${API_URL}${path}`, {
		method,
		body,
		credentials: 'include'
	});
	const result = await query.json();

	return result;
}
