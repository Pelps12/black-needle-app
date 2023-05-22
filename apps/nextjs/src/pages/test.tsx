import { useLoginStore } from '../utils/loginModalStore';
import { trpc } from '../utils/trpc';
import { useAuth } from '@clerk/nextjs';
import React, { useEffect, useState } from 'react';

const Test = () => {
	const { userId, isSignedIn } = useAuth();

	const trpcEndpt = trpc.upload.getPresignedUrl.useQuery({
		type: 'GET',
		roomId: 'cldcra91i0000mo0ffkxiye76',
		key: '6fcd3bbd-d8af-4c9a-956c-f2d5cb554ef1'
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
	return (
		<>
			<img src={trpcEndpt.data} alt="" />
		</>
	);
};

export default Test;
