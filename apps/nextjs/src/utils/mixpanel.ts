import Mixpanel from 'mixpanel';
import { env } from '../env/server.mjs';

declare global {
	// eslint-disable-next-line no-var
	var mixpanel: Mixpanel.Mixpanel | undefined;
}

export const mixpanel = global.mixpanel || Mixpanel.init(env.NEXT_PUBLIC_MIXPANEL_TOKEN);

if (env.NODE_ENV !== 'production') {
	global.mixpanel = mixpanel;
}
