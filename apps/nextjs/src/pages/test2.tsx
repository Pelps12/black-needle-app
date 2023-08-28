import { useLoginStore } from '../utils/loginModalStore';
import { trpc } from '../utils/trpc';
import { useAuth } from '@clerk/nextjs';
import React, { useEffect, useState } from 'react';

const Test2 = () => {
	const { userId, isSignedIn } = useAuth();

	const trpcEndpt = trpc.appointment.getFreeTimeslots.useQuery({
		sellerId: 'user_2SlAlmInXxOM3ZqGnnnpY3M5AwD',
		day: 'SATURDAY',
		date: new Date('2023-08-26T05:00:00.000Z'),
		priceId: 'cle8zq63e0005l90fw8n0lwoy'
	});
	// useEffect(() => {
	// 	if (isSignedIn) {
	// 		const test = async () => {
	// 			const response = await fetch('http://localhost:8787/test', {
	// 				method: 'POST',
	// 				body: JSON.stringify({ session: session }),
	// 				headers: {
	// 					'Content-Type': 'application/json'
	// 				}
	// 			});
	// 			const result = await response.json();
	// 			console.log(result);
	// 		};
	// 		try {
	// 			test();
	// 		} catch (err) {}
	// 	}
	// }, [session]);
	return <></>;
};

export default Test2;
