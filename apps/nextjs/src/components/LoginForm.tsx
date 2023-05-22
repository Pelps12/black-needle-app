import { SignIn, SignedOut } from '@clerk/nextjs';
import { env } from 'env/client.mjs';
import { useRouter } from 'next/router';

const LoginModal = () => {
	const router = useRouter();
	return (
		<SignedOut>
			{router.isReady && (
				<SignIn
					path={router.pathname}
					routing="path"
					signUpUrl={`${env.NEXT_PUBLIC_URL}/sign-in`}
					appearance={{
						variables: {
							colorPrimary: '#1dbaa7'
						}
					}}
				/>
			)}
		</SignedOut>
	);
};
export default LoginModal;
