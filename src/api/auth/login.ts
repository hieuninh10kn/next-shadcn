import { setCookie } from 'cookies-next';

export const login = async (payload: { email: string; password: string }) => {
	const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/login`, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			Accept: 'application/json',
		},
		body: JSON.stringify(payload),
	});
	const response = await res.json();

	if (!res.ok) {
		if (response.errors) {
			throw new Error(JSON.stringify({ errors: response.errors }));
		}
		throw new Error(response.message);
	}

	setCookie('access_token', response.data.access_token);
	return response;
};
