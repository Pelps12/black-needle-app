import { env } from '../env/client.mjs';
import { DefaultSeoProps } from 'next-seo';

//Must only be used on client side
const config: DefaultSeoProps = {
	openGraph: {
		type: 'website',
		locale: 'en_IE',
		url: `${env.NEXT_PUBLIC_URL}`,
		siteName: 'Sakpa',
		images: [
			{
				url: 'https://ucarecdn.com/c82b962d-3692-4c97-ab42-9bb23e8c4cef/',
				width: 50,
				height: 50,
				alt: 'OG image Alt',
				type: 'image/png'
			}
		]
	},
	twitter: {
		handle: '@sakpa.co',
		site: '@sakpa.co',
		cardType: 'summary_large_image'
	}
};

export default config;
