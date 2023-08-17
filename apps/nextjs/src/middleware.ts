import { env } from '@acme/env-config/env';
import { authMiddleware } from '@clerk/nextjs';
import { withClerkMiddleware } from '@clerk/nextjs/server';
import { NextResponse, type NextRequest } from 'next/server';

const PUBLIC_FILE = /\.(.*)$/;

// This function can be marked `async` if using `await` inside

export default authMiddleware({
	publicRoutes: () => {
		return true;
	},
	signInUrl: '/sign-in'
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
