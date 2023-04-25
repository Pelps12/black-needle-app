import { SignIn } from '@clerk/nextjs';
import { useRouter } from 'next/router';

const LoginModal = () => {
	const router = useRouter();
	return (
		<>{router.isReady && <SignIn path={router.pathname} routing="path" signUpUrl="/sign-up" />}</>
	);
};
export default LoginModal;
