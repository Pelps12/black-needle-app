// src/server/trpc/router/index.ts
import { t } from '../trpc';
import { authRouter } from './auth';
import { uploadRouter } from './upload';
import { registrationRouter } from './registration';
import { userRouter } from './user';
import { priceRouter } from './price';
import { searchRouter } from './search';
import { cartRouter } from './cart';
import { appointmentRouter } from './appointment';
import { orderRouter } from './order';
import { chatRouter } from './chat';
import { waitListRouter } from './waitlist';

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
	waitlist: waitListRouter
});

// export type definition of API
export type AppRouter = typeof appRouter;
