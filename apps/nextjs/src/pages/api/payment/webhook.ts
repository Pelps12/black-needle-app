import { prisma } from '@acme/db';
import { env } from '@acme/env-config/env';
import { Appointment, Order } from '@prisma/client';
import Mixpanel from 'mixpanel';
import { NextApiRequest, NextApiResponse } from 'next/types';
import { randomUUID } from 'node:crypto';
import { buffer } from 'node:stream/consumers';
import Stripe from 'stripe';
import Twilio from 'twilio';
import { MessageInstance } from 'twilio/lib/rest/api/v2010/account/message.js';

const stripe = new Stripe(env.STRIPE_SECRET_KEY, {
	apiVersion: '2022-11-15'
});

const twilio = Twilio(env.TWILIO_SID, env.AUTH_TOKEN);

const mixpanel = Mixpanel.init(env.NEXT_PUBLIC_MIXPANEL_TOKEN);

export const config = {
	api: {
		bodyParser: false
	}
};

type AccountCreateMetadata = {
	userId: string;
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
		console.log(env.WEBHOOK_SECRET, sigString);

		try {
			event = stripe.webhooks.constructEvent(buf, sigString, env.WEBHOOK_SECRET);
		} catch (err: any) {
			res.status(400).send(`Webhook Error: ${err.message}`);
			return;
		}

		try {
			switch (event.type) {
				case 'payment_intent.succeeded':
					const paymentIntent = event.data.object as any;
					const type: string = paymentIntent.metadata.type;
					const orderId: string = paymentIntent.metadata.orderId;
					const username: string = paymentIntent.metadata.username;
					const userId: string = paymentIntent.metadata.userId;
					const ip: string = paymentIntent.metadata.ip;
					const sellerId: string | undefined = paymentIntent.metadata.sellerId;

					const userAgent: UserAgent = JSON.parse(paymentIntent.metadata.userAgent);
					const itemData: {
						id: string | undefined;
						sellerNumber: string | undefined;
						sellerId: string;
						amount: number;
					}[] =
						type === 'order'
							? JSON.parse(paymentIntent.metadata.lineItemSellers)
							: [JSON.parse(paymentIntent.metadata.seller)];

					console.log(itemData);
					if (type === 'order') {
						const order = await prisma.order.update({
							where: {
								id: orderId
							},
							data: {
								paymentIntent: paymentIntent.id,
								OrderOnItem: {
									updateMany: {
										where: {
											status: 'APPROVED'
										},
										data: {
											status: 'PAID',
											updatedAt: new Date()
										}
									}
								}
							},
							include: {
								OrderOnItem: {
									include: {
										price: {
											include: {
												category: {
													include: {
														seller: true
													}
												}
											}
										}
									}
								}
							}
						});
						const uniqueSellers: {
							id: string;
							sellerNumber: string;
							sellerId: string;
							amount: number;
						}[] = Array.from(new Set(itemData.map((object) => JSON.stringify(object)))).map(
							(string) => JSON.parse(string)
						);
						//const uniqueSellers = Array.from(new Set(itemData.map((item) => item.sellerNumber)));
						const messageCalls: Promise<MessageInstance>[] = [];
						const stripeTransferCalls: Promise<Stripe.Response<Stripe.Transfer>>[] = [];

						const mixpanelEvent: {
							event: string;
							properties: {
								distinct_id: string;
								$insert_id: string;
								seller_id: string;
								quantity: number;
								ip: string;
								$browser: string;
								$browser_version: string;
								price: number;
								order_group_id: string;
								$os: string;
							};
						}[] = [];

						uniqueSellers.map(async (seller) => {
							messageCalls.push(
								twilio.messages.create({
									body: `${username} has paid`,
									to: `+1${seller.sellerNumber}`,
									messagingServiceSid: env.MESSAGING_SID
								})
							);

							mixpanelEvent.push({
								event: 'Item Purchased',
								properties: {
									distinct_id: userId,
									$insert_id: randomUUID(),
									seller_id: seller.id,
									quantity: seller.amount,
									ip: ip,
									$browser: userAgent.browser,
									$browser_version: userAgent.browser_version,
									price: seller.amount,
									order_group_id: orderId,
									$os: userAgent.os
								}
							});
						});

						order.OrderOnItem.map((item) => {
							stripeTransferCalls.push(
								stripe.transfers.create({
									amount: Math.round(
										uniqueSellers.find((seller) => seller.sellerId === item.price.category.sellerId)
											?.amount || 0
									),
									currency: 'usd',
									destination: item.price.category.seller.subAccountID || ':)',
									transfer_group: order.id
								})
							);
						});

						mixpanel.track_batch(mixpanelEvent);

						await Promise.all([...messageCalls]);
					} else {
						const downPayment: string | undefined = paymentIntent.metadata.isDownPayment;
						const appointment = await prisma.appointment.update({
							where: {
								id: paymentIntent.transfer_group
							},
							data: {
								paymentIntent: paymentIntent.id,
								status: downPayment === 'true' ? 'DOWNPAID' : 'PAID',
								updatedAt: new Date(),
								history: {
									create: {
										status: downPayment === 'true' ? 'DOWNPAID' : 'PAID'
									}
								}
							},
							include: {
								price: true,
								seller: true
							}
						});
						mixpanel.track('Appointment Made', {
							distinct_id: userId || randomUUID(),
							$insert_id: randomUUID(),
							ip: ip,
							$os: userAgent.os,
							$browser: userAgent.browser,
							$browser_version: userAgent.browser_version,
							price: appointment.price.amount,
							seller_id: sellerId
						});
						twilio.messages.create({
							body: `${username} has paid`,
							to: `$1${itemData[0]?.sellerNumber}`,
							messagingServiceSid: env.MESSAGING_SID
						});

						const [transfer] = await Promise.all([
							stripe.transfers.create({
								amount:
									downPayment === 'false' //If it is not a down payment
										? appointment.seller.downPaymentPercentage //If it is remaining amount of down payment
											? (1 - appointment.seller.downPaymentPercentage) *
											  appointment.price.amount *
											  100
											: appointment.price.amount * 100
										: (appointment.seller.downPaymentPercentage ?? 1) *
										  appointment.price.amount *
										  100,
								currency: 'usd',
								destination: appointment.seller.subAccountID || ':)',
								transfer_group: appointment.id
							})
						]);

						if (downPayment === 'false' && appointment.seller.subAccountID) {
							await stripe.payouts.create(
								{
									amount: appointment.price.amount * 100,
									currency: 'usd'
								},
								{
									stripeAccount: appointment.seller.subAccountID
								}
							);
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
