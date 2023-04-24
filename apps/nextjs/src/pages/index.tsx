import NewUser from '../components/NewUser';
import SearchBar from '../components/SearchBar';
import SearchResultPage from '../components/SearchResultPage';
import { env } from '../env/client.mjs';
import { trpc } from '../utils/trpc';
import { useAutoAnimate } from '@formkit/auto-animate/react';
import type { NextPage } from 'next';
import { signIn, signOut } from 'next-auth/react';
import { useSession } from 'next-auth/react';
import { NextSeo } from 'next-seo';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useState, useEffect, SetStateAction, Dispatch } from 'react';
import { useInView } from 'react-intersection-observer';
import AsyncSelect from 'react-select/async-creatable';
import { useInterval } from 'react-use';
import { trpc as api, type RouterOutputs } from '~/utils/api';

enum UserStatus {
	NOTHING = '',
	ASC = 'asc',
	DESC = 'desc'
}

const Home: NextPage = () => {
	const [test, setTest] = useState(true);
	const { data: session, status } = useSession();
	const [animationParent]: any = useAutoAnimate();
	const [count, setCount] = useState(0);
	const arr = ['catering', 'hairdressing', 'accessories', 'services'];

	const [searchResults, setSearchResults] = useState<any[]>([]);

	const resultMut = trpc.search.getSearchedPrices.useMutation();

	const [text, setText] = useState('services');
	const [filterValue, setFilterValue] = useState<UserStatus>(UserStatus.NOTHING);
	const { ref } = useInView({
		/* Optional options */
		threshold: 0
	});
	const [isRunning, setIsRunning] = useState<boolean>(true);

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
				title="Sakpa"
				description="Get services from fellow students on your campus."
				openGraph={{
					title: 'Sakpa. From students by students',
					description: 'A marketplace for students on campus to get services from others',
					url: `https://${env.NEXT_PUBLIC_URL}`
				}}
			/>

			<Head>
				<title>Sakpa</title>
				<meta name="description" content="Get services from fellow students on your campus." />

				<link rel="icon" href="/favicon.ico" />
				<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
			</Head>
			<main className="mx-auto max-w-3xl" ref={animationParent}>
				{isRunning && (
					<div className="mx-0  px-2 py-4 font-semibold">
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
				)}

				<SearchBar
					setSearchResults={setSearchResults}
					filterValue={filterValue}
					text={text}
					resultMut={resultMut}
					setText={setText}
					setIsRunning={setIsRunning}
				/>
			</main>
			{resultMut.isSuccess && (
				<SearchResultPage
					filterValue={filterValue}
					UserStatus={UserStatus}
					setFilterValue={setFilterValue}
					searchResults={searchResults}
				/>
			)}

			{resultMut.isIdle && <NewUser />}
		</>
	);
};

export default Home;

const AuthShowcase: React.FC = () => {
	const { data: session } = api.auth.getSession.useQuery();

	const { data: secretMessage } = api.auth.getSecretMessage.useQuery(
		undefined, // no input
		{ enabled: !!session?.user }
	);

	return (
		<div className="flex flex-col items-center justify-center gap-4">
			{session?.user && (
				<p className="text-center text-2xl text-white">
					{session && <span>Logged in as {session?.user?.name}</span>}
					{secretMessage && <span> - {secretMessage}</span>}
				</p>
			)}
			<button
				className="rounded-full bg-white/10 px-10 py-3 font-semibold text-white no-underline transition hover:bg-white/20"
				onClick={session ? () => void signOut() : () => void signIn()}
			>
				{session ? 'Sign out' : 'Sign in'}
			</button>
		</div>
	);
};
