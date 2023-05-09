import { clerkClient } from "@clerk/nextjs/server";
import { TRPCError } from "@trpc/server";
import algoliasearch from "algoliasearch";
import Stripe from "stripe";
import { z } from "zod";

import { protectedProcedure, publicProcedure, router } from "../trpc";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY ?? "", {
  apiVersion: "2022-11-15",
});

const client = algoliasearch(
  process.env.NEXT_PUBLIC_ALGOLIA_APP_ID ?? "",
  process.env.ALGOLIA_SECRET_KEY ?? "",
);
const algoliaIndex = client.initIndex(
  process.env.NEXT_PUBLIC_ALGOLIA_INDEX_NAME ?? "",
);

export const userRouter = router({
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

      const [_, deletedCategory, uploadcareResponse] = await Promise.all([
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
            Authorization: `Uploadcare.Simple ${process.env.NEXT_PUBLIC_UPLOADCARE_PUB_KEY}:${process.env.UPLOADCARE_SECRET_KEY}`,
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
          refresh_url: `${process.env.NEXT_PUBLIC_URL}/seller/register?refresh=true`,
          return_url: `${process.env.NEXT_PUBLIC_URL}/seller/register?return=true`,
          type: "account_onboarding",
        }),
      ]);
      return {
        accountLink,
      };
    }),
});
