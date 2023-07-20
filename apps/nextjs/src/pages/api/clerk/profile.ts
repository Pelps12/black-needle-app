import { clerkClient, getAuth } from '@clerk/nextjs/server';
import { NextApiHandler } from 'next';

const profileHandler: NextApiHandler = (req, res) => {
	const data = req.body;
	if (req.method !== 'POST') {
		return res.status(405).json({});
	}
	const { userId } = getAuth(req);
	console.log(userId, data?.file);
	return res.status(200).json({});
};

export default profileHandler;
