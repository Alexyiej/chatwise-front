import axios from 'axios';

export const apiUrl = 'http://localhost:5000/'
export const loginApiUrl = `${apiUrl}auth/login`;
export const registerApiUrl = `${apiUrl}auth/register`;

export async function postRequest(apiUrl, payload) {
	try {
		const response = await axios.post(apiUrl, payload);
		return response;

	} catch (error) {
	  	console.error("There was an error with the post request", error);
	  	return error.response;
	}
}