import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

export function proxy(request: NextRequest) {
	const accessToken = request.cookies.get('access_token')?.value;
	console.log('accessToken', accessToken);

	const isLoggedIn = !!accessToken;
	const { pathname } = request.nextUrl;

	const allowedPaths = ['/login', '/forgot-password', '/reset-password', '/oauth/callback'];

	const allowedPathPatterns = [/^\/hellosign-contract\/.*/, /^\/staff\/set-password\/.*/];

	const isAllowedPath =
		allowedPaths.includes(pathname) || allowedPathPatterns.some((pattern) => pattern.test(pathname));

	if (isAllowedPath) {
		return NextResponse.next();
	}

	if (!isLoggedIn) {
		return NextResponse.redirect(new URL('/login', request.url));
	}

	return NextResponse.next();
}

export const config = {
	matcher: ['/((?!api|_next|.*\\..*).*)'],
};
