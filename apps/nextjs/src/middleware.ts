import { env } from './env/server.mjs';
import { withClerkMiddleware } from '@clerk/nextjs/server';
import { NextResponse, type NextRequest } from 'next/server';

const PUBLIC_FILE = /\.(.*)$/;

// This function can be marked `async` if using `await` inside
export function middleware(request: NextRequest) {
	//console.log(request.nextUrl.hostname);
	const { pathname } = request.nextUrl;
	const url = request.nextUrl.clone();

	if (
		pathname.startsWith('/_next') || // exclude Next.js internals
		pathname.startsWith('/api') || //  exclude all API routes
		pathname.startsWith('/static') || // exclude static files
		PUBLIC_FILE.test(pathname)
	) {
		return NextResponse.next();
	} // exclude all files in the public folder)
	if (process.env.VERCEL_ENVIRONMENT === 'prod' && pathname === '/login/dev') {
		url.pathname = '/';
		return NextResponse.redirect(url);
	}

	if (process.env.VERCEL_ENVIRONMENT === 'dev') {
		return NextResponse.next();
	}

	if (pathname !== '/soon' && process.env.NEXT_PUBLIC_IN_DEV === 'true') {
		url.pathname = '/soon';
		return NextResponse.redirect(url);
	}

	return NextResponse.next();
}

export default withClerkMiddleware((_req: NextRequest) => {
	/* const authorization = _req.headers.get("authorization");
  console.log(_req.headers, "Line 6");
  const headers = new Headers(_req.headers);
  if (authorization) {
    headers.delete("Authorization");
    headers.set(
      "Authorization",
      "Bearer " + Buffer.from(authorization, "base64").toString(),
    );
  } */
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
