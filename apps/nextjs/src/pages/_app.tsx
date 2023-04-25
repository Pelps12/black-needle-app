import '../styles/globals.css';
import { AblyProvider } from '../../providers/AblyProvider';
import MixpanelProvider from '../../providers/Mixpanel';
import Layout from '../components/Layout';
import SEOConfig from '../utils/next-seo.config';
import { trpc } from '../utils/trpc';
import { ClerkProvider } from '@clerk/nextjs';
import { DefaultSeo } from 'next-seo';
import type { AppType } from 'next/dist/shared/lib/utils';
import React from 'react';

const MyApp: AppType = ({ Component, pageProps }) => {
	return (
		<React.Fragment>
			<DefaultSeo {...SEOConfig} />
			<ClerkProvider {...pageProps}>
				<MixpanelProvider>
					<AblyProvider>
						<Layout>
							<Component {...pageProps} />
						</Layout>
					</AblyProvider>
				</MixpanelProvider>
			</ClerkProvider>
		</React.Fragment>
	);
};

export default trpc.withTRPC(MyApp);
