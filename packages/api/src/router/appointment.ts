/* eslint-disable @typescript-eslint/restrict-plus-operands */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */

import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { Day } from "@acme/db";

import { createTRPCRouter, protectedProcedure, publicProcedure } from "../trpc";

export const appointmentRouter = createTRPCRouter({
  getFreeTimeslots: publicProcedure
    .input(
      z.object({
        sellerId: z.string(),
        day: z.nativeEnum(Day),
        priceId: z.string(),
        date: z.date(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const offset = input.date.getTimezoneOffset();
      console.log(input.date);
      const diff = (offset - new Date().getTimezoneOffset()) / 60;
      console.log("DIFF", diff);
      const start = new Date(input.date);
      console.log(start);
      const [seller, price] = await Promise.all([
        ctx.prisma.seller.findFirst({
          where: {
            id: input.sellerId,
          },
          include: {
            availability: {
              where: {
                day: input?.day,
              },
              include: {
                Appointment: {
                  where: {
                    appointmentDate: {
                      lte: new Date(input.date.setHours(23, 59, 59, 999)),
                      gte: input.date,
                    },
                    status: {
                      notIn: ["DECLINED", "CANCELED", "FAILED"],
                    },
                  },
                  include: {
                    price: true,
                  },
                },
              },
            },
          },
        }),
        ctx.prisma.price.findFirst({
          where: {
            id: input.priceId,
          },
        }),
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
              const aptStartTimeUnix =
                (apt.appointmentDate?.getTime() || 0) / 1000;
              const aptEndTimeUnix =
                aptStartTimeUnix + (apt.price.duration || 0);
              const startDateUnix = start.getTime() / 1000;
              const iStartUnix = i + availability.from + startDateUnix;
              const iEndUnix =
                i + availability.from + startDateUnix + (price?.duration || 0);
              console.log(
                aptStartTimeUnix,
                aptEndTimeUnix,
                iStartUnix,
                iEndUnix,
                startDateUnix,
              );
              if (iStartUnix >= aptEndTimeUnix && iEndUnix > aptEndTimeUnix) {
                return false;
              }

              if (
                iStartUnix < aptStartTimeUnix &&
                iEndUnix <= aptStartTimeUnix
              ) {
                return false;
              }

              return true;
            });
            console.log(conflicts);

            const availabilityDate = new Date(
              (availability.from + i) * 1000 + start.getTime(),
            );
            availabilityDate.setTime(availabilityDate.getTime() + diff * 60000);
            if (!conflicts && availabilityDate > new Date()) {
              timeslots.push({
                date: availabilityDate,
                availabilityId: availability.id,
              });
            }
          }
        });
      }

      return timeslots;
    }),
  createAppointment: protectedProcedure
    .input(
      z.object({
        sellerAvailability: z.string(),
        date: z.date(),
        priceId: z.string(),
        origin: z.string(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      console.log(input.date);

      if (input.date < new Date()) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Date is in the past",
        });
      }
      const [timeslot] = await Promise.all([
        ctx.prisma.sellerAvailability.findFirst({
          where: {
            id: input.sellerAvailability,
          },
          include: {
            Appointment: {
              where: {
                appointmentDate: input.date,
                status: {
                  in: ["APPROVED", "DOWNPAID"],
                },
              },
            },
            seller: true,
          },
        }),
      ]);
      console.log(input.date);
      console.log(timeslot?.Appointment);
      if (timeslot?.Appointment.length !== 0) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "Timeslot already booked",
        });
      }

      const appointment = await ctx.prisma.appointment.create({
        data: {
          appointmentDate: input.date,
          sellerAvailabilityId: input.sellerAvailability,
          userId: ctx.auth.userId,
          sellerId: timeslot.sellerId,
          priceId: input.priceId,
        },
        include: {
          price: {
            include: {
              category: {
                include: {
                  Image: true,
                },
              },
            },
          },
        },
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
        //CONVERT TO PUSH NOTIFICATIONS
        /* const messageCalls: Promise<MessageInstance>[] = [];

				const message = await twilio.messages.create({
					body: `Appointment for ${appointment.price.name} from ${
						ctx.session.user.name || 'Customer'
					}.\nGo to https://sakpa.co/profile to approve the order`,
					to: `+1${timeslot.seller.phoneNumber}`,
					messagingServiceSid: env.MESSAGING_SID
				}); */
      }

      return appointment;
    }),
});
