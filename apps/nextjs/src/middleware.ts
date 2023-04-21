import { NextResponse, type NextRequest } from "next/server";
import { withClerkMiddleware } from "@clerk/nextjs/server";

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
    "/(.*?trpc.*?|(?!static|.*\\..*|_next|favicon.ico).*)",
  ],
};
