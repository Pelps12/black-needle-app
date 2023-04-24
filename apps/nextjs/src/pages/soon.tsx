import Head from 'next/head';
import { NextPage } from 'next/types';
import React, { useState } from 'react';
import { useInView } from 'react-intersection-observer';
import { useInterval } from 'react-use';
import CountDown from '../components/Countdown/CountDown';
import Image from 'next/image';
import { trpc } from '../utils/trpc';
import { NextSeo } from 'next-seo';
import { env } from 'env/client.mjs';

const SoonPage: NextPage = () => {
	const [text, setText] = useState('services');
	const [test, setTest] = useState(true);
	const [date, setDate] = useState<Date>(new Date('2023-01-24T06:00:00.000Z'));
	const listMut = trpc.waitlist.joinWaitList.useMutation();
	const { ref } = useInView({
		/* Optional options */
		threshold: 0
	});
	const arr = ['catering', 'hairdressing', 'accessories', 'services'];
	const [isRunning, setIsRunning] = useState<boolean>(true);
	const [count, setCount] = useState(0);
	const [email, setEmail] = useState<string>();
	const [message, setMessage] = useState<string>();

	const joinList = () => {
		email &&
			listMut.mutate(
				{
					email
				},
				{
					onSuccess: (data) => {
						setMessage('Thanks for joining the waitlist');
					},
					onError: (err) => {
						if (err.message.includes('Unique constraint')) {
							setMessage("You've already registered");
						}
					}
				}
			);
	};

	const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
		message && setMessage(undefined);
		if (e.key === 'Enter') {
			joinList();
		}
	};

	function waitforme(milisec: number) {
		return new Promise((resolve) => {
			setTimeout(() => {
				resolve('');
			}, milisec);
		});
	}
	useInterval(
		async () => {
			setTest(false);

			setCount(count + 1);
			await waitforme(700);
			setText(arr[count]!);
			setTest(true);
			//console.log(count);

			if (count === 3) {
				setCount(0);
			}
		},
		isRunning ? 3000 : null
	);

	return (
		<>
			<NextSeo
				openGraph={{
					title: 'Sakpa. Sign up for the beta launch',
					description: `Get services from fellow students on your campus.`,
					url: `https://${env.NEXT_PUBLIC_URL}/soon`,
					type: 'profile'
				}}
			/>
			<Head>
				<title>Sakpa coming soon</title>
				<meta name="description" content="Get services from fellow students on your campus." />

				<link rel="icon" href="/favicon.ico" />
				<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
			</Head>
			<main className="mx-auto max-w-3xl min-h-screen my-0">
				<div className="mx-0  px-2 py-4 font-semibold">
					<Image src="/logo.svg" width={200} height={200} alt="Logo" className="mx-auto" />
					<div className="flex items-center  w-full mx-auto justify-center">
						<h2 className="text-4xl sm:text-5xl md:text-7xl text-left pt-4 px-4 pb-2  justify-start leading-tight justify-self-end">
							Get
						</h2>
						<div
							ref={ref}
							className={`transition ease-in duration-600 pt-4 px-4 pb-2 text-4xl sm:text-5xl md:text-7xl text-left text-secondary basis-3/4 leading-tight ${
								test ? 'opacity-100' : 'opacity-0'
							}`}
						>
							{text}
						</div>
					</div>

					<h2 className="text-4xl sm:text-5xl md:text-7xl pt-4 px-4 pb-2 text-center">
						on your{' '}
						<span className="before:block before:absolute before:-inset-1 before:-skew-y-3 before:bg-primary relative inline-block">
							<span className="relative text-white">campus</span>
						</span>
					</h2>
				</div>
				<CountDown date={date} />
				<div className="mx-auto text-center text-2xl">
					<p>Get early access</p>{' '}
					<div className="input-group mx-auto justify-center my-2">
						<input
							type="email"
							placeholder="Email"
							className="input input-bordered"
							value={email || ''}
							onChange={(e) => setEmail(e.target.value)}
							onKeyDown={(e) => handleKeyPress(e)}
							onFocus={(e) => setMessage(undefined)}
						/>
						<button className="btn  btn-primary" onClick={(e) => joinList()}>
							{listMut.isLoading && (
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
							JOIN
						</button>
					</div>
					<p className={`${listMut.isSuccess ? 'text-success' : 'text-error'}`}>{message}</p>
				</div>
			</main>
		</>
	);
};

export default SoonPage;
