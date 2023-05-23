import { IncomingHttpHeaders } from "http";
import type {
  SignedInAuthObject,
  SignedOutAuthObject,
} from "@clerk/nextjs/api";
import { getAuth } from "@clerk/nextjs/server";
import { type inferAsyncReturnType } from "@trpc/server";
import { type CreateNextContextOptions } from "@trpc/server/adapters/next";

import { prisma } from "@acme/db";

/**
 * Replace this with an object if you want to pass things to createContextInner
 */
type AdditionalContextProps = {
  auth: SignedInAuthObject | SignedOutAuthObject;
  headers?: IncomingHttpHeaders;
};

/** Use this helper for:
 *  - testing, where we dont have to Mock Next.js' req/res
 *  - trpc's `createSSGHelpers` where we don't have req/res
 * @see https://beta.create.t3.gg/en/usage/trpc#-servertrpccontextts
 */
export const createContextInner = async ({
  auth,
  headers,
}: AdditionalContextProps) => {
  return {
    auth,
    prisma,
    headers,
  };
};

/**
 * This is the actual context you'll use in your router
 * @link https://trpc.io/docs/context
 **/
export const createContext = async (opts: CreateNextContextOptions) => {
  /* const authorization = opts.req.headers.authorization;
  console.log(authorization);
  if (authorization) {
    opts.req.headers.authorization =
      "Bearer " + Buffer.from(authorization, "base64").toString();
    console.log(opts.req.headers, "41");
    console.log(getAuth(opts.req));
  } */

  return await createContextInner({ auth: getAuth(opts.req) });
};

export type Context = inferAsyncReturnType<typeof createContext>;
