import { t, authedProcedure } from '../trpc';
import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { Day, OrderStatus, Role } from '@prisma/client';
import Stripe from 'stripe';
import { env } from '../../../env/server.mjs';
import { MessageInstance } from 'twilio/lib/rest/api/v2010/account/message';

const stripe = new Stripe(env.STRIPE_SECRET_KEY, {
	apiVersion: '2022-11-15'
});
import Twilio from 'twilio';
import UAParser from 'ua-parser-js';

const twilio = Twilio(env.TWILIO_SID, env.AUTH_TOKEN);

function addSeconds(date: Date, seconds: number) {
	const newDate = new Date(date);
	newDate.setSeconds(date.getSeconds() + seconds);
	return newDate;
}

export const appointmentRouter = t.router({
	createAppointment: authedProcedure
		.input(
			z.object({
				sellerAvailability: z.string(),
				date: z.date(),
				priceId: z.string(),
				origin: z.string()
			})
		)
		.mutation(async ({ input, ctx }) => {
			console.log(input.date);
			if (!ctx.session.user.phoneVerified) {
				throw new TRPCError({
					code: 'UNAUTHORIZED',
					message: "You haven't verified with a phone number.\nGo to profile to add one."
				});
			}
			if (input.date < new Date()) {
				throw new TRPCError({
					code: 'BAD_REQUEST',
					message: 'Date is in the past'
				});
			}
			const [timeslot] = await Promise.all([
				ctx.prisma.sellerAvailability.findFirst({
					where: {
						id: input.sellerAvailability
					},
					include: {
						Appointment: {
							where: {
								appointmentDate: input.date,
								status: {
									in: ['APPROVED', 'DOWNPAID']
								}
							}
						},
						seller: true
					}
				})
			]);
			console.log(input.date);
			console.log(timeslot?.Appointment);
			if (timeslot?.Appointment.length !== 0) {
				throw new TRPCError({
					code: 'CONFLICT',
					message: 'Timeslot already booked'
				});
			}

			const appointment = await ctx.prisma.appointment.create({
				data: {
					appointmentDate: input.date,
					sellerAvailabilityId: input.sellerAvailability,
					userId: ctx.session.user.id,
					sellerId: timeslot.sellerId,
					priceId: input.priceId
				},
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
			});
			if (appointment) {
				/* const session = await stripe.checkout.sessions.create({
					line_items: [
						{
							price_data: {
								currency: 'usd',
								product_data: {
									name: appointment.price.name,
									images: appointment.price.category.Image.map((image) => image.link)
								},
								unit_amount: appointment.price.amount * 100
							},
							quantity: 1
						}
					],
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
						transfer_group: appointment.id,

						metadata: {
							userId: ctx.session.user.id,
							type: 'appointment',
							username: ctx.session.user.name || 'Unknown User',
							seller: JSON.stringify({
								id: appointment.id,
								sellerNumber: timeslot.seller.phoneNumber
							})
						}
					}
				}); */
				const messageCalls: Promise<MessageInstance>[] = [];

				const message = await twilio.messages.create({
					body: `Appointment for ${appointment.price.name} from ${
						ctx.session.user.name || 'Customer'
					}.\nGo to https://sakpa.co/profile to approve the order`,
					to: `+1${timeslot.seller.phoneNumber}`,
					messagingServiceSid: env.MESSAGING_SID
				});
			}

			return appointment;
		}),
	payAppointment: authedProcedure
		.input(
			z.object({
				appointmentId: z.string().cuid()
			})
		)
		.mutation(async ({ input, ctx }) => {
			const ua = UAParser(ctx.headers['user-agent']);
			const ip = ctx.headers['x-forwarded-for'];
			const ipString = typeof ip === 'string' ? ip : typeof ip === 'undefined' ? ':)' : ip[0]!;

			const appointment = await ctx.prisma.appointment.findFirst({
				where: {
					id: input.appointmentId,
					userId: ctx.session.user.id
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

			if (appointment) {
				const totalAmount = appointment.price.amount;
				console.log(appointment.price.category);
				const session = await stripe.checkout.sessions.create({
					line_items: [
						{
							price_data: {
								...(appointment.price.category.seller.downPaymentPercentage
									? {
											currency: 'usd',
											product_data: {
												name: `${appointment.price.name} (Down Payment)`,
												images: appointment.price.category.Image.map((image) => image.link)
											},
											unit_amount:
												appointment.price.amount *
												appointment.price.category.seller.downPaymentPercentage *
												100
									  }
									: {
											currency: 'usd',
											product_data: {
												name: appointment.price.name,
												images: appointment.price.category.Image.map((image) => image.link)
											},
											unit_amount: appointment.price.amount * 100
									  })
							},
							quantity: 1
						},
						...(appointment.price.category.seller.downPaymentPercentage
							? []
							: [
									{
										price_data: {
											currency: 'usd',
											product_data: {
												name: 'Service Fee'
											},
											unit_amount: totalAmount < 9 ? 135 : Math.ceil(totalAmount * 7)
										},

										quantity: 1
									}
							  ])
					],
					success_url: `${env.NEXT_PUBLIC_URL}/profile`,
					cancel_url: `${ctx.headers.referer}/?canceled=true`,
					custom_text: {
						submit: {
							message: 'We have 7% service charge.'
						}
					},
					mode: 'payment',
					payment_intent_data: {
						transfer_group: appointment.id,

						metadata: {
							userId: ctx.session.user.id,
							type: 'appointment',
							username: ctx.session.user.name || 'Unknown User',
							seller: JSON.stringify({
								id: appointment.id,
								sellerNumber: appointment.price.category.seller.phoneNumber
							}),
							userAgent: JSON.stringify({
								os: ua.os.name,
								browser: ua.browser.name,
								browser_version: ua.browser.version
							}),
							isDownPayment: `${Boolean(appointment.price.category.seller.downPaymentPercentage)}`,
							ip: ipString
						}
					}
				});
				return session;
			} else {
				throw new TRPCError({
					code: 'UNAUTHORIZED'
				});
			}
		}),
	getAppointment: authedProcedure
		.input(
			z.object({
				sellerMode: z.boolean().default(false)
			})
		)
		.query(async ({ input, ctx }) => {
			if (input.sellerMode) {
				const appointments = await ctx.prisma.appointment.findMany({
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
				return appointments;
			} else {
				const appointment = await ctx.prisma.appointment.findMany({
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
				return appointment;
			}
		}),
	refundPayment: authedProcedure
		.input(
			z.object({
				canceler: z.nativeEnum(Role),
				appointmentId: z.string().cuid(),
				reason: z.string().optional()
			})
		)
		.mutation(async ({ input, ctx }) => {
			const appointment = await ctx.prisma.appointment.findFirstOrThrow({
				where: {
					id: input.appointmentId
				},
				include: {
					seller: true,
					price: true
				}
			});
			if (input.canceler === 'BUYER') {
				if (appointment.userId === ctx.session.user.id) {
					if (appointment.status === 'DOWNPAID' && appointment.seller.downPaymentPercentage) {
						await stripe.payouts.create({
							amount: appointment.seller.downPaymentPercentage * appointment.price.amount * 100,
							currency: 'usd'
						});
						await ctx.prisma.appointment.update({
							where: {
								id: input.appointmentId
							},
							data: {
								canceler: 'BUYER',
								cancellationReason: input.reason,
								status: 'CANCELED'
							}
						});
					} else if (
						appointment.status === 'APPROVED' &&
						!appointment.seller.downPaymentPercentage
					) {
						await ctx.prisma.appointment.update({
							where: {
								id: input.appointmentId
							},
							data: {
								canceler: 'BUYER',
								cancellationReason: input.reason,
								status: 'CANCELED'
							}
						});
					}
				} else {
					throw new TRPCError({
						code: 'UNAUTHORIZED'
					});
				}
			} else if (input.canceler === 'SELLER') {
				if ((appointment.sellerId = ctx.session.user.id)) {
					if (
						appointment.status === 'DOWNPAID' &&
						appointment.seller.downPaymentPercentage &&
						appointment.paymentIntent
					) {
						await stripe.refunds.create({
							amount: appointment.seller.downPaymentPercentage * appointment.price.amount * 100,
							payment_intent: appointment.paymentIntent,
							currency: 'usd',
							reverse_transfer: true
						});

						await ctx.prisma.appointment.update({
							where: {
								id: input.appointmentId
							},
							data: {
								canceler: 'SELLER',
								cancellationReason: input.reason,
								status: 'CANCELED'
							}
						});
					} else if (appointment.status == 'PAID' && !appointment.seller.downPaymentPercentage) {
						await ctx.prisma.appointment.update({
							where: {
								id: input.appointmentId
							},
							data: {
								canceler: 'SELLER',
								cancellationReason: input.reason,
								status: 'CANCELED'
							}
						});
					}
				}
			}
		}),
	completePayment: authedProcedure
		.input(
			z.object({
				appointmentId: z.string().cuid()
			})
		)
		.mutation(async ({ input, ctx }) => {
			const ua = UAParser(ctx.headers['user-agent']);
			const ip = ctx.headers['x-forwarded-for'];
			const ipString = typeof ip === 'string' ? ip : typeof ip === 'undefined' ? ':)' : ip[0]!;

			const appointment = await ctx.prisma.appointment.findFirst({
				where: {
					id: input.appointmentId,
					userId: ctx.session.user.id
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

			if (!appointment?.price.category.seller.downPaymentPercentage) {
				throw new TRPCError({
					code: 'BAD_REQUEST'
				});
			}

			if (appointment) {
				const totalAmount = appointment.price.amount;
				console.log(appointment.price.category);
				const session = await stripe.checkout.sessions.create({
					line_items: [
						{
							price_data: {
								currency: 'usd',
								product_data: {
									name: `${appointment.price.name} (Remaining Amount)`,
									images: appointment.price.category.Image.map((image) => image.link)
								},
								unit_amount:
									appointment.price.amount *
									(1 - appointment.price.category.seller.downPaymentPercentage) *
									100
							},

							quantity: 1
						}
					],
					success_url: `${env.NEXT_PUBLIC_URL}/profile`,
					cancel_url: `${ctx.headers.referer}/?canceled=true`,
					custom_text: {
						submit: {
							message: 'We have 7% service charge.'
						}
					},
					mode: 'payment',
					payment_intent_data: {
						transfer_group: appointment.id,

						metadata: {
							userId: ctx.session.user.id,
							type: 'appointment',
							username: ctx.session.user.name || 'Unknown User',
							seller: JSON.stringify({
								id: appointment.id,
								sellerNumber: appointment.price.category.seller.phoneNumber
							}),
							userAgent: JSON.stringify({
								os: ua.os.name,
								browser: ua.browser.name,
								browser_version: ua.browser.version
							}),
							isDownPayment: 'false',
							ip: ipString
						}
					}
				});
				return session;
			} else {
				throw new TRPCError({
					code: 'UNAUTHORIZED'
				});
			}
		}),
	getSellerAvailabilty: authedProcedure
		.input(
			z.object({
				sellerId: z.string(),
				day: z.nativeEnum(Day)
			})
		)
		.query(async ({ input, ctx }) => {
			const sellerAvailability = await ctx.prisma.sellerAvailability.findMany({
				where: {
					sellerId: ctx.session.user.id,
					day: input.day
				}
			});
			const newDate = new Date(new Date().setHours(0, 0, 0, 0));
			console.log(newDate);

			const availability = sellerAvailability.map((av) => {
				console.log(addSeconds(newDate, av.from), addSeconds(newDate, av.to));
				return {
					id: av.id,
					from: av.from,
					to: av.to,
					day: av.day,
					sellerId: av.sellerId
				};
			});
			return availability;
		}),
	deleteSellerAvailability: authedProcedure
		.input(
			z.object({
				availabilityId: z.string()
			})
		)
		.mutation(async ({ input, ctx }) => {
			const deletedAvailability = await ctx.prisma.sellerAvailability.deleteMany({
				where: {
					id: input.availabilityId,
					sellerId: ctx.session.user.id
				}
			});
			return deletedAvailability.count !== 0;
		}),
	getFreeTimeslots: t.procedure
		.input(
			z.object({
				sellerId: z.string(),
				day: z.nativeEnum(Day),
				priceId: z.string(),
				date: z.date()
			})
		)
		.mutation(async ({ input, ctx }) => {
			const offset = input.date.getTimezoneOffset();
			console.log(input.date);
			const diff = (offset - new Date().getTimezoneOffset()) / 60;
			console.log('DIFF', diff);
			const start = new Date(input.date);
			console.log(start);
			const [seller, price] = await Promise.all([
				ctx.prisma.seller.findFirst({
					where: {
						id: input.sellerId
					},
					include: {
						availability: {
							where: {
								day: input.day
							},
							include: {
								Appointment: {
									where: {
										appointmentDate: {
											lte: new Date(input.date.setHours(23, 59, 59, 999)),
											gte: input.date
										},
										status: {
											notIn: ['DECLINED', 'CANCELED', 'FAILED']
										}
									},
									include: {
										price: true
									}
								}
							}
						}
					}
				}),
				ctx.prisma.price.findFirst({
					where: {
						id: input.priceId
					}
				})
			]);
			console.log(seller);
			console.log(start);
			console.log(price);
			const timeslots: { date: Date; availabilityId: string }[] = [];
			if (price?.duration) {
				seller?.availability.forEach((availability) => {
					console.log(availability);
					for (let i = 0; i < availability.to - availability.from; i += 1800) {
						console.log(`Round ${i}`);
						const conflicts = availability.Appointment.find((apt) => {
							const aptStartTimeUnix = (apt.appointmentDate?.getTime() || 0) / 1000;
							const aptEndTimeUnix = aptStartTimeUnix + (apt.price.duration || 0);
							const startDateUnix = start.getTime() / 1000;
							const iStartUnix = i + availability.from + startDateUnix;
							const iEndUnix = i + availability.from + startDateUnix + (price?.duration || 0);
							console.log(aptStartTimeUnix, aptEndTimeUnix, iStartUnix, iEndUnix, startDateUnix);
							if (iStartUnix >= aptEndTimeUnix && iEndUnix > aptEndTimeUnix) {
								return false;
							}

							if (iStartUnix < aptStartTimeUnix && iEndUnix <= aptStartTimeUnix) {
								return false;
							}

							return true;
						});
						console.log(conflicts);

						const availabilityDate = new Date((availability.from + i) * 1000 + start.getTime());
						availabilityDate.setTime(availabilityDate.getTime() + diff * 60000);
						if (!conflicts && availabilityDate > new Date()) {
							timeslots.push({
								date: availabilityDate,
								availabilityId: availability.id
							});
						}
					}
				});
			}
			const minutes = 1;
			const ms = 1000 * 60 * minutes;
			return timeslots;
		}),
	updateAppointmentStatus: authedProcedure
		.input(
			z.object({
				newStatus: z.nativeEnum(OrderStatus),
				itemId: z.string()
			})
		)
		.mutation(async ({ input, ctx }) => {
			{
				const appointment = await ctx.prisma.appointment.findFirst({
					where: {
						id: input.itemId,
						price: {
							category: {
								sellerId: ctx.session.user.id
							}
						}
					}
				});
				if (appointment) {
					const updatedAppointment = await ctx.prisma.appointment.update({
						where: {
							id: input.itemId
						},
						data: {
							status: input.newStatus,
							updatedAt: new Date()
						},
						include: {
							price: true,
							user: true
						}
					});
					if (updatedAppointment.status === 'APPROVED') {
						twilio.messages.create({
							body: `Appointment for ${updatedAppointment.price.name} approved by ${
								ctx.session.user.name || 'Seller'
							}.\nGo to https://sakpa.co/profile to pay for the order`,
							to: `+1${updatedAppointment.user.phoneNumber}`,
							messagingServiceSid: env.MESSAGING_SID
						});
					} else {
						twilio.messages.create({
							body: `Appointment for ${updatedAppointment.price.name} declined by ${
								ctx.session.user.name || 'Seller'
							}`,
							to: `+1${updatedAppointment.user.phoneNumber}`,
							messagingServiceSid: env.MESSAGING_SID
						});
					}

					return updatedAppointment;
				} else {
					throw new TRPCError({
						code: 'BAD_REQUEST',
						message: 'Invalid input'
					});
				}
			}
		}),
	rescheduleAppointment: authedProcedure
		.input(
			z.object({
				appointmentId: z.string(),
				sellerAvailability: z.string(),
				date: z.date()
			})
		)
		.mutation(async ({ input, ctx }) => {
			console.log(input.date);
			if (!ctx.session.user.phoneVerified) {
				throw new TRPCError({
					code: 'UNAUTHORIZED',
					message: "You haven't verified with a phone number.\nGo to profile to add one."
				});
			}
			if (input.date < new Date()) {
				throw new TRPCError({
					code: 'BAD_REQUEST',
					message: 'Date is in the past'
				});
			}
			const [timeslot] = await Promise.all([
				ctx.prisma.sellerAvailability.findFirst({
					where: {
						id: input.sellerAvailability
					},
					include: {
						Appointment: {
							where: {
								appointmentDate: input.date,
								status: {
									in: ['APPROVED', 'DOWNPAID']
								}
							}
						},
						seller: {
							select: {
								phoneNumber: true
							}
						}
					}
				})
			]);
			console.log(input.date);
			console.log(timeslot?.Appointment);
			if (timeslot?.Appointment.length !== 0) {
				throw new TRPCError({
					code: 'CONFLICT',
					message: 'Timeslot already booked'
				});
			}

			const updatedAppointment = await ctx.prisma.appointment.update({
				where: {
					id: input.appointmentId
				},
				data: {
					appointmentDate: input.date,
					sellerAvailabilityId: input.sellerAvailability,
					status: 'PENDING'
				},
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
			});

			await twilio.messages.create({
				body: `${
					ctx.session.user.name || 'A customer'
				} wants reschedule their appointment.\nGo to https://sakpa.co/profile to approve the change`,
				to: `+1${timeslot.seller.phoneNumber}`,
				messagingServiceSid: env.MESSAGING_SID
			});

			return updatedAppointment;
		})
});
