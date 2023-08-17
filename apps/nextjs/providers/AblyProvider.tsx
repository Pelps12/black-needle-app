import { env } from '@acme/env-config/env';
import { useEffect } from 'react';

export const AblyProvider = ({ children }: { children: React.ReactNode }) => {
	const loadAbly = async () => {
		const { configureAbly, assertConfiguration } = await import('@ably-labs/react-hooks');
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
			const ably_retry = assertConfiguration()?.connection.recoveryKey;
			if (ably_retry) {
				sessionStorage.setItem('ably_recovery_key', ably_retry);
			}
		}
		/* if (ably) {
			let channel = ably.channels.get(`chat-${ably.auth.clientId}`);
			channel.presence.enter();
		} */
	};
	useEffect(() => {
		loadAbly();
	}, []);

	return <>{children}</>;
};
