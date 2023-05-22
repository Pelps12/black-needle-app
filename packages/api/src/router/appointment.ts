import {
  Expo,
  ExpoPushMessage,
  type ExpoPushTicket,
  type ExpoPushToken,
} from "expo-server-sdk";
import { clerkClient } from "@clerk/nextjs/server";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { Day } from "@acme/db";

import { protectedProcedure, publicProcedure, router } from "../trpc";

const expo = new Expo({ accessToken: process.env.EXPO_ACCESS_TOKEN });

export const appointmentRouter = router({
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
});
