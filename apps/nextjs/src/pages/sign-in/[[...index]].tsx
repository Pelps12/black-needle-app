import { SignIn } from '@clerk/nextjs';

const SignInPage = () => (
	<div className="flex justify-center items-center mt-7">
		<SignIn
			path="/sign-in"
			routing="path"
			signUpUrl="/sign-up"
			appearance={{
				variables: {
					colorPrimary: '#1dbaa7'
				}
			}}
		/>
	</div>
);
export default SignInPage;
