import { ExpoClass, ExpoPushMessage, ExpoPushToken, expo } from '@acme/api/src/utils/expo';
import { prisma, Appointment as PrismaApointment, User, UserNotificationToken } from '@acme/db';
import { env } from '@acme/env-config';
import { twilio } from '@utils/twilio';
import { NextApiRequest, NextApiResponse } from 'next';
import { MessageInstance } from 'twilio/lib/rest/api/v2010/account/message.js';

interface NotificationsArray<T> {
	twilio: T[];
	expo: T[];
}

interface EvenOddArray<T> {
	even: T[];
	odd: T[];
}

type NotificationReqs = PrismaApointment & {
	user: User & {
		tokens: UserNotificationToken[];
	};
};

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
							in: ['APPROVED', 'DOWNPAID', 'PAID']
						}
					},
					include: {
						user: {
							include: {
								tokens: true
							}
						}
					}
				});

				//Create a message promise for appointment who's user hasd a phone number
				//(Not a scalable thing to do to be fair)
				console.log(appointments);
				if (appointments.length > 0) {
					const [twilioApts, expoApts] = // Use "deconstruction" style assignment
						appointments.reduce<[NotificationReqs[], NotificationReqs[]]>(
							(result, element) => {
								result[element.user.tokens.length === 0 ? 0 : 1].push(element); // Determine and push to small/large arr
								return result;
							},
							[[], []]
						);

					const messageCalls: Promise<MessageInstance>[] = twilioApts
						.filter((appointment) => appointment.user.phoneNumber !== null)
						.map((appointment) => {
							return twilio.messages.create({
								body: `You have an appointment in under 1 hour`,
								to: `+1${appointment.user.phoneNumber}`,
								messagingServiceSid: env.MESSAGING_SID
							});
						});

					const expoTokens: ExpoPushToken[] = expoApts.flatMap((receiver) =>
						receiver.user.tokens
							.map((token) => token.token as ExpoPushToken)
							.filter((token) => ExpoClass.isExpoPushToken(token))
					);

					if (expoTokens.length > 0) {
						const expoPackets: ExpoPushMessage[] = expoApts.map((appointments) => ({
							to: expoTokens,
							title: appointments.user.name || 'Unknown User',
							body: `You have an appointment in under 1 hour`,
							sound: 'default',
							data: {
								senderId: appointments.userId
							}
						}));
						const ticket = await expo.sendPushNotificationsAsync(expoPackets);
						console.log(ticket);
						await Promise.all(messageCalls);

						res.status(200).json({ message: 'Messages sent' });
					} else {
						res.status(200).json({ message: 'no appointments' });
					}
				} else {
					res.status(401).json({ success: false });
				}
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
