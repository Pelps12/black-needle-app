import { useRouter } from 'next/router';
import React from 'react';

const EmailSignIn = () => {
	const { query } = useRouter();
	return (
		<form
			action="/api/auth/callback/email"
			className="flex flex-col gap-5 items-center justify-center h-[78vh]"
			method="get"
		>
			<h1 className="text-3xl font-bold ">Sign in with your email</h1>
			{/* remove `type` and `value` if you want the user to type this manually */}
			<input type="hidden" name="token" value={query.token} />
			<input type="hidden" name="callbackUrl" value={query.callbackUrl} />
			<input type="hidden" name="email" value={query.email} />
			<button type="submit" className="btn btn-primary">
				Complete sign in
			</button>
		</form>
	);
};

export default EmailSignIn;
