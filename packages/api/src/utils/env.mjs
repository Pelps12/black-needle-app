import { createEnv } from "@t3-oss/env-core";
import { z } from "zod";

export const env = createEnv({
  clientPrefix: "NEXT_PUBLIC_",
  server: {
    DATABASE_URL: z.string().url(),
    NEXTAUTH_SECRET: z.string(),
    NEXTAUTH_URL: z.string().url(),
    DISCORD_CLIENT_ID: z.string(),
    DISCORD_CLIENT_SECRET: z.string(),
    GOOGLE_CLIENT_ID: z.string(),
    GOOGLE_CLIENT_SECRET: z.string(),
    ABLY_API_KEY: z.string(),
    TWITTER_CLIENT_ID: z.string(),
    TWITTER_CLIENT_SECRET: z.string(),
    UPLOADCARE_SECRET_KEY: z.string(),
    ES_CERTIFICATE: z.string(),
    ES_API_KEY: z.string(),
    STRIPE_SECRET_KEY: z.string(),
    WEBHOOK_SECRET: z.string(),
    WEBHOOK_CONNECT_SECRET: z.string(),
    TWILIO_SID: z.string(),
    AUTH_TOKEN: z.string(),
    TWILIO_NUMBER: z.string(),
    MESSAGING_SID: z.string(),
    EMAIL_SERVER_PASSWORD: z.string(),
    EMAIL_FROM: z.string(),
    EMAIL_SERVER_USER: z.string(),
    EMAIL_SERVER_PORT: z.string(),
    EMAIL_SERVER_HOST: z.string(),
    PUSHER_SECRET: z.string(),
    TEST_ACCESS_PASSWORD: z.string(),
    CRON_TOKEN: z.string(),
    CLOUDFLARE_ACCESS_KEY: z.string(),
    CLOUDFLARE_ACCESS_SECRET: z.string(),
    CLOUDFLARE_ACCOUNT_ID: z.string(),
    CLERK_SECRET_KEY: z.string(),
    EXPO_ACCESS_TOKEN: z.string(),
    ABLY_HASH: z.string(),
    ALGOLIA_SECRET_KEY: z.string(),
  },
  client: {
    NEXT_PUBLIC_URL: z.string(),
    NEXT_PUBLIC_UPLOADCARE_PUB_KEY: z.string(),
    NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: z.string(),
    NEXT_PUBLIC_PUSHER_APP_ID: z.string(),
    NEXT_PUBLIC_PUSHER_KEY: z.string(),
    NEXT_PUBLIC_PUSHER_CLUSTER: z.string(),
    NEXT_PUBLIC_MIXPANEL_TOKEN: z.string(),
    NEXT_PUBLIC_IN_DEV: z.string(),
    NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: z.string(),
    NEXT_PUBLIC_ALGOLIA_APP_ID: z.string(),
    NEXT_PUBLIC_ALGOLIA_API_KEY: z.string(),
    NEXT_PUBLIC_ALGOLIA_INDEX_NAME: z.string(),
  },
  /**
   * What object holds the environment variables at runtime.
   * Often `process.env` or `import.meta.env`
   */
  runtimeEnv: process.env,
});
