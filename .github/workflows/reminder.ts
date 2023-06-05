// Example of a restricted endpoint that only authenticated users can access from https://next-auth.js.org/getting-started/example

import { NextApiRequest, NextApiResponse } from 'next';
import * as argon2 from 'argon2';
import { env } from 'env/server.mjs';
import { prisma } from '../../server/db/client';
import { MessageInstance } from 'twilio/lib/rest/api/v2010/account/message.js';
import { twilio } from '@utils/twilio';

const reminder = async (req: NextApiRequest, res: NextApiResponse) => {
	if (req.method === 'POST') {
		try {
			const { authorization } = req.headers;

			if (authorization === `Bearer ${env.CRON_TOKEN}`) {
				//One hour after now
				const date = new Date();
				date.setHours(date.getHours() + 1);
				const prevTime = new Date();

				//Get appointments in an hour or less
				const appointments = await prisma.appointment.findMany({
					where: {
						appointmentDate: {
							lte: date,
							gt: prevTime
						},
						status: {
							in: ['APPROVED', 'DOWNPAID']
						}
					},
					include: {
						user: true
					}
				});

				//Create a message promise for appointment who's user hasd a phone number
				//(Not a scalable thing to do to be fair)
				console.log(appointments);
				if (appointments.length > 0) {
					const messageCalls: Promise<MessageInstance>[] = appointments
						.filter((appointment) => appointment.user.phoneNumber !== null)
						.map((appointment) => {
							return twilio.messages.create({
								body: `You have an appointment in under 1 hour`,
								to: `+1${appointment.user.phoneNumber}`,
								messagingServiceSid: env.MESSAGING_SID
							});
						});
					await Promise.all(messageCalls);

					res.status(200).json({ message: 'Messages sent' });
				} else {
					res.status(200).json({ message: 'no appointments' });
				}
			} else {
				res.status(401).json({ success: false });
			}
		} catch (err: any) {
			res.status(500).json({ statusCode: 500, message: err.message });
		}
	} else {
		res.setHeader('Allow', 'POST');
		res.status(405).end('Method Not Allowed');
	}
};

export default reminder;
