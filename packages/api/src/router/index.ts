// src/server/trpc/router/index.ts
import { router } from "../trpc";
import { appointmentRouter } from "./appointment";
import { authRouter } from "./auth";
import { chatRouter } from "./chat";
import { priceRouter } from "./price";
import { searchRouter } from "./search";
import { uploadRouter } from "./upload";
import { userRouter } from "./user";

export const appRouter = router({
  auth: authRouter,
  upload: uploadRouter,
  //registration: registrationRouter,
  user: userRouter,
  price: priceRouter,
  search: searchRouter,
  //cart: cartRouter,
  appointment: appointmentRouter,
  //order: orderRouter,
  chat: chatRouter,
  //waitlist: waitListRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
