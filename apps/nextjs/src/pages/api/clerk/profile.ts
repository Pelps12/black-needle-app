import { clerkClient } from '@clerk/nextjs/server';
import { NextApiHandler } from 'next';

const profileHandler: NextApiHandler = (req, res) => {
	const file = req.body;

	clerkClient.users.updateUser;
};
