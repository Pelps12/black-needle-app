import { expo } from '@acme/api/src/utils/expo';
import { prisma } from '@acme/db';
import { env } from '@acme/env-config/env';
import { twilio } from '@utils/twilio';
import Ably from 'ably/promises';
import * as argon2 from 'argon2';
import { Expo, type ExpoPushToken } from 'expo-server-sdk';
import { NextApiRequest, NextApiResponse } from 'next';

export default async function ably(req: NextApiRequest, res: NextApiResponse) {
	if (req.method === 'POST') {
		if (req.headers.hash) {
			const match = await argon2.verify(
				req.headers.hash as string,
				'vQlj0R2EaePBJekZitfvfpsUV+C4pOj7FfjJvQRmSyc'
			);
			if (match) {
				const { messages, channel } = req.body;
				const receiver = channel.split(':')[1];
				const data = messages[0];
				if (data) {
					console.log(data);
					const { roomId, message: text } = JSON.parse(data.data);
					console.log(roomId, text);

					const participants = await prisma.participant.findMany({
						where: {
							roomId: roomId
						},
						include: {
							user: {
								include: {
									tokens: true
								}
							}
						}
					});
					if (participants.length > 0) {
						await prisma.message.create({
							data: {
								sendAt: new Date(data.timestamp),
								message: text,
								room: {
									connect: {
										id: roomId
									}
								},
								type: data.extras?.headers?.type ?? 'TEXT',
								user: {
									connect: {
										id: data.clientId
									}
								}
							}
						});

						const receiver = participants.find(
							(participant) => participant.userId !== data.clientId
						);
						const initiator = participants.find(
							(participant) => participant.userId === data.clientId
						);

						if (receiver && initiator) {
							const expoTokens: ExpoPushToken[] = receiver.user.tokens
								.map((token) => token.token as ExpoPushToken)
								.filter((token) => Expo.isExpoPushToken(token));

							if (expoTokens.length > 0) {
								const ticket = await expo.sendPushNotificationsAsync([
									{
										to: expoTokens,
										title: initiator.user.name || 'Unknown User',
										body: text,
										sound: 'default',
										data: {
											senderId: initiator.userId
										}
									}
								]);
								console.log(ticket);
							} else {
								twilio.messages.create({
									body: `${initiator.user.name ?? 'Someone'} said\n\"${text}\"\nGo to ${
										env.NEXT_PUBLIC_URL
									}/chat to respond`,
									to: `+1${receiver.user.phoneNumber}`,
									messagingServiceSid: env.MESSAGING_SID
								});
							}
						}
						res.send(200);
					} else {
						res.send(401);
					}
				}
			} else {
				res.send(401);
			}
		} else {
			res.send(401);
		}
	} else {
		res.send(405);
	}
}
