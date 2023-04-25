import { t, authedProcedure } from '../trpc';
import { TRPCError } from '@trpc/server';
import { z } from 'zod';
import { hash } from 'argon2';

export const registrationRouter = t.router({
	register: t.procedure
		.input(
			z.object({
				name: z.string(),
				email: z.string().min(1),
				image: z.string().nullish(),
				password: z.string()
			})
		)
		.mutation(async ({ input, ctx }) => {
			try {
				const hashedPassword: string = await hash(input.password);
				console.log(hashedPassword);
				const user = await ctx.prisma.user.create({
					data: {
						email: input.email,
						password: hashedPassword,
						name: input.name
					}
				});

				console.log(':))))');
				return {
					user: { name: input.name }
				};
			} catch (err: any) {
				throw new TRPCError({
					code: 'BAD_REQUEST',
					message: err.message
				});
			}
		})
	/* sellerRegister: t.procedure
		.input(
			z.object({
				school: z.string(),
				email: z.string().min(1),
				image: z.string().nullish(),
				password: z.string()
			})
		)
		.mutation(async ({ input, ctx }) => {
			try {
				const hashedPassword: string = await hash(input.password);
				console.log(hashedPassword);
				const user = await ctx.prisma.user.create({
					data: {
						email: input.email,
						password: hashedPassword,
						name: input.name
					}
				});

				console.log(':))))');
				return {
					user: { name: input.name }
				};
			} catch (err: any) {
				throw new TRPCError({
					code: 'BAD_REQUEST',
					message: err.message
				});
			}
		}) */
});

function waitforme(milisec: number) {
	return new Promise((resolve) => {
		setTimeout(() => {
			resolve('');
		}, milisec);
	});
}
