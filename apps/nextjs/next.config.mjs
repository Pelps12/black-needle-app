// @ts-check

/**
 * Don't be scared of the generics here.
 * All they do is to give us autocompletion when using this.
 *
 * @template {import('next').NextConfig} T
 * @param {T} config - A generic parameter that flows through to the return type
 * @constraint {{import('next').NextConfig}}
 */
function defineNextConfig(config) {
	return config;
}

export default defineNextConfig({
	reactStrictMode: true,
	swcMinify: true,
	transpilePackages: ['@acme/api', '@acme/auth', '@acme/db', '@acme/env-config'],
	images: {
		domains: [
			'lh3.googleusercontent.com',
			'pbs.twimg.com',
			'ucarecdn.com',
			'images.clerk.dev',
			'www.gravatar.com'
		]
	}
});
