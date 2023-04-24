import { t, authedProcedure } from '../trpc';
import { TRPCError } from '@trpc/server';
import { z } from 'zod';
import { hash } from 'argon2';
import { env } from '../../../env/server.mjs';
import Stripe from 'stripe';
import { MessageInstance } from 'twilio/lib/rest/api/v2010/account/message';
import Twilio from 'twilio';
import Mixpanel from 'mixpanel';
import UAParser from 'ua-parser-js';
import { randomUUID } from 'node:crypto';

const twilio = Twilio(env.TWILIO_SID, env.AUTH_TOKEN);
const mixpanel = Mixpanel.init(env.NEXT_PUBLIC_MIXPANEL_TOKEN);

export const cartRouter = t.router({
	addToCart: authedProcedure
		.input(
			z.object({
				priceId: z.string(),
				quantity: z.number()
			})
		)
		.mutation(async ({ input, ctx }) => {
			const ua = UAParser(ctx.headers['user-agent']);
			const ip = ctx.headers['x-forwarded-for'] || '127.0.0.1';
			const ipString = typeof ip === 'string' ? ip : typeof ip === 'undefined' ? ':)' : ip[0]!;
			const cart_item = await ctx.prisma.cartOnPrices.upsert({
				where: {
					priceId_cartId: {
						priceId: input.priceId,
						cartId: ctx.session.user.id
					}
				},
				update: {
					quantity: {
						increment: input.quantity
					},
					updatedAt: new Date()
				},
				create: {
					cartId: ctx.session.user.id,
					priceId: input.priceId,
					quantity: input.quantity
				}
			});
			console.log(ua.browser.name);
			mixpanel.track('Item Added to Cart', {
				distinct_id: ctx.session.user.id || randomUUID(),
				$insert_id: randomUUID(),
				ip: ipString,
				$os: ua.os.name,
				$browser: ua.browser.name,
				$browser_version: ua.browser.version,
				price_id: cart_item.priceId
			});
			return cart_item;
		}),
	deletefromCart: authedProcedure
		.input(
			z.object({
				priceId: z.string()
			})
		)
		.mutation(async ({ input, ctx }) => {
			const cart_item = await ctx.prisma.cartOnPrices.delete({
				where: {
					priceId_cartId: {
						priceId: input.priceId,
						cartId: ctx.session.user.id
					}
				}
			});
			return cart_item;
		}),
	decrementItem: authedProcedure
		.input(
			z.object({
				priceId: z.string(),
				quantity: z.number()
			})
		)
		.mutation(async ({ input, ctx }) => {
			const cart_item = await ctx.prisma.cartOnPrices.update({
				where: {
					priceId_cartId: {
						priceId: input.priceId,
						cartId: ctx.session.user.id
					}
				},
				data: {
					quantity: {
						decrement: input.quantity
					},
					updatedAt: new Date()
				}
			});
			return cart_item;
		}),
	getCart: authedProcedure.query(async ({ input, ctx }) => {
		const cart = await ctx.prisma.cart.findUnique({
			where: {
				id: ctx.session.user.id
			},
			include: {
				CartOnPrices: {
					include: {
						price: {
							include: {
								category: {
									include: {
										Image: true
									}
								}
							}
						}
					}
				}
			}
		});

		return cart?.CartOnPrices;
	}),
	checkout: authedProcedure.mutation(async ({ input, ctx }) => {
		//Very expensive query
		const cartItems = await ctx.prisma.cartOnPrices.findMany({
			where: {
				cartId: ctx.session.user.id
			},

			include: {
				price: {
					include: {
						category: {
							include: {
								Image: true,
								seller: true
							}
						}
					}
				}
			}
		});

		//Make Orders in Database
		await ctx.prisma.orderOnItem.createMany({
			data: cartItems.map((item) => {
				return {
					priceId: item.priceId,
					userId: ctx.session.user.id,
					quantity: item.quantity
				};
			})
		});

		//Send SMS to sellers about the order so they can approve it
		const messageCalls: Promise<MessageInstance>[] = [];

		cartItems.map(async (item) => {
			messageCalls.push(
				twilio.messages.create({
					body: `Order for ${item.price.name} from ${
						ctx.session.user.name || 'Customer'
					}.\nGo to https://sakpa.co/profile to approve the order`,
					to: `+1${item.price.category.seller.phoneNumber}`,
					messagingServiceSid: env.MESSAGING_SID
				})
			);
		});

		const messageResults = await Promise.all([
			...messageCalls,
			ctx.prisma.cartOnPrices.deleteMany({
				where: {
					cartId: ctx.session.user.id
				}
			})
		]);
		return messageResults.filter((message) => message instanceof MessageInstance);
	})
});
