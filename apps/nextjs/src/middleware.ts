import { env } from '@acme/env-config/env';
import { withClerkMiddleware } from '@clerk/nextjs/server';
import { NextResponse, type NextRequest } from 'next/server';

const PUBLIC_FILE = /\.(.*)$/;

// This function can be marked `async` if using `await` inside

export default withClerkMiddleware((request: NextRequest) => {
	const { pathname } = request.nextUrl;
	const url = request.nextUrl.clone();

	if (
		pathname.startsWith('/_next') || // exclude Next.js internals
		pathname.startsWith('/api') || //  exclude all API routes
		pathname.startsWith('/static') || // exclude static files
		PUBLIC_FILE.test(pathname)
	) {
		return NextResponse.next();
	}

	return NextResponse.next();
});

// Stop Middleware running on static files
export const config = {
	matcher: [
		/*
		 * Match request paths except for the ones starting with:
		 * - _next
		 * - static (static files)
		 * - favicon.ico (favicon file)
		 *
		 * This includes images, and requests from TRPC.
		 */
		'/(.*?trpc.*?|(?!static|.*\\..*|_next|favicon.ico).*)'
	]
};
