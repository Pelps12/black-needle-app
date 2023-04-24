import { t, authedProcedure } from '../trpc';
import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { OrderStatus } from '@prisma/client';
import Stripe from 'stripe';
import { env } from '../../../env/server.mjs';
import mixpanel from 'mixpanel';
import UAParser from 'ua-parser-js';

const stripe = new Stripe(env.STRIPE_SECRET_KEY, {
	apiVersion: '2022-11-15'
});

export const orderRouter = t.router({
	getOrders: authedProcedure
		.input(
			z.object({
				sellerMode: z.boolean().default(false)
			})
		)
		.query(async ({ input, ctx }) => {
			console.log(ctx.headers.re);
			if (input.sellerMode) {
				const orders = await ctx.prisma.orderOnItem.findMany({
					where: {
						price: {
							category: {
								sellerId: ctx.session.user.id
							}
						}
					},
					include: {
						price: {
							include: {
								category: {
									include: {
										Image: true,
										seller: {
											select: {
												downPaymentPercentage: true
											}
										}
									}
								}
							}
						}
					},
					orderBy: {
						updatedAt: 'desc'
					}
				});
				return orders;
			} else {
				const orders = await ctx.prisma.orderOnItem.findMany({
					where: {
						userId: ctx.session.user.id
					},
					include: {
						price: {
							include: {
								category: {
									include: {
										Image: true,
										seller: {
											select: {
												downPaymentPercentage: true
											}
										}
									}
								}
							}
						}
					},
					orderBy: {
						updatedAt: 'desc'
					}
				});
				return orders;
			}
		}),
	updateOrderStatus: authedProcedure
		.input(
			z.object({
				newStatus: z.nativeEnum(OrderStatus),
				itemId: z.string()
			})
		)
		.mutation(async ({ input, ctx }) => {
			{
				const order = await ctx.prisma.orderOnItem.findFirst({
					where: {
						id: input.itemId,
						price: {
							category: {
								sellerId: ctx.session.user.id
							}
						}
					}
				});
				if (order) {
					const updatedOrder = await ctx.prisma.orderOnItem.update({
						where: {
							id: input.itemId
						},
						data: {
							status: input.newStatus,
							updatedAt: new Date()
						}
					});
					return updatedOrder;
				} else {
					throw new TRPCError({
						code: 'BAD_REQUEST',
						message: 'Invalid input'
					});
				}
			}
		}),

	//Real payment point
	createOrder: authedProcedure
		.input(
			z.object({
				itemIds: z.array(z.string()),
				origin: z.string()
			})
		)
		.mutation(async ({ input, ctx }) => {
			//EXTERMELY EXPENSIVE QUERY. WORTH IT DUE TO TRANSACTION
			if (!ctx.session.user.phoneVerified) {
				throw new TRPCError({
					code: 'UNAUTHORIZED',
					message: "You haven't "
				});
			}
			const ua = UAParser(ctx.headers['user-agent']);
			const ip = ctx.headers['x-forwarded-for'];
			const ipString = typeof ip === 'string' ? ip : typeof ip === 'undefined' ? ':)' : ip[0]!;
			const order = await ctx.prisma.order.create({
				data: {
					userId: ctx.session.user.id,
					OrderOnItem: {
						connect: input.itemIds.map((item) => {
							return {
								id: item
							};
						})
					}
				},
				include: {
					OrderOnItem: {
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
					}
				}
			});
			let totalAmount = 0;

			if (order.OrderOnItem?.length > 0) {
				const session = await stripe.checkout.sessions.create({
					line_items: [
						...order.OrderOnItem.map((item) => {
							if (item.status === 'APPROVED') {
								totalAmount += item.price.amount;
								return {
									price_data: {
										currency: 'usd',
										product_data: {
											name: item.price.name,
											images: item.price.category.Image.map((image) => image.link)
										},
										unit_amount: item.price.amount * 100
									},
									quantity: item.quantity
								};
							} else {
								return {};
							}
						}),
						{
							price_data: {
								currency: 'usd',
								product_data: {
									name: 'Service Fee'
								},
								unit_amount: totalAmount < 9 ? 135 : Math.ceil(totalAmount * 15)
							},
							quantity: 1
						}
					],
					...(ctx.session.user.email ? { customer_email: ctx.session.user.email } : {}),
					success_url: `${env.NEXT_PUBLIC_URL}/profile`,
					cancel_url: `${input.origin}/?canceled=true`,
					custom_text: {
						submit: {
							message:
								'We have 15% service charge.\n We are working on making this reflect more clearly'
						}
					},
					mode: 'payment',

					payment_intent_data: {
						transfer_group: order.id,
						metadata: {
							userId: ctx.session.user.id,
							type: 'order',
							username: ctx.session.user.name || 'Unknown user',
							lineItemSellers: JSON.stringify(
								order.OrderOnItem.map((item) => {
									if (item.status === 'APPROVED') {
										return {
											id: item.id,
											sellerNumber: item.price.category.seller.phoneNumber,
											sellerId: item.price.category.seller.id,
											amount: item.price.amount
										};
									} else {
										return {};
									}
								})
							),
							orderId: order.id,
							userAgent: JSON.stringify({
								os: ua.os.name,
								browser: ua.browser.name,
								browser_version: ua.browser.version
							}),
							ip: ipString
						}
					}
				});
				if (session.payment_intent?.toString()) {
					await ctx.prisma.order.update({
						where: {
							id: order.id
						},
						data: {
							paymentIntent: session.payment_intent.toString()
						}
					});
				}

				return session;
			} else {
				throw new TRPCError({
					code: 'BAD_REQUEST',
					message: 'Cart is empty'
				});
			}
		})
});
