import { env } from '../../env/client.mjs';
import { colourOptions as colorOptions, ServicesOption } from '../../utils/data';
import { trpc } from '../../utils/trpc';
import { useAuth } from '@clerk/nextjs';
import { zodResolver } from '@hookform/resolvers/zod';
import { NextSeo } from 'next-seo';
import { useRouter } from 'next/router';
import React, { useEffect, useRef } from 'react';
import { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { GroupBase, StylesConfig } from 'react-select';
import makeAnimated from 'react-select/animated';
import CreatableSelect from 'react-select/creatable';
import * as z from 'zod';

type FormFields = {
	phone_number: string;
	school: string;
	services: string[];
	downPaymentPercentage: number | undefined;
};

const re =
	/^(([^<>()[\]\.,;:\s@\"]+(\.[^<>()[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i;
const schema = z.object({
	phone_number: z.string().min(1, { message: 'Phone Number is Required' }),
	school: z.string(),
	services: z.array(z.string()),
	downPaymentPercentage: z.number().max(20).optional()
});

const SellerRegister = () => {
	const {
		register,
		handleSubmit,
		control,
		formState: { errors }
	} = useForm<FormFields>({
		resolver: zodResolver(schema)
	});

	const animatedComponents = makeAnimated();
	const mutation = trpc.user.createSeller.useMutation();
	const refreshStripeMut = trpc.user.refreshStripe.useMutation();
	const verifyStripe = trpc.user.verifyStripe.useMutation();
	const { userId, isSignedIn } = useAuth();

	const { query } = useRouter();
	const [downPaymentValue, setDownPaymentValue] = useState(0);
	const [viewXInset, setViewXInset] = useState(10);
	const [hidden, setHidden] = useState(true);

	const [userCredentials, setUserCredentials] = useState({
		fullName: '',
		email: '',
		password: '',
		confirmPassword: ''
	});

	const customStyle: StylesConfig<ServicesOption, true, GroupBase<ServicesOption>> = {
		container: (provided, state) => ({
			...provided,
			backgroundColor: '#F2F2F2'
		})
	};

	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const { name, value } = e.target;

		setUserCredentials({ ...userCredentials, [name]: value });
	};

	const handleChangeDownPayment = (e: React.ChangeEvent<HTMLInputElement>, value: string) => {
		// const { name, value } = e.target;

		if (parseInt(value) < 0) {
			setDownPaymentValue(0);
		} else if (parseInt(value) > 20) {
			setDownPaymentValue(20);
		} else {
			setDownPaymentValue(parseInt(value));
		}

		if (parseInt(value) > 9) {
			setViewXInset(12);
		} else {
			setViewXInset(10);
		}
	};

	const registerUser = (d: FormFields) => {
		mutation.mutate(
			{
				phone_number: d.phone_number,
				school: d.school,
				services: d.services,
				downPaymentPercentage: d.downPaymentPercentage
			},
			{
				onSuccess: ({ accountLink }) => {
					window.open(accountLink.url, '_self');
				},
				onError: (err) => {
					if (err.data?.code === 'UNAUTHORIZED') {
						if (err.message === "You haven't added your phone_number") {
							alert("You haven't added your phone_number");
						} else {
							document.getElementById('my-modal-4')?.click();
						}
					}
				}
			}
		);
	};

	useEffect(() => {
		if (document.referrer.includes('connect.stripe.com')) {
			if (query.refresh === 'true') {
				refreshStripeMut.mutate(undefined, {
					onSuccess(data) {
						window.open(data.accountLink.url, '_self');
					}
				});
			}
			if (query.refresh === 'false' && query.return === 'true') {
				verifyStripe.mutate(undefined, {
					onSuccess(data) {
						if (data.success) {
							window.open(`${env.NEXT_PUBLIC_URL}/seller/${data.seller.id}`, '_self');
						} else {
							alert('You can complete the verification process through the profile page.');
						}
					}
				});
			}
		}
	}, [query, userId]);
	return (
		<>
			<NextSeo
				title="Register with Sakpa"
				description="Get services from fellow students on your campus."
				openGraph={{
					title: 'Seller Registration | Sakpa',
					description: 'Get to offering your services stress free',
					url: `https://${env.NEXT_PUBLIC_URL}`,
					images: [
						{
							url: 'https://ucarecdn.com/2af64698-0319-4e34-9182-35e82d37cdf5/',
							alt: 'Benefits for Seller'
						}
					]
				}}
			/>
			<div className={`max-w-md mx-auto sm:shadow-md rounded-md drop-shadow-sm p-4`}>
				<form>
					<div className="form-control">
						<label className="label">
							<span className="label-text">Phone Number</span>
						</label>
						<input
							className={`input   ${
								!errors.phone_number?.message
									? 'input-bordered focus:input-secondary'
									: 'input-error focus:input-error'
							}`}
							/* onFocus={() => errors.name?.message === null} */
							type="text"
							placeholder="Phone Number"
							{...register('phone_number')}
						/>
						{errors.phone_number?.message && (
							<p className="pt-2 text-error">{errors.phone_number?.message}</p>
						)}
					</div>

					<div className="form-control">
						<label className="label">
							<span className="label-text">School</span>
						</label>
						<select
							className={`select w-2/3  ${
								!errors.school?.message
									? 'input-bordered focus:select-secondary'
									: 'select-error focus:select-error'
							}`}
							placeholder="Email Address"
							autoComplete="school"
							{...register('school')}
						>
							<option disabled>School</option>
							<option>UT Dallas</option>
							<option>UT Arlington</option>
							<option>Texas A&M</option>
						</select>
						{errors.school?.message && <p className="pt-2 text-error">{errors.school?.message}</p>}
					</div>

					<div className="form-control ">
						<label className="label">
							<span className="label-text">Services</span>
						</label>
						<label htmlFor="add-tag-input ">
							<Controller
								control={control}
								defaultValue={[]}
								name="services"
								render={({ field: { onChange, value, ref } }) => (
									<CreatableSelect
										isMulti
										ref={ref}
										options={colorOptions}
										components={animatedComponents}
										className="basic-multi-select"
										classNamePrefix="select"
										onChange={(val) => onChange(val.map((c) => c.value))}
										styles={customStyle}
									/>
								)}
							/>
						</label>
					</div>

					<div className="form-control">
						<label className="label">
							<span className="label-text">Down Payment</span>
						</label>
						<div className="relative mt-1 rounded-md shadow-sm flex">
							<input
								min="0"
								max="20"
								defaultValue={'0'}
								type="number"
								className={`input mb-4 input-ghost input-primary focus:outline-none w-full placeholder-gray-500 block  rounded-md border-gray-300 pl-7 pr-12 sm:text-sm ${
									!errors.downPaymentPercentage?.message
										? 'input-bordered focus:input-secondary'
										: 'input-error focus:input-error'
								}`}
								placeholder="0"
								value={downPaymentValue}
								{...register('downPaymentPercentage', {
									valueAsNumber: true,
									required: false
								})}
								onChange={(e) => handleChangeDownPayment(e, e.target.value)}
							/>
							{/* <div className="pointer-events-none inset-y-3  sm:inset-y-3.5  absolute  sm:inset-x-10 inset-x-12  flex"></div> */}
							<div
								className={`pointer-events-none inset-y-3  sm:inset-y-3.5  absolute  sm:inset-x-${viewXInset} inset-x-${viewXInset}  flex`}
							>
								<span className="text-[black]  bottom-3.7 absolute ">%</span>
							</div>
						</div>

						{errors.downPaymentPercentage?.message && (
							<p className="pt-2 text-error">{errors.downPaymentPercentage?.message}</p>
						)}
					</div>

					<div className="form-control mt-6">
						<button
							onClick={handleSubmit((d) => {
								registerUser(d);
							})}
							className={`btn ${mutation.isLoading ? 'btn-disabled' : ' btn-primary'}`}
						>
							{mutation.isLoading && (
								<svg
									className="mr-3 h-5 w-5 animate-spin text-white"
									xmlns="http://www.w3.org/2000/svg"
									fill="none"
									viewBox="0 0 24 24"
								>
									<circle
										className="opacity-25"
										cx="12"
										cy="12"
										r="10"
										stroke="currentColor"
										strokeWidth="4"
									></circle>
									<path
										className="opacity-75"
										fill="currentColor"
										d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
									></path>
								</svg>
							)}
							REGISTER
						</button>
					</div>

					<div className="border-2 rounded-md border-gray-300 mt-6 flex items-center p-6 gap-4">
						<p className="text-sm">
							We use Stripe to make sure you get paid on time and to keep your personal bank and
							details secure. Click <strong>Register</strong> to set up your payments on Stripe.
						</p>
						<img src="/stripe.svg" alt="Stripe" className="h-16 w-32" />
					</div>
				</form>
			</div>
		</>
	);
};

export default SellerRegister;
