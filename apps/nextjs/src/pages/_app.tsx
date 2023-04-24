import '../styles/globals.css';
import { AblyProvider } from '../../providers/AblyProvider';
import MixpanelProvider from '../../providers/Mixpanel';
import Layout from '../components/Layout';
import SEOConfig from '../utils/next-seo.config';
import { trpc } from '../utils/trpc';
import type { Session } from 'next-auth';
import { SessionProvider } from 'next-auth/react';
import { DefaultSeo } from 'next-seo';
import type { AppType } from 'next/dist/shared/lib/utils';
import React from 'react';

const MyApp: AppType<{ session: Session | null }> = ({ Component, pageProps }) => {
	return (
		<React.Fragment>
			<DefaultSeo {...SEOConfig} />
			<SessionProvider session={pageProps.session}>
				<MixpanelProvider>
					<AblyProvider>
						<Layout>
							<Component {...pageProps} />
						</Layout>
					</AblyProvider>
				</MixpanelProvider>
			</SessionProvider>
		</React.Fragment>
	);
};

export default trpc.withTRPC(MyApp);
