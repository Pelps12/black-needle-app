import { TRPCError } from "@trpc/server";
import Stripe from "stripe";
import { z } from "zod";

import { env } from "@acme/env-config/env";

import { protectedProcedure, router } from "../trpc";
import { stripe } from "../utils/stripe";

export const paymentRouter = router({
  getPaymentSheet: protectedProcedure
    .input(
      z.object({
        appointmentId: z.string().cuid(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const appointment = await ctx.prisma.appointment.findFirstOrThrow({
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
                },
              },
            },
          },
          history: true,
          seller: true,
        },
      });
      const user = await ctx.prisma.user.findFirst({
        where: {
          id: ctx.auth.userId,
        },
      });
      let stripeCustomerId: string;
      if (user?.paymentId) {
        stripeCustomerId = user.paymentId;
      } else {
        const customer = await stripe.customers.create({
          ...(user?.email ? { email: user?.email } : {}),
        });
        stripeCustomerId = customer.id;
      }

      const [ephemeralKey, _] = await Promise.all([
        stripe.ephemeralKeys.create(
          { customer: stripeCustomerId },
          { apiVersion: "2022-11-15" },
        ),
        ctx.prisma.user.update({
          where: {
            id: ctx.auth.userId,
          },
          data: {
            paymentId: stripeCustomerId,
          },
        }),
      ]);
      let newTotalAmount = 0;
      const downPaid = !!appointment.history.find((history) => history.status === "DOWNPAID");
      if (downPaid) {
        newTotalAmount =
          appointment.price.amount *
          (1 - (appointment.seller?.downPaymentPercentage ?? 0)) *
          100;
      } else {
        newTotalAmount =
          appointment.price.amount *
            (appointment.seller?.downPaymentPercentage ?? 0) *
            100 +
          (appointment.price.amount < 9
            ? 135
            : Math.ceil(appointment.price.amount * 7));
      }

      const paymentIntent = await stripe.paymentIntents.create({
        amount: newTotalAmount,
        currency: "usd",
        customer: stripeCustomerId,
        transfer_group: appointment.id,
        automatic_payment_methods: {
          enabled: true,
        },
        metadata: {
          userId: ctx.auth.userId,
          type: "appointment",
          username: user?.name || "Unknown User",
          seller: JSON.stringify({
            id: appointment.id,
            sellerNumber: appointment.seller.phoneNumber,
          }),
          userAgent: JSON.stringify({}),
          isDownPayment: `${Boolean(appointment.seller.downPaymentPercentage) && downPaid}`,
        },
      });
      if (!paymentIntent.client_secret) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
        });
      }
      console.log(paymentIntent.amount);
      return {
        client_secret: paymentIntent.client_secret,
        paymentIntent,
        ephemeralKey: ephemeralKey.secret,
        customer: stripeCustomerId,
        price: paymentIntent.amount,
      };
    }),
  refreshStripe: protectedProcedure.mutation(async ({ input, ctx }) => {
    const seller = await ctx.prisma.seller.findFirst({
      where: {
        id: ctx.auth.userId,
      },
    });
    if (!seller || !seller.subAccountID) {
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: "Bruh. You aren't a seller",
      });
    }

    const accountLink = await stripe.accountLinks.create({
      account: seller.subAccountID,
      refresh_url: `${env.NEXT_PUBLIC_URL}/seller/register?refresh=true`,
      return_url: `${env.NEXT_PUBLIC_URL}/seller/register?return=true`,
      type: "account_onboarding",
    });
    return {
      accountLink,
    };
  }),
  verifyStripe: protectedProcedure.mutation(async ({ input, ctx }) => {
    const seller = await ctx.prisma.seller.findFirst({
      where: {
        id: ctx.auth.userId,
      },
    });
    if (!seller || !seller.subAccountID) {
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: "Bruh. You aren't a seller",
      });
    }

    const account = await stripe.accounts.retrieve(seller.subAccountID);

    return {
      seller,
      success: account.details_submitted,
    };
  }),
  checkStripeOnboardingCompletion: protectedProcedure.query(async ({ ctx }) => {
    const seller = await ctx.prisma.seller.findFirst({
      where: {
        id: ctx.auth.userId,
      },
    });
    if (seller?.subAccountID) {
      const account = await stripe.accounts.retrieve(seller?.subAccountID);

      const redirect_url = !account.charges_enabled
        ? (
            await stripe.accountLinks.create({
              account: seller.subAccountID,
              refresh_url: `${env.NEXT_PUBLIC_URL}/seller/register?refresh=true`,
              return_url: `${env.NEXT_PUBLIC_URL}/seller/register?return=true`,
              type: "account_onboarding",
            })
          ).url
        : `${env.NEXT_PUBLIC_URL}/seller/${ctx.auth.userId}`;

      return {
        complete: account.charges_enabled,
        redirect_url: redirect_url,
      };
    } else {
      throw new TRPCError({
        code: "BAD_REQUEST",
      });
    }
  }),
});
