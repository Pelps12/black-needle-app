import { env } from '../src/env/client.mjs';
import { assertConfiguration, configureAbly } from '@ably-labs/react-hooks';
import { useEffect } from 'react';

export const AblyProvider = ({ children }: { children: React.ReactNode }) => {
	useEffect(() => {
		const recoveryKey = sessionStorage.getItem('ably_recovery_key');
		configureAbly({
			authUrl: `${env.NEXT_PUBLIC_URL}/api/ably/createTokenRequest`,
			autoConnect: true,
			...(recoveryKey ? { recover: recoveryKey } : {}),
			echoMessages: true,
			httpMaxRetryCount: 3
		});

		let ably = assertConfiguration();
		console.log(ably);

		if (ably.connection.recoveryKey) {
			console.log(ably.connection.recoveryKey);
			sessionStorage.setItem('ably_recovery_key', ably.connection.recoveryKey);
		}
		if (ably.connection.errorReason) {
			configureAbly({
				authUrl: `${env.NEXT_PUBLIC_URL}/api/createTokenRequest`,
				autoConnect: true
			});
			sessionStorage.setItem('ably_recovery_key', assertConfiguration().connection.recoveryKey);
		}
		/* if (ably) {
			let channel = ably.channels.get(`chat-${ably.auth.clientId}`);
			channel.presence.enter();
		} */
	}, []);

	return <>{children}</>;
};
