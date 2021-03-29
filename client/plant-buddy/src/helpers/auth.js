import axios from 'axios';

export function authHeader() {
	const obj = localStorage.getItem('authToken');

	if (obj) {
		return {Authorization: obj};
	} else {
		return {};
	}
}

export async function signIn(credentials, setUser) {
	await axios.post(`${process.env.REACT_APP_API_URL}/v1/sessions`, credentials, {
		headers: {
			"Content-Type": "application/json"
		}
	}).then(res => {
		localStorage.setItem('authToken', res.headers.authorization)
		localStorage.setItem('user', JSON.stringify(res.data));
		setUser(res.data)
	}).catch(err => console.error(err));
	window.location.reload(false);
}

export async function signUp(credentials, setUser) {
	await axios.post(`${process.env.REACT_APP_API_URL}/v1/users`, credentials, {
		headers: {
			"Content-Type": "application/json"
		}
	}).then(res => {
		localStorage.setItem('authToken', res.headers.authorization);
		localStorage.setItem('user', JSON.stringify(res.data));
		setUser(res.data)
	}).catch(err => console.error(err));
	window.location.reload(false);
}

export async function signOut(setUser) {
	localStorage.removeItem('authToken')
	localStorage.removeItem('plantToken')
	localStorage.removeItem('user');
	setUser(null)
	await axios.delete(`${process.env.REACT_APP_API_URL}/v1/sessions/mine`, {headers: authHeader()}).then(res => {}).catch(err => console.error(err));
	window.location.reload(false);
}

export async function editUser(user, setUser) {
	await axios.patch(`${process.env.REACT_APP_API_URL}/v1/users/me`, user, {
		headers: {
			"Content-Type": "application/json",
			...authHeader()
		}
	}).then(res => {
		console.log(`Successfully updated user: ${res.data}`)
		localStorage.setItem('user', JSON.stringify(res.data));
		setUser(res.data)
	}).catch(err => console.error(err));
	window.location.reload(false);
}
