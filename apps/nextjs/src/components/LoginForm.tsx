import { SignIn } from '@clerk/nextjs';
import { env } from 'env/client.mjs';
import { useRouter } from 'next/router';

const LoginModal = () => {
	const router = useRouter();
	return (
		<>
			{router.isReady && (
				<SignIn
					path={router.pathname}
					routing="path"
					signUpUrl={`${env.NEXT_PUBLIC_URL}/register`}
					appearance={{
						variables: {
							colorPrimary: '#1dbaa7'
						}
					}}
				/>
			)}
		</>
	);
};
export default LoginModal;
