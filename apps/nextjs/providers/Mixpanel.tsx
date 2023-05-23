import { env } from '@acme/env-config/env';
import { useAuth } from '@clerk/nextjs';
import mp, { OverridedMixpanel } from 'mixpanel-browser';
import { useEffect, createContext, useState } from 'react';

export const MixpanelContext = createContext<OverridedMixpanel | null>(null);

const MixpanelProvider = ({ children }: { children: React.ReactNode }) => {
	const [mixpanel, setMixpanel] = useState<OverridedMixpanel | null>(null);
	const { userId, isSignedIn } = useAuth();
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
			if (isSignedIn) {
				mixpanel.identify(userId);
			}
			mixpanel.track('Page Viewed');
		}
	}, [mixpanel]);

	useEffect(() => {
		if (isSignedIn && mixpanel) {
			mixpanel.identify(userId);
		}
	}, [isSignedIn]);
	return <MixpanelContext.Provider value={mixpanel}>{children}</MixpanelContext.Provider>;
};

export default MixpanelProvider;
