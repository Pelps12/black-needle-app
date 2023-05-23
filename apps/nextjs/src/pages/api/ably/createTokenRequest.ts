import { env } from '@acme/env-config/env';
import { getAuth } from '@clerk/nextjs/server';
import Ably from 'ably/promises';
import { type NextApiRequest, type NextApiResponse } from 'next';

export default async function ably(req: NextApiRequest, res: NextApiResponse) {
	if (req.method === 'GET') {
		console.log('HELLO IN NEXTJS FOR ABLY');
		const { userId } = getAuth(req);
		console.log('Maybe authorized');

		if (userId) {
			console.log(userId);

			const client = new Ably.Realtime({ key: env.ABLY_API_KEY });
			console.log('Definetely Authorized');

			const permissions: any = {
				'chat:*': ['publish'],
				'getting-started': ['publish', 'subscribe']
			};
			permissions[`chat:${userId}`] = ['*'];
			const tokenRequestData = await client.auth.createTokenRequest({
				clientId: userId,
				capability: permissions
			});
			client.close();
			res.status(200).json(tokenRequestData);
		} else {
			res.send(401);
		}
	} else {
		res.send(405);
	}
}
