import axios from 'axios';
import useSWR from 'swr';
import {authHeader} from './auth';

export function usePosts() {
	let {data, error} = useSWR(`/posts`, () => axios.get(process.env.REACT_APP_API_URL + '/posts', {}, {headers: authHeader()})
	.then(res => {return res.data})
	.catch(error => console.error(error)));

  return {
		posts: data,
		isError: error,
		isLoading: !data && !error
	}
}

export function usePost(postID) {
	let {data, error} = useSWR(`/post/${postID}`, () => axios.get(process.env.REACT_APP_API_URL + `/posts/${postID}`, {}, {headers: authHeader()})
	.then(res => {return res.data})
	.catch(error => console.error(error)));

  return {
		post: data,
		isError: error,
		isLoading: !data && !error
	}
}


export function usePostsPlant(plantID) {
	let {data, error} = useSWR(`/posts/plant/${plantID}`, () => axios.get(`${process.env.REACT_APP_API_URL}/posts/plant/${plantID}`, {headers: authHeader()})
	.then(res => {return res.data})
	.catch(error => console.error(error)));

	return {
		posts: data,
		isError: error,
		isLoading: !data && !error
	}
}
