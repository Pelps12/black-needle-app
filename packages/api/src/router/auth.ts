
import { protectedProcedure, router } from "../trpc";

export const authRouter = router({
  getSession: protectedProcedure.query(({ ctx }) => {
    return ctx.auth.userId;
  }),
  getSecretMessage: protectedProcedure.query(() => {
    return "You are logged in and can see this secret message!";
  }),
});
