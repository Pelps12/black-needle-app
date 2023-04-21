import { z } from "zod";

import { type Message, type Participant, type Room } from "@acme/db";

import { protectedProcedure, router } from "../trpc";

export const chatRouter = router({
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
