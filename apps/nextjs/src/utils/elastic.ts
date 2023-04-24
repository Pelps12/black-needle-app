import { Client } from '@elastic/elasticsearch';
import { env } from '../env/server.mjs';

declare global {
	// eslint-disable-next-line no-var
	var esClient: Client | undefined;
}

export const esClient =
	global.esClient ||
	new Client({
		node: 'https:/194.195.222.200:30052',
		auth: {
			apiKey: env.ES_API_KEY
		},
		tls: {
			ca: env.ES_CERTIFICATE,
			rejectUnauthorized: false
		}
	});

if (env.NODE_ENV !== 'production') {
	global.esClient = esClient;
}
