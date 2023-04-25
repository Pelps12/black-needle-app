import { TRPCError } from '@trpc/server';
import { z } from 'zod';
import { env } from '../../../env/server.mjs';
import { authedProcedure, t } from '../trpc';
import { mixpanel } from '@utils/mixpanel';
import { randomUUID } from 'crypto';
import UAParser from 'ua-parser-js';
import { esClient as client } from '@utils/elastic';

export const priceRouter = t.router({
	createPrice: authedProcedure
		.input(
			z.object({
				categoryId: z.string(),
				amount: z.number(),
				name: z.string(),
				type: z.enum(['GOOD', 'SERVICE']),
				duration: z.number().optional()
			})
		)
		.mutation(async ({ input, ctx }) => {
			const ua = UAParser(ctx.headers['user-agent']);
			const ip = ctx.headers['x-forwarded-for'] || '127.0.0.1';
			const ipString = typeof ip === 'string' ? ip : typeof ip === 'undefined' ? ':)' : ip[0]!;

			const category = await ctx.prisma.category.findFirst({
				where: {
					id: input.categoryId
				},
				include: {
					seller: true,
					Image: true
				}
			});
			if (!category) {
				throw new TRPCError({
					code: 'BAD_REQUEST',
					message: "Category doesn't exist"
				});
			}

			if (category.seller && category.sellerId === ctx.session.user.id) {
				const price = await ctx.prisma.price.create({
					data: {
						name: input.name,
						amount: input.amount,
						categoryId: input.categoryId,
						type: input.type,
						duration: input.duration
					}
				});

				client.index({
					index: 'products',
					id: price.id,
					body: {
						name: price.name,
						'seller-id': category.sellerId,
						amount: price.amount,
						'category-name': category.name,
						'category-id': category.id,
						school: category.seller.school,
						'seller-icon': ctx.session.user.image,
						image: category.Image[0]?.link || ':)' //Gets random image from sellers category
					}
				});

				mixpanel.track('Listing Posted', {
					distinct_id: ctx.session.user.id,
					$insert_id: randomUUID(),
					amount: price.amount,
					ip: ipString,
					$os: ua.os.name,
					$browser: ua.browser.name,
					$browser_version: ua.browser.version
				});

				return {
					price
				};
			} else {
				throw new TRPCError({
					code: 'UNAUTHORIZED'
				});
			}
		}),
	updatePrice: authedProcedure
		.input(
			z.object({
				priceId: z.string(),
				amount: z.number().optional(),
				name: z.string().optional(),
				categoryId: z.string().optional(),
				type: z.enum(['GOOD', 'SERVICE']).optional()
			})
		)
		.mutation(async ({ input, ctx }) => {
			const price = await ctx.prisma.price.findFirst({
				where: {
					id: input.priceId
				},
				include: {
					category: true
				}
			});
			if (!price) {
				throw new TRPCError({
					code: 'BAD_REQUEST',
					message: "Category doesn't exist"
				});
			}

			if (price.category.sellerId === ctx.session.user.id) {
				const updatedPrice = await ctx.prisma.price.update({
					where: {
						id: input.priceId
					},
					data: {
						name: input.name,
						amount: input.amount,
						categoryId: input.categoryId || price.categoryId,
						type: input.type
					},
					include: {
						category: {
							include: {
								Image: true,
								seller: true
							}
						}
					}
				});

				client.update({
					index: 'products',
					id: price.id,
					doc: {
						name: updatedPrice.name,
						'seller-id': updatedPrice.category.sellerId,
						amount: updatedPrice.amount,
						'category-name': updatedPrice.category.name,
						'category-id': updatedPrice.category.id,
						school: updatedPrice.category.seller.school,
						'seller-icon': ctx.session.user.image,
						image: updatedPrice.category.Image[0]?.link || ':)' //Gets random image from sellers category
					}
				});

				return {
					updatedPrice
				};
			} else {
				throw new TRPCError({
					code: 'UNAUTHORIZED'
				});
			}
		}),
	deletePrice: authedProcedure
		.input(
			z.object({
				priceId: z.string()
			})
		)
		.mutation(async ({ input, ctx }) => {
			const price = await ctx.prisma.price.findFirst({
				where: {
					id: input.priceId
				},
				include: {
					category: true
				}
			});
			if (!price) {
				throw new TRPCError({
					code: 'BAD_REQUEST',
					message: "Category doesn't exist"
				});
			}

			if (price.category.sellerId === ctx.session.user.id) {
				const deletedPrice = await ctx.prisma.price.delete({
					where: {
						id: input.priceId
					}
				});

				client.delete({
					index: 'products',
					id: deletedPrice.id
				});
				return {
					deletedPrice
				};
			} else {
				throw new TRPCError({
					code: 'UNAUTHORIZED'
				});
			}
		})
});
