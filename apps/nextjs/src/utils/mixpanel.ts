import { env } from '@acme/env-config/env';
import Mixpanel from 'mixpanel';

declare global {
	// eslint-disable-next-line no-var
	var mixpanel: Mixpanel.Mixpanel | undefined;
}

export const mixpanel = global.mixpanel || Mixpanel.init(env.NEXT_PUBLIC_MIXPANEL_TOKEN);

if (env.NODE_ENV !== 'production') {
	global.mixpanel = mixpanel;
}
