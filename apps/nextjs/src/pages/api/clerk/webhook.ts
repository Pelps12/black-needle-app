import { buffer } from 'micro';
import { type NextApiRequest, type NextApiResponse } from 'next';
import { Webhook } from 'svix';
import type {} from '@clerk/types';
import { prisma } from '@acme/db';
import { env } from '@acme/env-config';

export const config = {
	api: {
		bodyParser: false
	}
};

const getName: any = (data: any) => {
	if (data.first_name || data.last_name) {
		const first_name = data.first_name;
		if (data.last_name) {
			return first_name + ' ' + data.last_name;
		} else {
			return first_name;
		}
	} else {
		return data.email_addresses[0].email_address;
	}
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
	const payload = (await buffer(req)).toString();
	const headers = req.headers as Record<string, string>;

	try {
		const wh = new Webhook(env.CLERK_SIGNING_SECRET);
		let msg;
		msg = wh.verify(payload, headers) as any;
		//console.log(util.inspect(msg, false, null, true /* enable colors */));
		console.log(msg.data.id);
		switch (msg.type) {
			case 'user.created':
				await prisma.$transaction([
					prisma.user.upsert({
						where: {
							email: msg.data.email_addresses[0].email_address
						},
						update: {
							id: msg.data.id,
							name: getName(msg.data),
							image: msg.data.profile_image_url,
							role: 'BUYER',
							email: msg.data.email_addresses[0].email_address
						},
						create: {
							id: msg.data.id,
							name: getName(msg.data),
							image: msg.data.profile_image_url,
							role: 'BUYER',
							email: msg.data.email_addresses[0].email_address
						}
					}),
					prisma.cart.upsert({
						where: {
							id: msg.data.id
						},
						update: {},
						create: {
							id: msg.data.id
						}
					})
				]);

				break;

			case 'user.updated':
				await prisma.user.update({
					where: {
						id: msg.data.id
					},
					data: {
						name: msg.data.username ?? msg.data.email_addresses[0].email_address,
						image: msg.data.profile_image_url,
						email: msg.data.email_addresses[0].email_address,
						role: msg.data.public_metadata.role ?? 'BUYER'
					}
				});

				break;

			case 'user.deleted':
				await prisma.user.update({
					where: {
						id: msg.data.id
					},
					data: {
						name: null,
						image: null,
						phoneNumber: null,
						phoneVerified: null,
						email: null
					}
				});

				break;
		}
	} catch (err: any) {
		return res.status(400).json({ msg: err.message });
	}

	// Do something with the message...

	return res.status(200).json({});
}
