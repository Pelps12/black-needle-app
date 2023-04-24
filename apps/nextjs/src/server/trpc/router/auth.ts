import { t, authedProcedure } from '../trpc';
import { z } from 'zod';

export const authRouter = t.router({
	getSession: t.procedure.query(({ ctx }) => {
		return ctx.session;
	}),
	getUser: authedProcedure.query(({ ctx }) => {
		return ctx.session?.user?.id;
	}),
	getSecretMessage: authedProcedure.query(() => {
		return 'You are logged in and can see this secret message!';
	})
});
