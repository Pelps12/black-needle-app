// src/server/trpc/router/index.ts
import { router } from "../trpc";
import { appointmentRouter } from "./appointment";
import { authRouter } from "./auth";
import { cartRouter } from "./cart";
import { chatRouter } from "./chat";
import { paymentRouter } from "./payment";
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
  payment: paymentRouter,
  //cart: cartRouter,
  appointment: appointmentRouter,
  //order: orderRouter,
  chat: chatRouter,
  cart: cartRouter,
  //waitlist: waitListRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
