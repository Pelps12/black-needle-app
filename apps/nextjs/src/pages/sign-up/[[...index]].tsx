import { SignUp } from '@clerk/nextjs';

const SignUpPage = () => (
	<div className="flex justify-center items-center mt-7">
		<SignUp
			path="/sign-up"
			routing="path"
			signInUrl="/sign-in"
			appearance={{
				variables: {
					colorPrimary: '#1dbaa7'
				}
			}}
		/>
	</div>
);
export default SignUpPage;
