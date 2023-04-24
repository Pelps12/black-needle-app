import { t, authedProcedure } from '../trpc';
import { TRPCError } from '@trpc/server';
import { z } from 'zod';
import { hash } from 'argon2';
import { Prisma, Image, Day } from '@prisma/client';
import { env } from '../../../env/server.mjs';
import { env as clientEnv } from '../../../env/client.mjs';
import { esClient } from '@utils/elastic';
import Stripe from 'stripe';
import UAParser from 'ua-parser-js';
import Mixpanel from 'mixpanel';

const stripe = new Stripe(env.STRIPE_SECRET_KEY, {
	apiVersion: '2022-11-15'
});

const mixpanel = Mixpanel.init(env.NEXT_PUBLIC_MIXPANEL_TOKEN);

export const userRouter = t.router({
	createCategory: authedProcedure
		.input(
			z.object({
				name: z.string(),
				isNew: z.string().optional()
			})
		)
		.mutation(async ({ input, ctx }) => {
			if (ctx.session.user.role === 'BUYER') {
				throw new TRPCError({
					code: 'UNAUTHORIZED',
					message: 'Register as a seller'
				});
			}
			const category = await ctx.prisma.category.create({
				data: {
					name: input.name,
					sellerId: ctx.session.user.id
				},
				include: {
					Image: true
				}
			});

			const elasticResult = await esClient.index({
				index: 'categories',
				id: category.id,
				document: {
					name: category.name,
					'seller-id': ctx.session.user.id,
					type: category.type
				}
			});
			return category;
		}),
	updateCategory: authedProcedure
		.input(
			z.object({
				categoryId: z.string(),
				name: z.string()
			})
		)
		.mutation(async ({ input, ctx }) => {
			const galleryOwnerId = await ctx.prisma.category.findFirst({
				where: {
					id: input.categoryId
				},
				select: {
					sellerId: true
				}
			});

			if (galleryOwnerId) {
				if (ctx.session.user.id === galleryOwnerId.sellerId) {
					const category = await ctx.prisma.category.update({
						where: {
							id: input.categoryId
						},
						data: {
							name: input.name
						}
					});
					await esClient.update({
						index: 'categories',
						id: category.id,
						doc: {
							name: category.name,
							'seller-id': ctx.session.user.id,
							type: category.type
						},
						doc_as_upsert: true
					});
				}
			}
		}),
	updateImage: authedProcedure
		.input(
			z.array(
				z.object({
					imageId: z.string(),
					link: z.string()
				})
			)
		)
		.mutation(async ({ input, ctx }) => {
			const images = await ctx.prisma.image.findMany({
				where: {
					id: {
						in: input.map((input) => input.imageId)
					}
				},
				include: {
					category: true
				}
			});
			console.log(images);
			images.forEach((image) => {
				if (image.category?.sellerId !== ctx.session.user.id) {
					throw new TRPCError({
						message: 'Not authorized',
						code: 'UNAUTHORIZED'
					});
				}
			});
			const result = await fetch('https://api.uploadcare.com/files/storage/', {
				method: 'DELETE',
				body: JSON.stringify(images.map((input) => input.link.split('/')[3])),
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Uploadcare.Simple ${clientEnv.NEXT_PUBLIC_UPLOADCARE_PUB_KEY}:${env.UPLOADCARE_SECRET_KEY}`,
					Accept: 'application/vnd.uploadcare-v0.7+json'
				}
			});
			console.log(images.map((input) => input.link.split('/')[3]));

			if (!result.ok) {
				console.log(await result.json());
			} else {
				console.log(await result.json());
			}

			await Promise.all(
				input.map((input) => {
					return ctx.prisma.image.update({
						where: {
							id: input.imageId
						},
						data: {
							link: input.link
						}
					});
				})
			);
		}),
	getCategories: t.procedure
		.input(
			z.object({
				id: z.string()
			})
		)
		.query(async ({ input, ctx }) => {
			const user = await ctx.prisma.user.findFirst({
				where: {
					id: input.id
				},
				include: {
					seller: {
						include: {
							Category: {
								include: {
									Image: true,
									prices: true
								}
							}
						}
					}
				}
			});

			return {
				user
			};
		}),
	getMe: authedProcedure.query(async ({ input, ctx }) => {
		const user = await ctx.prisma.user.findFirst({
			where: {
				id: ctx.session.user.id
			}
		});

		return user;
	}),
	getSeller: t.procedure
		.input(
			z.object({
				id: z.string()
			})
		)
		.query(async ({ input, ctx }) => {
			const seller = await ctx.prisma.seller.findFirst({
				where: {
					id: input.id
				}
			});

			return {
				seller
			};
		}),
	updateUser: authedProcedure
		.input(
			z.object({
				image: z.string().optional(),
				name: z.string().optional(),
				phoneNumber: z.string().optional()
			})
		)
		.mutation(async ({ input, ctx }) => {
			const promises = [
				...(ctx.session.user.image?.includes('ucarecdn.com')
					? [
							fetch(
								`https://api.uploadcare.com/files/${ctx.session.user.image.split('/')[3]}/storage/`,
								{
									method: 'DELETE',
									headers: {
										'Content-Type': 'application/json',
										Authorization: `Uploadcare.Simple ${clientEnv.NEXT_PUBLIC_UPLOADCARE_PUB_KEY}:${env.UPLOADCARE_SECRET_KEY}`,
										Accept: 'application/vnd.uploadcare-v0.7+json'
									}
								}
							)
					  ]
					: []),
				ctx.prisma.user.update({
					where: {
						id: ctx.session.user.id
					},
					data: {
						image: input.image,
						name: input.name,
						phoneNumber: input.phoneNumber,
						...(input.phoneNumber ? { phoneVerified: true } : {})
					}
				})
			];

			const result = await Promise.all(promises);
			mixpanel.people.set(ctx.session.user.id, {
				$name: ctx.session.user.name,
				$email: ctx.session.user.email
			});
			console.log(result);
		}),

	deleteCategory: authedProcedure
		.input(
			z.object({
				categoryId: z.string().cuid({ message: 'Invalid ID' })
			})
		)
		.mutation(async ({ input, ctx }) => {
			const category = await ctx.prisma.category.findFirst({
				where: {
					id: input.categoryId
				},
				include: {
					Image: true
				}
			});

			if (!category) {
				throw new TRPCError({
					code: 'BAD_REQUEST'
				});
			}
			if (category.sellerId !== ctx.session.user.id) {
				throw new TRPCError({
					code: 'UNAUTHORIZED'
				});
			}
			const result = await fetch('https://api.uploadcare.com/files/storage/', {
				method: 'DELETE',
				body: JSON.stringify(category.Image.map((image) => image.link.split('/')[3])),
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Uploadcare.Simple ${clientEnv.NEXT_PUBLIC_UPLOADCARE_PUB_KEY}:${env.UPLOADCARE_SECRET_KEY}`,
					Accept: 'application/vnd.uploadcare-v0.7+json'
				}
			});
			console.log(await result.json());

			const deletedCategory = await ctx.prisma.category.delete({
				where: {
					id: input.categoryId
				}
			});

			esClient.delete({
				index: 'categories',
				id: deletedCategory.id
			});
		}),
	createSeller: authedProcedure
		.input(
			z.object({
				phone_number: z.string(),
				school: z.string(),
				services: z.array(z.string()),
				description: z.string().optional(),
				downPaymentPercentage: z.number().optional()
			})
		)
		.mutation(async ({ input, ctx }) => {
			const ua = UAParser(ctx.headers['user-agent']);
			const ip = ctx.headers['x-forwarded-for'];
			const ipString = typeof ip === 'string' ? ip : typeof ip === 'undefined' ? ':)' : ip[0]!;
			if (!ctx.session.user.phoneVerified) {
				throw new TRPCError({
					code: 'UNAUTHORIZED',
					message: "You haven't added your phone_number"
				});
			}
			const _ = input.services.map((service) => {
				console.log(service);
				return {
					sellerId: ctx.session.user.id,
					serviceName: service
				};
			});
			console.log(_);
			const seller = await ctx.prisma.seller.findFirst({
				where: {
					id: ctx.session.user.id
				}
			});
			let accountId: string;
			if (seller?.subAccountID) {
				accountId = seller.subAccountID;
			} else {
				//Create a stripe account
				const account = await stripe.accounts.create({
					country: 'US',
					type: 'express',
					...(ctx.session.user.email ? { email: ctx.session.user.email } : {}),
					business_type: 'individual',
					individual: {
						...(ctx.session.user.email ? { email: ctx.session.user.email } : {})
					},
					settings: {
						payouts: {
							schedule: {
								interval: 'manual'
							}
						}
					},
					metadata: {
						userId: ctx.session.user.id,
						userAgent: JSON.stringify({
							os: ua.os.name,
							browser: ua.browser.name,
							browser_version: ua.browser.major
						}),
						ip: ipString
					}
				});
				accountId = account.id;
				await ctx.prisma.seller.create({
					data: {
						id: ctx.session.user.id,
						phoneNumber: input.phone_number,
						school: input.school,
						services: {
							create: input.services.map((service) => {
								console.log(service);
								return {
									serviceName: service
								};
							})
						},
						downPaymentPercentage: input.downPaymentPercentage
							? input.downPaymentPercentage / 100.0
							: undefined,
						subAccountID: account.id
					}
				});
			}

			//Set users role to seller and create onboarding link for stripe account
			const [accountLink] = await Promise.all([
				stripe.accountLinks.create({
					account: accountId,
					refresh_url: `${env.NEXT_PUBLIC_URL}/seller/register?refresh=true`,
					return_url: `${env.NEXT_PUBLIC_URL}/seller/register?return=true`,
					type: 'account_onboarding'
				})
			]);
			return {
				accountLink
			};
		}),
	refreshStripe: authedProcedure.mutation(async ({ input, ctx }) => {
		const seller = await ctx.prisma.seller.findFirst({
			where: {
				id: ctx.session.user.id
			}
		});
		if (!seller || !seller.subAccountID) {
			throw new TRPCError({
				code: 'UNAUTHORIZED',
				message: "Bruh. You aren't a seller"
			});
		}

		const accountLink = await stripe.accountLinks.create({
			account: seller.subAccountID,
			refresh_url: `${env.NEXT_PUBLIC_URL}/seller/register?refresh=true`,
			return_url: `${env.NEXT_PUBLIC_URL}/seller/register?return=true`,
			type: 'account_onboarding'
		});
		return {
			accountLink
		};
	}),
	verifyStripe: authedProcedure.mutation(async ({ input, ctx }) => {
		const seller = await ctx.prisma.seller.findFirst({
			where: {
				id: ctx.session.user.id
			}
		});
		if (!seller || !seller.subAccountID) {
			throw new TRPCError({
				code: 'UNAUTHORIZED',
				message: "Bruh. You aren't a seller"
			});
		}

		const account = await stripe.accounts.retrieve(seller.subAccountID);

		return {
			seller,
			success: account.details_submitted
		};
	}),
	createStripeAccountLink: authedProcedure.mutation(async ({ ctx }) => {
		if (ctx.session.user.role === 'BUYER') {
			throw new TRPCError({
				code: 'UNAUTHORIZED',
				message: 'You are not a seller'
			});
		}
		const seller = await ctx.prisma.seller.findFirst({
			where: {
				id: ctx.session.user.id
			}
		});
		if (seller?.subAccountID) {
			const accountLink = await stripe.accounts.createLoginLink(seller.subAccountID);
			return accountLink;
		} else {
			throw new TRPCError({
				code: 'UNAUTHORIZED',
				message: 'You have not finished the Stripe onboarding'
			});
		}
	}),

	createNewAvailability: authedProcedure
		.input(
			z.object({
				from: z.number(),
				to: z.number(),
				day: z.nativeEnum(Day),
				sellerId: z.string()
			})
		)
		.mutation(async ({ input, ctx }) => {
			const timeslot = await ctx.prisma.sellerAvailability.create({
				data: {
					from: input.from,
					to: input.to,
					day: input.day,
					sellerId: input.sellerId
				}
			});

			return {
				timeslot
			};
		})
});
