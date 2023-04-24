import { useSession } from 'next-auth/react';
import React, { useEffect, useState } from 'react';
import { useLoginStore } from '../utils/loginModalStore';
import { trpc } from '../utils/trpc';

const Test2 = () => {
	const { data: session, status } = useSession();

	const trpcEndpt = trpc.user.createNewAvailability.useMutation();
	useEffect(() => {
		if (status === 'authenticated') {
			const test = async () => {
				const response = await fetch('http://localhost:8787/test', {
					method: 'POST',
					body: JSON.stringify({ session: session }),
					headers: {
						'Content-Type': 'application/json'
					}
				});
				const result = await response.json();
				console.log(result);
			};
			try {
				test();
			} catch (err) {}
		}
	}, [session]);
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
