import {
  Expo,
  ExpoPushMessage,
  type ExpoPushTicket,
  type ExpoPushToken,
} from "expo-server-sdk";
import { clerkClient } from "@clerk/nextjs/server";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { Day, Role } from "@acme/db";
import { env } from "@acme/env-config/env";

import { protectedProcedure, publicProcedure, router } from "../trpc";
import { stripe } from "../utils/stripe";

const expo = new Expo({ accessToken: env.EXPO_ACCESS_TOKEN });
function addSeconds(date: Date, seconds: number) {
  const newDate = new Date(date);
  newDate.setSeconds(date.getSeconds() + seconds);
  return newDate;
}

export const appointmentRouter = router({
  deleteSellerAvailability: protectedProcedure
    .input(
      z.object({
        availabilityId: z.string(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const deletedAvailability =
        await ctx.prisma.sellerAvailability.deleteMany({
          where: {
            id: input.availabilityId,
            sellerId: ctx.auth.userId,
          },
        });
      return deletedAvailability.count !== 0;
    }),
  getSellerAvailabilty: protectedProcedure
    .input(
      z.object({
        sellerId: z.string(),
        day: z.nativeEnum(Day),
      }),
    )
    .query(async ({ input, ctx }) => {
      const sellerAvailability = await ctx.prisma.sellerAvailability.findMany({
        where: {
          sellerId: ctx.auth.userId,
          day: input.day,
        },
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
          sellerId: av.sellerId,
        };
      });
      return availability;
    }),
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
      }),
    )
    .mutation(async ({ input, ctx }) => {
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
          seller: {
            include: {
              user: {
                include: {
                  tokens: true,
                },
              },
            },
          },
        },
      });
      if (appointment) {
        const expoTokens: ExpoPushToken[] = appointment.seller.user.tokens
          .map((token) => token.token)
          .filter((token) => Expo.isExpoPushToken(token));

        if (expoTokens.length > 0) {
          const ticket = await expo.sendPushNotificationsAsync([
            {
              to: expoTokens,
              title: `New Appointment from ${
                ctx.auth.user?.username ?? "User"
              }`,
              body: "Respond to their request",
              sound: "default",
              data: {
                senderId: ctx.auth.userId,
              },
            },
          ]);
          console.log(ticket);
        }
      }

      return appointment;
    }),
  getAppointments: protectedProcedure
    .input(
      z.object({
        sellerMode: z.boolean().default(false),
      }),
    )
    .query(async ({ input, ctx }) => {
      if (input.sellerMode) {
        const appointments = await ctx.prisma.appointment.findMany({
          where: {
            price: {
              category: {
                sellerId: ctx.auth.userId,
              },
            },
          },
          include: {
            price: {
              include: {
                category: {
                  include: {
                    Image: true,
                    seller: {
                      select: {
                        downPaymentPercentage: true,
                      },
                    },
                  },
                },
              },
            },
          },
          orderBy: {
            createdAt: "desc",
          },
        });
        console.log(appointments);
        return appointments;
      } else {
        const appointment = await ctx.prisma.appointment.findMany({
          where: {
            userId: ctx.auth.userId,
          },
          include: {
            price: {
              include: {
                category: {
                  include: {
                    Image: true,
                    seller: {
                      select: {
                        downPaymentPercentage: true,
                      },
                    },
                  },
                },
              },
            },
          },
          orderBy: {
            createdAt: "desc",
          },
        });
        console.log(appointment);
        return appointment;
      }
    }),

  rescheduleAppointment: protectedProcedure
    .input(
      z.object({
        appointmentId: z.string(),
        sellerAvailability: z.string(),
        date: z.date(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      if (input.date < new Date()) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Date is in the past",
        });
      }
      const [timeslot, user] = await Promise.all([
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
            seller: {
              select: {
                phoneNumber: true,
              },
            },
          },
        }),
        clerkClient.users.getUser(ctx.auth.userId),
      ]);
      console.log(input.date);
      console.log(timeslot?.Appointment);
      if (timeslot?.Appointment.length !== 0) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "Timeslot already booked",
        });
      }

      const updatedAppointment = await ctx.prisma.appointment.update({
        where: {
          id: input.appointmentId,
        },
        data: {
          appointmentDate: input.date,
          sellerAvailabilityId: input.sellerAvailability,
          status: "PENDING",
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
          seller: {
            include: {
              user: {
                include: {
                  tokens: true,
                },
              },
            },
          },
        },
      });

      const expoTokens: ExpoPushToken[] = updatedAppointment.seller.user.tokens
        .map((token) => token.token)
        .filter((token) => Expo.isExpoPushToken(token));

      expo.sendPushNotificationsAsync([
        {
          to: expoTokens,
          title: `Reschedule Request from ${user.username ?? "User"}`,
          body: "Respond to their request",
          sound: "default",
          data: {
            senderId: ctx.auth.userId,
          },
        },
      ]);

      /* await twilio.messages.create({
				body: `${
					ctx.session.user.name || 'A customer'
				} wants reschedule their appointment.\nGo to https://sakpa.co/profile to approve the change`,
				to: `+1${timeslot.seller.phoneNumber}`,
				messagingServiceSid: env.MESSAGING_SID
			}); */

      return updatedAppointment;
    }),
  refundPayment: protectedProcedure
    .input(
      z.object({
        canceler: z.nativeEnum(Role),
        appointmentId: z.string().cuid(),
        reason: z.string().optional(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const appointment = await ctx.prisma.appointment.findFirstOrThrow({
        where: {
          id: input.appointmentId,
        },
        include: {
          seller: true,
          price: true,
        },
      });
      if (input.canceler === "BUYER") {
        if (appointment.userId === ctx.auth.userId) {
          if (
            appointment.status === "DOWNPAID" &&
            appointment.seller.downPaymentPercentage
          ) {
            await stripe.payouts.create({
              amount:
                appointment.seller.downPaymentPercentage *
                appointment.price.amount *
                100,
              currency: "usd",
            });
            await ctx.prisma.appointment.update({
              where: {
                id: input.appointmentId,
              },
              data: {
                canceler: "BUYER",
                cancellationReason: input.reason,
                status: "CANCELED",
              },
            });
          } else if (
            appointment.status === "APPROVED" &&
            !appointment.seller.downPaymentPercentage
          ) {
            await ctx.prisma.appointment.update({
              where: {
                id: input.appointmentId,
              },
              data: {
                canceler: "BUYER",
                cancellationReason: input.reason,
                status: "CANCELED",
              },
            });
          }
        } else {
          throw new TRPCError({
            code: "UNAUTHORIZED",
          });
        }
      } else if (input.canceler === "SELLER") {
        if ((appointment.sellerId = ctx.auth.userId)) {
          if (
            appointment.status === "DOWNPAID" &&
            appointment.seller.downPaymentPercentage &&
            appointment.paymentIntent
          ) {
            await stripe.refunds.create({
              amount:
                appointment.seller.downPaymentPercentage *
                appointment.price.amount *
                100,
              payment_intent: appointment.paymentIntent,
              currency: "usd",
              reverse_transfer: true,
            });

            await ctx.prisma.appointment.update({
              where: {
                id: input.appointmentId,
              },
              data: {
                canceler: "SELLER",
                cancellationReason: input.reason,
                status: "CANCELED",
              },
            });
          } else if (
            appointment.status == "PAID" &&
            !appointment.seller.downPaymentPercentage
          ) {
            await ctx.prisma.appointment.update({
              where: {
                id: input.appointmentId,
              },
              data: {
                canceler: "SELLER",
                cancellationReason: input.reason,
                status: "CANCELED",
              },
            });
          }
        }
      }
    }),
  completePayment: protectedProcedure
    .input(
      z.object({
        appointmentId: z.string().cuid(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const [appointment, user] = await Promise.all([
        ctx.prisma.appointment.findFirst({
          where: {
            id: input.appointmentId,
            userId: ctx.auth.userId,
          },
          include: {
            price: {
              include: {
                category: {
                  include: {
                    Image: true,
                    seller: true,
                  },
                },
              },
            },
          },
        }),
        clerkClient.users.getUser(ctx.auth.userId),
      ]);

      if (!appointment?.price.category.seller.downPaymentPercentage) {
        throw new TRPCError({
          code: "BAD_REQUEST",
        });
      }

      if (appointment) {
        const totalAmount = appointment.price.amount;
        console.log(appointment.price.category);
        const session = await stripe.checkout.sessions.create({
          line_items: [
            {
              price_data: {
                currency: "usd",
                product_data: {
                  name: `${appointment.price.name} (Remaining Amount)`,
                  images: appointment.price.category.Image.map(
                    (image) => image.link,
                  ),
                },
                unit_amount:
                  appointment.price.amount *
                  (1 -
                    appointment.price.category.seller.downPaymentPercentage) *
                  100,
              },

              quantity: 1,
            },
            {
              price_data: {
                currency: "usd",
                product_data: {
                  name: "Service Fee",
                },
                unit_amount: totalAmount < 9 ? 135 : Math.ceil(totalAmount * 7),
              },

              quantity: 1,
            },
          ],
          success_url: `${env.NEXT_PUBLIC_URL}/profile`,
          cancel_url: `${ctx.headers?.referer}/?canceled=true`,
          custom_text: {
            submit: {
              message: "We have 7% service charge.",
            },
          },
          mode: "payment",
          payment_intent_data: {
            transfer_group: appointment.id,

            metadata: {
              userId: ctx.auth.userId,
              type: "appointment",
              username: user.username || "Unknown User",
              seller: JSON.stringify({
                id: appointment.id,
                sellerNumber: appointment.price.category.seller.phoneNumber,
              }),
              isDownPayment: "false",
            },
          },
        });
        return session;
      } else {
        throw new TRPCError({
          code: "UNAUTHORIZED",
        });
      }
    }),
});
