import axios from 'axios';
import {authHeader} from './auth';

export async function addPost(post) {
	await axios.post(`${process.env.REACT_APP_API_URL}/posts`, {
		...post
	}, {headers: authHeader()}).then(res => console.log(res)).catch(err => console.error(err));
}

export async function deletePost(postID) {
	console.log(postID)
	await axios.delete(`${process.env.REACT_APP_API_URL}/posts/${postID}`, {headers: authHeader()}).then(res => console.log(res)).catch(err => console.error(err))
}
