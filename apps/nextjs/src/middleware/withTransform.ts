// middleware/withLogging.ts
import {
  NextResponse,
  type NextFetchEvent,
  type NextMiddleware,
  type NextRequest,
} from "next/server";

import { type MiddlewareFactory } from "./types";

export const withTransform: MiddlewareFactory = (next: NextMiddleware) => {
  return async (request: NextRequest, _next: NextFetchEvent) => {
    const headers = new Headers(request.headers);
    const encodedAuth = headers.get("authorization");
    if (encodedAuth) {
      headers.set(
        "authorization",
        `Bearer ${Buffer.from(encodedAuth, "base64").toString()}`,
      );
    }
    console.log(headers.get("authorization"));
    console.log("IN TRANSFORM");
    return NextResponse.next({
      headers,
    });
  };
};
