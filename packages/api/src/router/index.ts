// src/server/trpc/router/index.ts
import { t } from "../trpc";
import { appointmentRouter } from "./appointment";
import { authRouter } from "./auth";
import { cartRouter } from "./cart";
import { chatRouter } from "./chat";
import { orderRouter } from "./order";
import { priceRouter } from "./price";
import { registrationRouter } from "./registration";
import { searchRouter } from "./search";
import { uploadRouter } from "./upload";
import { userRouter } from "./user";
import { waitListRouter } from "./waitlist";

export const appRouter = t.router({
  auth: authRouter,
  upload: uploadRouter,
  registration: registrationRouter,
  user: userRouter,
  price: priceRouter,
  search: searchRouter,
  cart: cartRouter,
  appointment: appointmentRouter,
  order: orderRouter,
  chat: chatRouter,
  waitlist: waitListRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
