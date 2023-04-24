import { useEffect, createContext, useState } from 'react';
import mp, { OverridedMixpanel } from 'mixpanel-browser';
import { env } from '../src/env/client.mjs';
import { useSession } from 'next-auth/react';

export const MixpanelContext = createContext<OverridedMixpanel | null>(null);

const MixpanelProvider = ({ children }: { children: React.ReactNode }) => {
	const [mixpanel, setMixpanel] = useState<OverridedMixpanel | null>(null);
	const { data: session, status } = useSession();
	useEffect(() => {
		const initMixpanel = async () => {
			mp.init(env.NEXT_PUBLIC_MIXPANEL_TOKEN, {
				debug: process.env.NODE_ENV === 'development'
			});

			setMixpanel(mp);
		};

		initMixpanel();
	}, []);

	useEffect(() => {
		if (mixpanel) {
			if (status === 'authenticated') {
				mixpanel.identify(session.user?.id);
			}
			mixpanel.track('Page Viewed');
		}
	}, [mixpanel]);

	useEffect(() => {
		if (status === 'authenticated' && mixpanel) {
			mixpanel.identify(session.user?.id);
		}
	}, [status]);
	return <MixpanelContext.Provider value={mixpanel}>{children}</MixpanelContext.Provider>;
};

export default MixpanelProvider;
