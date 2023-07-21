import { prisma } from '@acme/db';
import { env } from '@acme/env-config';
import Mixpanel from 'mixpanel';
import { NextApiRequest, NextApiResponse } from 'next/types';
import { randomUUID } from 'node:crypto';
import { buffer } from 'node:stream/consumers';
import Stripe from 'stripe';

const stripe = new Stripe(env.STRIPE_SECRET_KEY, {
	apiVersion: '2022-11-15'
});
const mixpanel = Mixpanel.init(env.NEXT_PUBLIC_MIXPANEL_TOKEN);

export const config = {
	api: {
		bodyParser: false
	}
};

type AccountCreateMetadata = {
	userId: string;
	userAgent: string;
	ip: string;
};

type UserAgent = {
	os: string;
	browser: string;
	browser_version: string;
};

export default async (req: NextApiRequest, res: NextApiResponse) => {
	if (req.method === 'POST') {
		const sig = req.headers['stripe-signature'];
		const buf = await buffer(req);
		const sigString: string = typeof sig === 'string' ? sig : sig == undefined ? ':)' : sig[0]!;

		let event: Stripe.Event;
		console.log(env.WEBHOOK_CONNECT_SECRET, sigString);

		try {
			event = stripe.webhooks.constructEvent(buf, sigString, env.WEBHOOK_CONNECT_SECRET);
		} catch (err: any) {
			res.status(400).send(`Webhook Error: ${err.message}`);
			return;
		}

		try {
			switch (event.type) {
				case 'account.updated':
					const account: any = event.data.object;
					const metadata: AccountCreateMetadata = account.metadata;
					const userAgent: UserAgent = JSON.parse(metadata.userAgent);
					if (account.details_submitted) {
						const user = await prisma.user.update({
							where: {
								id: metadata.userId
							},
							data: {
								role: 'SELLER'
							}
						});
						if (user) {
							mixpanel.people.set(user.id, {
								role: 'SELLER'
							});

							mixpanel.track('Seller Created', {
								distinct_id: user.id || randomUUID(),
								$insert_id: randomUUID(),
								ip: metadata.ip,
								$os: userAgent.os,
								$browser: userAgent.browser,
								$browser_version: userAgent.browser_version
							});
						}
					}
					res.status(200).json({ received: true });
			}
		} catch (err: any) {
			if (err instanceof Stripe.errors.StripeError) {
				res.status(err.statusCode || 500).json(err.message);
			} else {
				res.status(500);
			}
		}
	} else {
		res.status(405).json({
			message: 'Only POST requests allowed'
		});
	}
};
