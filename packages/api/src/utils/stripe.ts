import Stripe from "stripe";

import { env } from "@acme/env-config/env";

export const stripe = new Stripe(env.STRIPE_SECRET_KEY, {
  apiVersion: "2022-11-15",
});
