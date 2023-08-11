import Expo, { ExpoPushToken } from "expo-server-sdk";
import { TRPCError } from "@trpc/server";
import Ably from "ably/promises";
import { z } from "zod";

import { type Message, type Participant, type Room } from "@acme/db";
import { env } from "@acme/env-config/env";

import { protectedProcedure, router } from "../trpc";
import { expo } from "../utils/expo";
import { twilio } from "../utils/twilio";

export const chatRouter = router({
  createRoom: protectedProcedure
    .input(
      z.object({
        userId: z.string(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const room = await ctx.prisma.room.create({
        data: {
          Participant: {
            createMany: {
              data: [
                {
                  userId: ctx.auth.userId,
                },
                {
                  userId: input.userId,
                },
              ],
            },
          },
          type: "PRIVATE",
        },
        include: {
          Participant: {
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

      const initiator = room.Participant.find(
        (participant) => participant.userId === ctx.auth.userId,
      );
      const receiver = room.Participant.find(
        (participant) => participant.userId !== ctx.auth.userId,
      );

      //ABSTRACT THIS AWAY
      if (initiator && receiver) {
        if (receiver.user.tokens) {
          const expoTokens: ExpoPushToken[] = receiver.user.tokens
            .map((token) => token.token as ExpoPushToken)
            .filter((token) => Expo.isExpoPushToken(token));

          if (expoTokens.length > 0) {
            const ticket = await expo.sendPushNotificationsAsync([
              {
                to: expoTokens,
                title: "Sakpa",
                body: `${
                  initiator.user.name ?? "Someone"
                } wants to start a chat with you`,
                sound: "default",
                data: {
                  senderId: initiator.userId,
                  roomId: room.id,
                },
              },
            ]);
            console.log(ticket);
          }
        } else {
          twilio.messages.create({
            body: `${
              initiator.user.name ?? "Someone"
            } wants to start a chat with you\n
            Go to ${env.NEXT_PUBLIC_URL}/chat to respond`,
            to: `+1${receiver.user.phoneNumber}`,
            messagingServiceSid: env.MESSAGING_SID,
          });
        }
      }

      return room;
    }),
  getRecentRooms: protectedProcedure.query(async ({ ctx }) => {
    const room = await ctx.prisma.room.findMany({
      where: {
        Participant: {
          some: {
            userId: ctx.auth.userId,
          },
        },
        Message: {
          some: {},
        },
      },
      include: {
        Participant: {
          where: {
            userId: {
              not: ctx.auth.userId,
            },
          },
          include: {
            user: {
              select: {
                name: true,
                image: true,
              },
            },
          },
        },
        Message: {
          orderBy: {
            sendAt: "desc",
          },
          take: 1,
        },
      },
    });
    return room.sort((a, b) => sortRooms(a, b));
  }),
  getRoom: protectedProcedure
    .input(
      z.object({
        userId: z.string(),
      }),
    )
    .query(async ({ input, ctx }) => {
      console.log(ctx.auth.userId, input.userId);
      const [room, user] = await Promise.all([
        ctx.prisma.room.findFirst({
          where: {
            Participant: {
              every: {
                userId: {
                  in: [ctx.auth.userId, input.userId],
                },
              },
            },
          },
        }),

        ctx.prisma.user.findFirst({
          where: {
            id: input.userId,
          },
          select: {
            image: true,
            name: true,
            email: true,
          },
        }),
      ]);

      return { room, user };
    }),
  getPreviousChats: protectedProcedure
    .input(
      z.object({
        userId: z.string(),
        roomId: z.string().optional(),
        limit: z.number().min(1).max(100).nullish(),
        cursor: z
          .object({
            roomId: z.string().cuid(),
            sendAt: z.date(),
          })
          .nullish(),
      }),
    )
    .query(async ({ input, ctx }) => {
      const limit = input.limit ?? 50;
      const { cursor } = input;

      if (!input.roomId) {
        throw new TRPCError({
          code: "BAD_REQUEST",
        });
      }

      const messages = await ctx.prisma.message.findMany({
        take: limit + 1,
        where: {
          roomId: input.roomId,
        },
        cursor: cursor
          ? {
              roomId_sendAt: cursor,
            }
          : undefined,
        orderBy: {
          sendAt: "desc",
        },
      });

      let nextCursor: typeof cursor | undefined = undefined;
      if (messages.length > limit) {
        const nextItem = messages.pop();
        nextCursor = {
          roomId: nextItem!.roomId,
          sendAt: nextItem!.sendAt,
        };
      }

      return {
        messages,
        nextCursor,
      };
    }),

  getToken: protectedProcedure.mutation(async ({ ctx }) => {
    const client = new Ably.Realtime({ key: env.ABLY_API_KEY });
    console.log("Definetely Authorized");
    console.log(ctx.auth.userId);
    const permissions: any = {
      "chat:*": ["publish"],
      "getting-started": ["publish", "subscribe"],
    };
    permissions[`chat:${ctx.auth.userId}`] = ["*"];
    const tokenRequestData = await client.auth.createTokenRequest({
      clientId: ctx.auth.userId,
      capability: permissions,
    });
    client.close();
    return tokenRequestData;
  }),

  getNotifications: protectedProcedure.query(async ({ ctx }) => {
    const count = await ctx.prisma.room.findMany({
      where: {
        Participant: {
          some: {
            userId: ctx.auth.userId,
          },
        },
        Message: {
          some: {
            read: false,
          },
        },
      },
      select: {
        id: true,
      },
    });

    return count;
  }),
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
  },
) => {
  if (!a.Message[0] || !b.Message[0]) return 1;
  return b.Message[0].sendAt.getTime() - a.Message[0].sendAt.getTime();
};
