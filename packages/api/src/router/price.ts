import { randomUUID } from "crypto";
import { TRPCError } from "@trpc/server";
import algoliasearch from "algoliasearch";
import { z } from "zod";

import { protectedProcedure, publicProcedure, router } from "../trpc";

const client = algoliasearch(
  process.env.NEXT_PUBLIC_ALGOLIA_APP_ID ?? "",
  process.env.ALGOLIA_SECRET_KEY ?? "",
);

export const priceRouter = router({
  createPrice: protectedProcedure
    .input(
      z.object({
        categoryId: z.string(),
        amount: z.number(),
        name: z.string(),
        type: z.enum(["GOOD", "SERVICE"]),
        duration: z.number().optional(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const category = await ctx.prisma.category.findFirst({
        where: {
          id: input.categoryId,
        },
        include: {
          seller: true,
          Image: true,
          prices: true,
        },
      });
      if (!category) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Category doesn't exist",
        });
      }

      if (category.seller && category.sellerId === ctx.auth.userId) {
        const price = await ctx.prisma.price.create({
          data: {
            name: input.name,
            amount: input.amount,
            categoryId: input.categoryId,
            type: input.type,
            duration: input.duration,
          },
        });

        const newPrices = [...category.prices, price];

        const algoliaIndex = client.initIndex(
          process.env.NEXT_PUBLIC_ALGOLIA_INDEX_NAME ?? "",
        );

        algoliaIndex.partialUpdateObject({
          prices: newPrices,
          objectID: category.id,
        });

        return {
          price,
        };
      } else {
        throw new TRPCError({
          code: "UNAUTHORIZED",
        });
      }
    }),

  //Please do this
  updatePrice: protectedProcedure
    .input(
      z.object({
        priceId: z.string(),
        amount: z.number().optional(),
        name: z.string().optional(),
        categoryId: z.string().optional(),
        type: z.enum(["GOOD", "SERVICE"]).optional(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const price = await ctx.prisma.price.findFirst({
        where: {
          id: input.priceId,
        },
        include: {
          category: true,
        },
      });
      if (!price) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Category doesn't exist",
        });
      }

      if (price.category.sellerId === ctx.auth.userId) {
        const updatedPrice = await ctx.prisma.price.update({
          where: {
            id: input.priceId,
          },
          data: {
            name: input.name,
            amount: input.amount,
            categoryId: input.categoryId || price.categoryId,
            type: input.type,
          },
          include: {
            category: {
              include: {
                Image: true,
                seller: true,
                prices: true,
              },
            },
          },
        });

        /* client.update({
					index: 'products',
					id: price.id,
					doc: {
						name: updatedPrice.name,
						'seller-id': updatedPrice.category.sellerId,
						amount: updatedPrice.amount,
						'category-name': updatedPrice.category.name,
						'category-id': updatedPrice.category.id,
						school: updatedPrice.category.seller.school,
						'seller-icon': ctx.session.user.image,
						image: updatedPrice.category.Image[0]?.link || ':)' //Gets random image from sellers category
					}
				}); */

        return {
          updatedPrice,
        };
      } else {
        throw new TRPCError({
          code: "UNAUTHORIZED",
        });
      }
    }),
  deletePrice: protectedProcedure
    .input(
      z.object({
        priceId: z.string(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const price = await ctx.prisma.price.findFirst({
        where: {
          id: input.priceId,
        },
        include: {
          category: true,
        },
      });
      if (!price) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Category doesn't exist",
        });
      }

      if (price.category.sellerId === ctx.auth.userId) {
        const deletedPrice = await ctx.prisma.price.delete({
          where: {
            id: input.priceId,
          },
        });
        /* 
				client.delete({
					index: 'products',
					id: deletedPrice.id
				}); */
        return {
          deletedPrice,
        };
      } else {
        throw new TRPCError({
          code: "UNAUTHORIZED",
        });
      }
    }),
});
