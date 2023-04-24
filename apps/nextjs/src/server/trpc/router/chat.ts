import { t, authedProcedure } from '../trpc';
import { TRPCError } from '@trpc/server';
import { z } from 'zod';
import { hash } from 'argon2';
import { env } from '../../../env/server.mjs';
import Stripe from 'stripe';
import { MessageInstance } from 'twilio/lib/rest/api/v2010/account/message';
import { twilio } from '@utils/twilio';
import Pusher from 'pusher';
import { Message, Participant, Room } from '@prisma/client';

const pusher = new Pusher({
	appId: env.NEXT_PUBLIC_PUSHER_APP_ID,
	key: env.NEXT_PUBLIC_PUSHER_KEY,
	secret: env.PUSHER_SECRET,
	cluster: env.NEXT_PUBLIC_PUSHER_CLUSTER,
	useTLS: true
});

export const chatRouter = t.router({
	sendMessage: authedProcedure
		.input(
			z.object({
				userId: z.string(),
				message: z.string()
			})
		)
		.mutation(async ({ input, ctx }) => {
			const response = await pusher.sendToUser(input.userId, 'message', {
				message: input.message
			});
			if (response.ok) {
				return input.message;
			} else {
				throw new TRPCError({
					code: 'INTERNAL_SERVER_ERROR',
					message: 'Pusher not available'
				});
			}
		}),
	createRoom: authedProcedure
		.input(
			z.object({
				userId: z.string().cuid()
			})
		)
		.mutation(async ({ input, ctx }) => {
			const room = await ctx.prisma.room.create({
				data: {
					Participant: {
						createMany: {
							data: [
								{
									userId: ctx.session.user.id
								},
								{
									userId: input.userId
								}
							]
						}
					},
					type: 'PRIVATE'
				},
				include: {
					Participant: {
						include: {
							user: true
						}
					}
				}
			});

			const initiator = room.Participant.find(
				(participant) => participant.userId === ctx.session.user.id
			);
			const receiver = room.Participant.find(
				(participant) => participant.userId !== ctx.session.user.id
			);

			if (initiator && receiver) {
				twilio.messages.create({
					body: `${initiator.user.name ?? 'Someone'} wants to start a chat with you\n
					Go to ${env.NEXT_PUBLIC_URL}/chat to respond`,
					to: `+1${receiver.user.phoneNumber}`,
					messagingServiceSid: env.MESSAGING_SID
				});
			}

			return room;
		}),
	getPreviousChats: authedProcedure
		.input(
			z.object({
				userId: z.string().cuid(),
				roomId: z.string().optional(),
				limit: z.number().min(1).max(100).nullish(),
				cursor: z
					.object({
						roomId: z.string().cuid(),
						sendAt: z.date()
					})
					.nullish()
			})
		)
		.query(async ({ input, ctx }) => {
			const limit = input.limit ?? 50;
			const { cursor } = input;

			if (!input.roomId) {
				throw new TRPCError({
					code: 'BAD_REQUEST'
				});
			}

			const messages = await ctx.prisma.message.findMany({
				take: limit + 1,
				where: {
					roomId: input.roomId
				},
				cursor: cursor
					? {
							roomId_sendAt: cursor
					  }
					: undefined,
				orderBy: {
					sendAt: 'desc'
				}
			});
			console.log(messages);

			let nextCursor: typeof cursor | undefined = undefined;
			if (messages.length > limit) {
				const nextItem = messages.pop();
				nextCursor = {
					roomId: nextItem!.roomId,
					sendAt: nextItem!.sendAt
				};
			}

			return {
				messages,
				nextCursor
			};
		}),
	getTest: authedProcedure
		.input(
			z.object({
				roomId: z.string()
			})
		)
		.mutation(async ({ input, ctx }) => {
			console.log('gnionrfg0eorinefgo');
			const test = await ctx.prisma.message.findUnique({
				where: {
					roomId_sendAt: {
						roomId: input.roomId || ':)',
						sendAt: new Date('2022-12-01T01:48:19.884Z')
					}
				}
			});
			return test;
		}),
	getRoom: authedProcedure
		.input(
			z.object({
				userId: z.string().cuid(),
				limit: z.number().min(1).max(100).nullish(),
				cursor: z.string().nullish()
			})
		)
		.query(async ({ input, ctx }) => {
			const limit = input.limit ?? 50;
			const { cursor } = input;
			const [room, user] = await Promise.all([
				ctx.prisma.room.findFirst({
					where: {
						Participant: {
							every: {
								userId: {
									in: [ctx.session.user.id, input.userId]
								}
							}
						}
					}
				}),

				ctx.prisma.user.findFirst({
					where: {
						id: input.userId
					},
					select: {
						image: true,
						name: true,
						email: true
					}
				})
			]);

			return { room, user };
		}),
	getRecentRooms: authedProcedure.query(async ({ ctx }) => {
		const room = await ctx.prisma.room.findMany({
			where: {
				Participant: {
					some: {
						userId: ctx.session.user.id
					}
				},
				Message: {
					some: {}
				}
			},
			include: {
				Participant: {
					where: {
						userId: {
							not: ctx.session.user.id
						}
					},
					include: {
						user: {
							select: {
								name: true,
								image: true
							}
						}
					}
				},
				Message: {
					orderBy: {
						sendAt: 'desc'
					},
					take: 1
				}
			}
		});
		return room.sort((a, b) => sortRooms(a, b));
	})
});

const sortRooms = (
	a: Room & {
		Participant: (Participant & {
			user: {
				image: string | null;
				name: string | null;
			};
		})[];
		Message: Message[];
	},
	b: Room & {
		Participant: (Participant & {
			user: {
				image: string | null;
				name: string | null;
			};
		})[];
		Message: Message[];
	}
) => {
	if (!a.Message[0] || !b.Message[0]) return 1;
	return b.Message[0].sendAt.getTime() - a.Message[0].sendAt.getTime();
};
