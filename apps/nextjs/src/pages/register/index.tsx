import React, { useEffect } from 'react';
import { ClientSafeProvider, getProviders, LiteralUnion, signIn } from 'next-auth/react';
import { useRouter } from 'next/router';
import { useState } from 'react';
import { BuiltInProviderType } from 'next-auth/providers';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { trpc } from '../../utils/trpc';
import { env } from '../../env/client.mjs';

type FormFields = {
	confirmPassword: string;
	email: string;
	name: string;
	password: string;
};

const re =
	/^(([^<>()[\]\.,;:\s@\"]+(\.[^<>()[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i;
const schema = z
	.object({
		name: z.string().min(1, { message: 'Name is Required' }),
		email: z.string().email('Invalid Email'),
		image: z.string().nullish(),
		password: z.string().min(8, { message: 'Must be at least 8 characters long' }),
		confirmPassword: z.string().min(1, 'Please confirm your password')
	})
	.refine((data) => data.password === data.confirmPassword, {
		path: ['confirmPassword'],
		message: 'Passwords do not match'
	});

const Register = () => {
	const {
		register,
		handleSubmit,
		formState: { errors }
	} = useForm({
		resolver: zodResolver(schema)
	});
	const mutation = trpc.registration.register.useMutation();
	const router = useRouter();
	const [hidden, setHidden] = useState(true);
	const [providers, setProviders] = useState<Record<
		LiteralUnion<BuiltInProviderType, string>,
		ClientSafeProvider
	> | null>();
	useEffect(() => {
		getProviders().then((providers) => setProviders(providers));
		console.log(providers);
	}, []);

	const [userCredentials, setUserCredentials] = useState({
		fullName: '',
		email: '',
		password: '',
		confirmPassword: ''
	});
	const { fullName, email, password, confirmPassword } = userCredentials;
	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const { name, value } = e.target;

		setUserCredentials({ ...userCredentials, [name]: value });
	};

	const registerUser = (d: any) => {
		console.log(d);
		mutation.mutate(
			{ name: d.name, password: d.password, email: d.email },
			{
				onSuccess: async () => {
					console.log('NICE');
					const result = await signIn('credentials', {
						redirect: true,
						email: d.email,
						password: d.password,
						callbackUrl: env.NEXT_PUBLIC_URL
					});

					console.log('Result:' + result?.status);

					/* 					if (!result?.error) {
						router.replace('/');
					} */
				}
			}
		);
	};
	return (
		<div className={`max-w-md mx-auto sm:shadow-md rounded-md drop-shadow-sm p-4`}>
			<form
				onSubmit={handleSubmit((d) => {
					registerUser(d);
				})}
			>
				<div className="form-control">
					<label className="label">
						<span className="label-text">Name</span>
					</label>
					<input
						className={`input   ${
							typeof errors.name?.message !== 'string'
								? 'input-bordered focus:input-secondary'
								: 'input-error focus:input-error'
						}`}
						/* onFocus={() => errors.name?.message === null} */
						type="text"
						placeholder="Name"
						{...register('name')}
					/>
					{typeof errors.name?.message === 'string' && (
						<p className="pt-2 text-error">{errors.name?.message}</p>
					)}
				</div>

				<div className="form-control">
					<label className="label">
						<span className="label-text">Email</span>
					</label>
					<input
						className={`input   ${
							typeof errors.email?.message !== 'string'
								? 'input-bordered focus:input-secondary'
								: 'input-error focus:input-error'
						}`}
						type="email"
						placeholder="Email Address"
						autoComplete="email"
						{...register('email')}
					/>
					{typeof errors.email?.message === 'string' && (
						<p className="pt-2 text-error">{errors.email?.message}</p>
					)}
				</div>
				<div className="form-control">
					<label className="label">
						<span className="label-text">Password</span>
					</label>
					<div className="flex justify-between">
						<input
							type={`${hidden ? 'password' : 'text'}`}
							placeholder="Password"
							className={`input   ${
								typeof errors.password?.message !== 'string'
									? 'input-bordered focus:input-secondary'
									: 'input-error focus:input-error'
							} basis-11/12`}
							{...register('password')}
						/>
						<label className="swap justify-self-center">
							<input type="checkbox" onClick={() => setHidden(!hidden)} />
							<svg
								className="swap-off h-5 text-gray-500"
								fill="none"
								xmlns="http://www.w3.org/2000/svg"
								viewBox="0 0 640 512"
							>
								<path
									fill="currentColor"
									d="M320 400c-75.85 0-137.25-58.71-142.9-133.11L72.2 185.82c-13.79 17.3-26.48 35.59-36.72 55.59a32.35 32.35 0 0 0 0 29.19C89.71 376.41 197.07 448 320 448c26.91 0 52.87-4 77.89-10.46L346 397.39a144.13 144.13 0 0 1-26 2.61zm313.82 58.1l-110.55-85.44a331.25 331.25 0 0 0 81.25-102.07 32.35 32.35 0 0 0 0-29.19C550.29 135.59 442.93 64 320 64a308.15 308.15 0 0 0-147.32 37.7L45.46 3.37A16 16 0 0 0 23 6.18L3.37 31.45A16 16 0 0 0 6.18 53.9l588.36 454.73a16 16 0 0 0 22.46-2.81l19.64-25.27a16 16 0 0 0-2.82-22.45zm-183.72-142l-39.3-30.38A94.75 94.75 0 0 0 416 256a94.76 94.76 0 0 0-121.31-92.21A47.65 47.65 0 0 1 304 192a46.64 46.64 0 0 1-1.54 10l-73.61-56.89A142.31 142.31 0 0 1 320 112a143.92 143.92 0 0 1 144 144c0 21.63-5.29 41.79-13.9 60.11z"
								></path>
							</svg>
							<svg
								className="swap-on h-5 text-gray-500"
								fill="none"
								xmlns="http://www.w3.org/2000/svg"
								viewBox="0 0 576 512"
							>
								<path
									fill="currentColor"
									d="M572.52 241.4C518.29 135.59 410.93 64 288 64S57.68 135.64 3.48 241.41a32.35 32.35 0 0 0 0 29.19C57.71 376.41 165.07 448 288 448s230.32-71.64 284.52-177.41a32.35 32.35 0 0 0 0-29.19zM288 400a144 144 0 1 1 144-144 143.93 143.93 0 0 1-144 144zm0-240a95.31 95.31 0 0 0-25.31 3.79 47.85 47.85 0 0 1-66.9 66.9A95.78 95.78 0 1 0 288 160z"
								></path>
							</svg>
						</label>
					</div>
					{typeof errors.password?.message === 'string' && (
						<p className="pt-2 text-error">{errors.password?.message}</p>
					)}
				</div>
				<div className="form-control">
					<label className="label">
						<span className="label-text">Confirm Password</span>
					</label>
					<div className="flex justify-between">
						<input
							type={`${hidden ? 'password' : 'text'}`}
							placeholder="Confirm Password"
							className={`input   ${
								typeof errors.confirmPassword?.message !== 'string'
									? 'input-bordered focus:input-secondary'
									: 'input-error focus:input-error'
							} basis-11/12`}
							{...register('confirmPassword')}
						/>
						<label className="swap justify-self-center">
							<input type="checkbox" onClick={() => setHidden(!hidden)} />
							<svg
								className="swap-off h-5 text-gray-500"
								fill="none"
								xmlns="http://www.w3.org/2000/svg"
								viewBox="0 0 640 512"
							>
								<path
									fill="currentColor"
									d="M320 400c-75.85 0-137.25-58.71-142.9-133.11L72.2 185.82c-13.79 17.3-26.48 35.59-36.72 55.59a32.35 32.35 0 0 0 0 29.19C89.71 376.41 197.07 448 320 448c26.91 0 52.87-4 77.89-10.46L346 397.39a144.13 144.13 0 0 1-26 2.61zm313.82 58.1l-110.55-85.44a331.25 331.25 0 0 0 81.25-102.07 32.35 32.35 0 0 0 0-29.19C550.29 135.59 442.93 64 320 64a308.15 308.15 0 0 0-147.32 37.7L45.46 3.37A16 16 0 0 0 23 6.18L3.37 31.45A16 16 0 0 0 6.18 53.9l588.36 454.73a16 16 0 0 0 22.46-2.81l19.64-25.27a16 16 0 0 0-2.82-22.45zm-183.72-142l-39.3-30.38A94.75 94.75 0 0 0 416 256a94.76 94.76 0 0 0-121.31-92.21A47.65 47.65 0 0 1 304 192a46.64 46.64 0 0 1-1.54 10l-73.61-56.89A142.31 142.31 0 0 1 320 112a143.92 143.92 0 0 1 144 144c0 21.63-5.29 41.79-13.9 60.11z"
								></path>
							</svg>
							<svg
								className="swap-on h-5 text-gray-500"
								fill="none"
								xmlns="http://www.w3.org/2000/svg"
								viewBox="0 0 576 512"
							>
								<path
									fill="currentColor"
									d="M572.52 241.4C518.29 135.59 410.93 64 288 64S57.68 135.64 3.48 241.41a32.35 32.35 0 0 0 0 29.19C57.71 376.41 165.07 448 288 448s230.32-71.64 284.52-177.41a32.35 32.35 0 0 0 0-29.19zM288 400a144 144 0 1 1 144-144 143.93 143.93 0 0 1-144 144zm0-240a95.31 95.31 0 0 0-25.31 3.79 47.85 47.85 0 0 1-66.9 66.9A95.78 95.78 0 1 0 288 160z"
								></path>
							</svg>
						</label>
					</div>
					{typeof errors.confirmPassword?.message === 'string' && (
						<p className="pt-2 text-error">{errors.confirmPassword?.message}</p>
					)}
				</div>
				<div className="form-control mt-6">
					<input
						type="submit"
						className={`btn ${mutation.isLoading ? 'btn-disabled' : ' btn-primary'}`}
						value="REGISTER"
					/>
				</div>
			</form>
			<div className="divider" />
			{providers &&
				providers !== undefined &&
				Object.values(providers)
					.filter((provider) => provider.name !== 'Credentials')
					.map((provider) => (
						<div key={provider.name} className="justify-center flex ">
							<button
								className={`rounded-md content-center flex px-2 gap-4 py-3 my-2 ${
									provider.id === 'facebook' ? 'bg-[#1778F2] text-white' : 'bg-slate-200 text-black'
								}`}
								onClick={() => signIn(provider.id, { callbackUrl: env.NEXT_PUBLIC_URL })}
							>
								<img src="/Google__G__Logo (1).svg"></img> Sign in with {provider.name}
							</button>
						</div>
					))}
		</div>
	);
};

export default Register;
