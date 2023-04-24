// @ts-check
import { env } from 'process';
import { z } from 'zod';

/**
 * Specify your server-side environment variables schema here.
 * This way you can ensure the app isn't built with invalid env vars.
 */
export const serverSchema = z.object({
	DATABASE_URL: z.string().url(),
	NODE_ENV: z.enum(['development', 'test', 'production']),
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
	CLOUDFLARE_ACCOUNT_ID: z.string()
});

/**
 * Specify your client-side environment variables schema here.
 * This way you can ensure the app isn't built with invalid env vars.
 * To expose them to the client, prefix them with `NEXT_PUBLIC_`.
 */
export const clientSchema = z.object({
	// NEXT_PUBLIC_BAR: z.string(),
	NEXT_PUBLIC_URL: z.string(),
	NEXT_PUBLIC_UPLOADCARE_PUB_KEY: z.string(),
	NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: z.string(),
	NEXT_PUBLIC_PUSHER_APP_ID: z.string(),
	NEXT_PUBLIC_PUSHER_KEY: z.string(),
	NEXT_PUBLIC_PUSHER_CLUSTER: z.string(),
	NEXT_PUBLIC_MIXPANEL_TOKEN: z.string(),
	NEXT_PUBLIC_IN_DEV: z.string()
});

/**
 * You can't destruct `process.env` as a regular object, so you have to do
 * it manually here. This is because Next.js evaluates this at build time,
 * and only used environment variables are included in the build.
 * @type {{ [k in keyof z.infer<typeof clientSchema>]: z.infer<typeof clientSchema>[k] | undefined }}
 */
export const clientEnv = {
	// NEXT_PUBLIC_BAR: process.env.NEXT_PUBLIC_BAR,
	NEXT_PUBLIC_URL: process.env.NEXT_PUBLIC_URL,
	NEXT_PUBLIC_UPLOADCARE_PUB_KEY: process.env.NEXT_PUBLIC_UPLOADCARE_PUB_KEY,
	NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
	NEXT_PUBLIC_PUSHER_APP_ID: process.env.NEXT_PUBLIC_PUSHER_APP_ID,
	NEXT_PUBLIC_PUSHER_KEY: process.env.NEXT_PUBLIC_PUSHER_KEY,
	NEXT_PUBLIC_PUSHER_CLUSTER: process.env.NEXT_PUBLIC_PUSHER_CLUSTER,
	NEXT_PUBLIC_MIXPANEL_TOKEN: process.env.NEXT_PUBLIC_MIXPANEL_TOKEN,
	NEXT_PUBLIC_IN_DEV: process.env.NEXT_PUBLIC_IN_DEV
};
