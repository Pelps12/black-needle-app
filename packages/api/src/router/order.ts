import { clerkClient } from "@clerk/nextjs/server";
import { OrderStatus } from "@prisma/client";
import { TRPCError } from "@trpc/server";
import mixpanel from "mixpanel";
import { z } from "zod";

import { env } from "@acme/env-config/env";

import { protectedProcedure, router } from "../trpc";
import { stripe } from "../utils/stripe";

export const orderRouter = router({
  getOrders: protectedProcedure
    .input(
      z.object({
        sellerMode: z.boolean().default(false),
      }),
    )
    .query(async ({ input, ctx }) => {
      if (input.sellerMode) {
        const orders = await ctx.prisma.orderOnItem.findMany({
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
            updatedAt: "desc",
          },
        });
        return orders;
      } else {
        const orders = await ctx.prisma.orderOnItem.findMany({
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
            updatedAt: "desc",
          },
        });
        return orders;
      }
    }),
  updateOrderStatus: protectedProcedure
    .input(
      z.object({
        newStatus: z.nativeEnum(OrderStatus),
        itemId: z.string(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      {
        const order = await ctx.prisma.orderOnItem.findFirst({
          where: {
            id: input.itemId,
            price: {
              category: {
                sellerId: ctx.auth.userId,
              },
            },
          },
        });
        if (order) {
          const updatedOrder = await ctx.prisma.orderOnItem.update({
            where: {
              id: input.itemId,
            },
            data: {
              status: input.newStatus,
              updatedAt: new Date(),
            },
          });
          return updatedOrder;
        } else {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Invalid input",
          });
        }
      }
    }),

  //Real payment point
  createOrder: protectedProcedure
    .input(
      z.object({
        itemIds: z.array(z.string()),
        origin: z.string(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      //EXTERMELY EXPENSIVE QUERY. WORTH IT DUE TO TRANSACTION

      const [order, user] = await Promise.all([
        ctx.prisma.order.create({
          data: {
            userId: ctx.auth.userId,
            OrderOnItem: {
              connect: input.itemIds.map((item) => {
                return {
                  id: item,
                };
              }),
            },
          },
          include: {
            OrderOnItem: {
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
            },
          },
        }),
        clerkClient.users.getUser(ctx.auth.userId),
      ]);
      let totalAmount = 0;

      const userEmail = user.emailAddresses.find(
        (email) => email.id === user.primaryEmailAddressId,
      )?.emailAddress;

      if (order.OrderOnItem?.length > 0) {
        const session = await stripe.checkout.sessions.create({
          line_items: [
            ...order.OrderOnItem.map((item) => {
              if (item.status === "APPROVED") {
                totalAmount += item.price.amount;
                return {
                  price_data: {
                    currency: "usd",
                    product_data: {
                      name: item.price.name,
                      images: item.price.category.Image.map(
                        (image) => image.link,
                      ),
                    },
                    unit_amount: item.price.amount * 100,
                  },
                  quantity: item.quantity,
                };
              } else {
                return {};
              }
            }),
            {
              price_data: {
                currency: "usd",
                product_data: {
                  name: "Service Fee",
                },
                unit_amount:
                  totalAmount < 9 ? 135 : Math.ceil(totalAmount * 15),
              },
              quantity: 1,
            },
          ],
          ...(userEmail ? { customer_email: userEmail } : {}),
          success_url: `${env.NEXT_PUBLIC_URL}/profile`,
          cancel_url: `${input.origin}/?canceled=true`,
          custom_text: {
            submit: {
              message:
                "We have 15% service charge.\n We are working on making this reflect more clearly",
            },
          },
          mode: "payment",

          payment_intent_data: {
            transfer_group: order.id,
            metadata: {
              userId: ctx.auth.userId,
              type: "order",
              username: user.username || "Unknown user",
              lineItemSellers: JSON.stringify(
                order.OrderOnItem.map((item) => {
                  if (item.status === "APPROVED") {
                    return {
                      id: item.id,
                      sellerNumber: item.price.category.seller.phoneNumber,
                      sellerId: item.price.category.seller.id,
                      amount: item.price.amount,
                    };
                  } else {
                    return {};
                  }
                }),
              ),
              orderId: order.id,
            },
          },
        });
        if (session.payment_intent?.toString()) {
          await ctx.prisma.order.update({
            where: {
              id: order.id,
            },
            data: {
              paymentIntent: session.payment_intent.toString(),
            },
          });
        }

        return session;
      } else {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Cart is empty",
        });
      }
    }),
});
