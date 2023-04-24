import { t, authedProcedure } from '../trpc';
import { TRPCError } from '@trpc/server';
import { z } from 'zod';
import { hash } from 'argon2';

export const waitListRouter = t.router({
	joinWaitList: t.procedure
		.input(
			z.object({
				email: z.string().email()
			})
		)
		.mutation(async ({ input, ctx }) => {
			await ctx.prisma.waitlist.create({
				data: {
					email: input.email
				}
			});
			return 'SUCCESS';
		})
});
