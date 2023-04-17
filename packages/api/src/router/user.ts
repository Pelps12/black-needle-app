import { z } from "zod";

import { createTRPCRouter, protectedProcedure, publicProcedure } from "../trpc";

export const userRouter = createTRPCRouter({
  getCategories: publicProcedure
    .input(
      z.object({
        id: z.string(),
      }),
    )
    .query(async ({ input, ctx }) => {
      const user = await ctx.prisma.user.findFirst({
        where: {
          id: input.id,
        },
        include: {
          seller: {
            include: {
              Category: {
                include: {
                  Image: true,
                  prices: true,
                },
              },
            },
          },
        },
      });
      console.log(user);
      return {
        user,
      };
    }),

  setExpoToken: protectedProcedure
    .input(
      z.object({
        expoToken: z.string(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      await ctx.prisma.userNotificationToken.create({
        data: {
          userId: ctx.auth.userId,
          token: input.expoToken,
        },
      });
    }),
});
