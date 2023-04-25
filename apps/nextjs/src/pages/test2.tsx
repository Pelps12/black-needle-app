import { useLoginStore } from '../utils/loginModalStore';
import { trpc } from '../utils/trpc';
import { useAuth } from '@clerk/nextjs';
import React, { useEffect, useState } from 'react';

const Test2 = () => {
	const { userId, isSignedIn } = useAuth();

	const trpcEndpt = trpc.user.createNewAvailability.useMutation();
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
			<button
				onClick={() =>
					trpcEndpt.mutate({
						from: 43200,
						to: 66600,
						day: 'SATURDAY',
						sellerId: 'cld3vszt20000l60fahbl4fp6'
					})
				}
			></button>
		</>
	);
};

export default Test2;
