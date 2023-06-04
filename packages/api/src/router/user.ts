import { clerkClient } from "@clerk/nextjs/server";
import { TRPCError } from "@trpc/server";
import algoliasearch from "algoliasearch";
import Stripe from "stripe";
import { z } from "zod";

import { env } from "@acme/env-config";

import { protectedProcedure, publicProcedure, router } from "../trpc";
import { algoliaIndex } from "../utils/algolia";
import { stripe } from "../utils/stripe";

export const userRouter = router({
  updateUser: protectedProcedure
    .input(
      z.object({
        username: z.string(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      clerkClient.users.updateUser(ctx.auth.userId, {
        username: input.username,
      });
    }),
  createCategory: protectedProcedure
    .input(
      z.object({
        name: z.string(),
        images: z.string().array(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const { publicMetadata } = await clerkClient.users.getUser(
        ctx.auth.userId,
      );
      if (publicMetadata.role !== "SELLER") {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Register as a seller",
        });
      }
      console.log(
        input.images.map((img) => {
          return {
            link: img,
          };
        }),
      );

      const category = await ctx.prisma.category.create({
        data: {
          name: input.name,
          sellerId: ctx.auth.userId,
          Image: {
            createMany: {
              data: input.images.map((img) => {
                return {
                  link: img,
                };
              }),
            },
          },
        },
        include: {
          Image: true,
        },
      });

      const { objectID } = await algoliaIndex.saveObject({
        objectID: category.id,
        name: category.name,
        sellerId: ctx.auth.userId,
        type: category.type,
        prices: [],
        Image: category.Image,
      });

      return category;
    }),
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
  updateCategory: protectedProcedure
    .input(
      z.object({
        categoryId: z.string(),
        name: z.string(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const galleryOwnerId = await ctx.prisma.category.findFirst({
        where: {
          id: input.categoryId,
        },
        select: {
          sellerId: true,
        },
      });

      if (galleryOwnerId) {
        if (ctx.auth.userId === galleryOwnerId.sellerId) {
          const category = await ctx.prisma.category.update({
            where: {
              id: input.categoryId,
            },
            data: {
              name: input.name,
            },
            include: {
              Image: true,
              prices: true,
            },
          });

          algoliaIndex.partialUpdateObject({
            objectID: category.id,
            name: category.name,
            sellerId: ctx.auth.userId,
            type: category.type,
            prices: category.prices,
            Image: category.Image,
          });
          // await esClient.update({
          // 	index: 'categories',
          // 	id: category.id,
          // 	doc: {
          // 		name: category.name,
          // 		'seller-id': ctx.session.user.id,
          // 		type: category.type
          // 	},
          // 	doc_as_upsert: true
          // });
        }
      }
    }),
  updateImage: protectedProcedure
    .input(
      z.array(
        z.object({
          imageId: z.string(),
          link: z.string(),
        }),
      ),
    )
    .mutation(async ({ input, ctx }) => {
      const images = await ctx.prisma.image.findMany({
        where: {
          id: {
            in: input.map((input) => input.imageId),
          },
        },
        include: {
          category: true,
        },
      });
      console.log(images);
      images.forEach((image) => {
        if (image.category?.sellerId !== ctx.auth.userId) {
          throw new TRPCError({
            message: "Not authorized",
            code: "UNAUTHORIZED",
          });
        }
      });
      const result = await fetch("https://api.uploadcare.com/files/storage/", {
        method: "DELETE",
        body: JSON.stringify(images.map((input) => input.link.split("/")[3])),
        headers: {
          "Content-Type": "application/json",
          Authorization: `Uploadcare.Simple ${env.NEXT_PUBLIC_UPLOADCARE_PUB_KEY}:${env.UPLOADCARE_SECRET_KEY}`,
          Accept: "application/vnd.uploadcare-v0.7+json",
        },
      });
      console.log(images.map((input) => input.link.split("/")[3]));

      if (!result.ok) {
        console.log(await result.json());
      } else {
        console.log(await result.json());
      }

      await Promise.all(
        input.map((input) => {
          return ctx.prisma.image.update({
            where: {
              id: input.imageId,
            },
            data: {
              link: input.link,
            },
          });
        }),
      );
    }),
  deleteCategory: protectedProcedure
    .input(
      z.object({
        id: z.string(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const { publicMetadata } = await clerkClient.users.getUser(
        ctx.auth.userId,
      );

      //Make sure the category belongs to the user
      const category = await ctx.prisma.category.findFirstOrThrow({
        where: {
          id: input.id,
          sellerId: ctx.auth.userId,
        },
        include: {
          Image: true,
        },
      });

      const [_, deletedCategory] = await Promise.all([
        algoliaIndex.deleteObject(input.id),
        ctx.prisma.category.delete({
          where: {
            id: input.id,
          },
        }),
        fetch("https://api.uploadcare.com/files/storage/", {
          method: "DELETE",
          body: JSON.stringify(
            category.Image.map((image) => image.link.split("/")[3]),
          ),
          headers: {
            "Content-Type": "application/json",
            Authorization: `Uploadcare.Simple ${env.NEXT_PUBLIC_UPLOADCARE_PUB_KEY}:${env.UPLOADCARE_SECRET_KEY}`,
            Accept: "application/vnd.uploadcare-v0.7+json",
          },
        }),
      ]);

      return deletedCategory;
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

  createSeller: protectedProcedure
    .input(
      z.object({
        phone_number: z.string(),
        school: z.string(),
        services: z.array(z.string()),
        description: z.string().optional(),
        downPaymentPercentage: z.number().optional(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const _ = input.services.map((service) => {
        console.log(service);
        return {
          sellerId: ctx.auth.userId,
          serviceName: service,
        };
      });
      console.log(_);
      const seller = await ctx.prisma.seller.findFirst({
        where: {
          id: ctx.auth.userId,
        },
      });
      let accountId: string;
      if (seller?.subAccountID) {
        accountId = seller.subAccountID;
      } else {
        //Create a stripe account
        const account = await stripe.accounts.create({
          country: "US",
          type: "express",
          ...(ctx.auth.user?.emailAddresses
            ? { email: ctx.auth.user?.emailAddresses[0]?.emailAddress }
            : {}),
          business_type: "individual",
          individual: {
            ...(ctx.auth.user?.emailAddresses
              ? { email: ctx.auth.user?.emailAddresses[0]?.emailAddress }
              : {}),
          },
          settings: {
            payouts: {
              schedule: {
                interval: "manual",
              },
            },
          },
          metadata: {
            userId: ctx.auth.userId,
          },
        });
        accountId = account.id;
        await ctx.prisma.seller.create({
          data: {
            id: ctx.auth.userId,
            phoneNumber: "cc",
            school: input.school,
            services: {
              create: input.services.map((service) => {
                console.log(service);
                return {
                  serviceName: service,
                };
              }),
            },
            downPaymentPercentage: input.downPaymentPercentage
              ? input.downPaymentPercentage / 100.0
              : undefined,
            subAccountID: account.id,
          },
        });
      }

      //Set users role to seller and create onboarding link for stripe account
      const [accountLink] = await Promise.all([
        stripe.accountLinks.create({
          account: accountId,
          refresh_url: `${env.NEXT_PUBLIC_URL}/seller/register?refresh=true`,
          return_url: `${env.NEXT_PUBLIC_URL}/seller/register?return=true`,
          type: "account_onboarding",
        }),
      ]);
      return {
        accountLink,
      };
    }),
  createStripeAccountLink: protectedProcedure.mutation(async ({ ctx }) => {
    const { publicMetadata } = await clerkClient.users.getUser(ctx.auth.userId);
    if (publicMetadata.role !== "SELLER") {
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: "You are not a seller",
      });
    }
    const seller = await ctx.prisma.seller.findFirst({
      where: {
        id: ctx.auth.userId,
      },
    });
    if (seller?.subAccountID) {
      const accountLink = await stripe.accounts.createLoginLink(
        seller.subAccountID,
      );
      return accountLink;
    } else {
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: "You have not finished the Stripe onboarding",
      });
    }
  }),
});
