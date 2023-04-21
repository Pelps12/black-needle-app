import { router } from "../trpc";
import { appointmentRouter } from "./appointment";
import { authRouter } from "./auth";
import { chatRouter } from "./chat";
import { userRouter } from "./user";

export const appRouter = router({
  auth: authRouter,
  user: userRouter,
  appointment: appointmentRouter,
  chat: chatRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
