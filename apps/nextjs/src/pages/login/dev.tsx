import { env } from '@acme/env-config/env';
import { NextPage } from 'next';
import React, { useState } from 'react';

const Dev: NextPage = () => {
	const [password, setPassword] = useState<string>();

	const handleSubmit = async () => {
		if (password) {
			const response = await fetch(`${env.NEXT_PUBLIC_URL}/api/dev`, {
				method: 'POST',
				headers: {
					Accept: 'application/json',
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					password: password
				})
			});
			if (response.ok) {
				//window.open(`${env.NEXT_PUBLIC_URL}`, '_self');
			}
		}
	};
	return (
		<div className="flex flex-col gap-3 justify-center items-center">
			<input
				type="text"
				className="input input-secondary"
				placeholder="Password"
				value={password}
				onChange={(e) => setPassword(e.target.value)}
			/>
			<button className="btn" onClick={() => handleSubmit()}>
				LOGIN
			</button>
		</div>
	);
};

export default Dev;
