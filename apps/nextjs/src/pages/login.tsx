import { SignIn } from '@clerk/nextjs';

const SignInPage = () => (
	<div className="flex justify-center p-5">
		<SignIn path="/login" routing="path" signUpUrl="/sign-up" />
	</div>
);
export default SignInPage;
