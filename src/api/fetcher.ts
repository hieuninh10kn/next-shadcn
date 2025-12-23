import { deleteCookie, getCookie } from 'cookies-next';
import { redirect } from 'next/navigation';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? '';

let clientAccessToken: string | null = null;

const isServer = typeof window === 'undefined';

export async function getServerAuthToken(): Promise<string | null> {
	if (!isServer) throw new Error('getServerAuthToken only works on server');

	const { cookies } = await import('next/headers');
	const cookieStore = await cookies();
	return cookieStore.get('access_token')?.value ?? null;
}

function getClientAuthToken(): string | null {
	if (clientAccessToken !== null) return clientAccessToken;

	const token = getCookie('access_token');
	clientAccessToken = typeof token === 'string' ? token : null;

	return clientAccessToken;
}

async function getAuthToken(): Promise<string | null> {
	if (isServer) {
		return await getServerAuthToken();
	}
	return getClientAuthToken();
}

// Clear token
async function clearAuthToken() {
	if (isServer) {
		const { cookies } = await import('next/headers');
		const cookieStore = await cookies();
		cookieStore.delete('access_token');
	} else {
		deleteCookie('access_token');
		clientAccessToken = null;
	}
}

const fetcher = async (input: RequestInfo | URL, init?: RequestInit, autoContent?: boolean, internal?: boolean) => {
	const apiUrl = internal && process.env.NODE_ENV === 'development' ? 'http://localhost:3000/api' : API_URL;

	const baseUrl = typeof input === 'string' && input.startsWith('http') ? '' : apiUrl;
	const inputWithBaseUrl = typeof input === 'string' ? baseUrl + input : input;

	const token = await getAuthToken();

	const authorizationHeader: HeadersInit = token ? { Authorization: `Bearer ${token}` } : {};

	const _init: RequestInit = {
		...init,
		headers: {
			Accept: 'application/json, text/plain, */*',
			...(!autoContent ? { 'Content-Type': 'application/json' } : {}),
			...authorizationHeader,
			...init?.headers,
		},
	};

	const res = await fetch(inputWithBaseUrl, _init);

	if (res.status === 401) {
		await clearAuthToken();

		if (!isServer) {
			window.location.href = '/login';
		} else {
			redirect('/login');
		}

		return {
			...res,
			json: async () => ({ data: undefined }),
		};
	}

	if (!res.ok) {
		let errorData: any = null;
		try {
			errorData = await res.json();
		} catch {}

		const error = new Error('API request failed');
		(error as any).response = res;
		(error as any).data = errorData;

		throw error;
	}

	return res;
};

export default fetcher;
