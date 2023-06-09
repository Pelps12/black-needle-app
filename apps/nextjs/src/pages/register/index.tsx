import { SignUp } from '@clerk/nextjs';

const SignUpPage = () => <SignUp path="/register" routing="path" signInUrl="/sign-in" />;
export default SignUpPage;
