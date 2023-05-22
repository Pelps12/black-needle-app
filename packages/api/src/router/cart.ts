import { randomUUID } from "node:crypto";
import { TRPCError } from "@trpc/server";
import Stripe from "stripe";
import { z } from "zod";

import { protectedProcedure, router } from "../trpc";

export const cartRouter = router({
  addToCart: protectedProcedure
    .input(
      z.object({
        priceId: z.string(),
        quantity: z.number(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const cart_item = await ctx.prisma.cartOnPrices.upsert({
        where: {
          priceId_cartId: {
            priceId: input.priceId,
            cartId: ctx.auth.userId,
          },
        },
        update: {
          quantity: {
            increment: input.quantity,
          },
          updatedAt: new Date(),
        },
        create: {
          cartId: ctx.auth.userId,
          priceId: input.priceId,
          quantity: input.quantity,
        },
      });

      return cart_item;
    }),
  deletefromCart: protectedProcedure
    .input(
      z.object({
        priceId: z.string(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const cart_item = await ctx.prisma.cartOnPrices.delete({
        where: {
          priceId_cartId: {
            priceId: input.priceId,
            cartId: ctx.auth.userId,
          },
        },
      });
      return cart_item;
    }),
  decrementItem: protectedProcedure
    .input(
      z.object({
        priceId: z.string(),
        quantity: z.number(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const cart_item = await ctx.prisma.cartOnPrices.update({
        where: {
          priceId_cartId: {
            priceId: input.priceId,
            cartId: ctx.auth.userId,
          },
        },
        data: {
          quantity: {
            decrement: input.quantity,
          },
          updatedAt: new Date(),
        },
      });
      return cart_item;
    }),
  getCart: protectedProcedure.query(async ({ input, ctx }) => {
    const cart = await ctx.prisma.cart.findUnique({
      where: {
        id: ctx.auth.userId,
      },
      include: {
        CartOnPrices: {
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
        },
      },
    });

    return cart?.CartOnPrices;
  }),
  checkout: protectedProcedure.mutation(async ({ input, ctx }) => {
    //Very expensive query
    const cartItems = await ctx.prisma.cartOnPrices.findMany({
      where: {
        cartId: ctx.auth.userId,
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
    });

    //Make Orders in Database
    await ctx.prisma.orderOnItem.createMany({
      data: cartItems.map((item) => {
        return {
          priceId: item.priceId,
          userId: ctx.auth.userId,
          quantity: item.quantity,
        };
      }),
    });

    const messageResults = await ctx.prisma.cartOnPrices.deleteMany({
      where: {
        cartId: ctx.auth.userId,
      },
    });
    return messageResults;
  }),
});
