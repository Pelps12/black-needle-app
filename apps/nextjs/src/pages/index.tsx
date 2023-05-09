import NewUser from '../components/NewUser';
import SearchBar from '../components/SearchBar';
import SearchResultPage from '../components/SearchResultPage';
import { env } from '../env/client.mjs';
import { trpc as api, type RouterOutputs } from '../utils/api';
import { trpc } from '../utils/trpc';
import { useAuth } from '@clerk/nextjs';
import { useAutoAnimate } from '@formkit/auto-animate/react';
import algoliasearch from 'algoliasearch/lite';
import { Hit as AlgoliaHit } from 'instantsearch.js';
import type { NextPage } from 'next';
import { GetServerSideProps } from 'next';
import { NextSeo } from 'next-seo';
import Head from 'next/head';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/router';
import singletonRouter from 'next/router';
import { useState, useEffect, SetStateAction, Dispatch } from 'react';
import { renderToString } from 'react-dom/server';
import { createInstantSearchRouterNext } from 'react-instantsearch-hooks-router-nextjs';
import { getServerState } from 'react-instantsearch-hooks-server';
import {
	DynamicWidgets,
	InstantSearch,
	Hits,
	Highlight,
	RefinementList,
	SearchBox,
	InstantSearchServerState,
	InstantSearchSSRProvider,
	useHits
} from 'react-instantsearch-hooks-web';
import { useInView } from 'react-intersection-observer';
import AsyncSelect from 'react-select/async-creatable';
import { useInterval } from 'react-use';

enum UserStatus {
	NOTHING = '',
	ASC = 'asc',
	DESC = 'desc'
}

type HomePageProps = {
	serverState?: InstantSearchServerState;
	url?: string;
};

const searchClient = algoliasearch('MXKJ7URABT', 'ecd72cebe5c87facc09e9e9884038e0a');

const CustomHits = () => {
	const { hits } = useHits();
	return (
		<div className="grid grid-cols-3  gap-5">
			{hits.map((hit) => (
				<Hit hit={hit} />
			))}
		</div>
	);
};

function Hit({ hit }: { hit: any }) {
	return (
		<>
			{hit.prices.map((item: any) => (
				<Link
					href={`/seller/${hit.sellerId}?active=PRICES&productID=${item.id}`}
					key={hit.id}
					className="group"
				>
					<div className=" my-2 ">
						<Image
							className="min-w-full max-w-xs md:max-w-md max-h-full shadow-lg object-cover rounded-lg h-[30vh] w-40 md:w-60 md:h-72  object-center mx-auto"
							alt="Picture f the "
							width={270}
							height={360}
							src={hit.Image[0].link}
						/>

						<h3 className="mt-4 text-xl text-gray-700 text-left font-bold">{item.name} </h3>
						<p className="mt-1 text-md font-medium text-gray-900">${item.amount}</p>
					</div>
				</Link>
			))}
		</>
	);
}

const Home: NextPage<HomePageProps> = ({ serverState, url }) => {
	const [test, setTest] = useState(true);
	const [animationParent]: any = useAutoAnimate();
	const [count, setCount] = useState(0);
	const arr = ['catering', 'hairdressing', 'accessories', 'services'];

	const [searchResults, setSearchResults] = useState<any[]>([]);

	// const resultMut = trpc.search.getSearchedPrices.useMutation();

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
			<InstantSearchSSRProvider {...serverState}>
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
				<InstantSearch
					searchClient={searchClient}
					indexName="dev_sakpa"
					routing={{
						router: createInstantSearchRouterNext({
							serverUrl: url,
							singletonRouter
						})
					}}
					insights={true}
				>
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

						<SearchBox
							classNames={{
								root: 'flex',
								form: 'w-full flex gap-3',
								submitIcon: 'h-5 w-5 fill-primary',
								input: 'w-full h-8 rounded-md px-3',
								resetIcon: 'hidden'
							}}
						/>
						<CustomHits />
					</main>
					{/* {resultMut.isSuccess && (
				
			)}

			{resultMut.isIdle && <NewUser />} */}
				</InstantSearch>
			</InstantSearchSSRProvider>
		</>
	);
};

export default Home;

export const getServerSideProps: GetServerSideProps<HomePageProps> =
	async function getServerSideProps({ req }) {
		const protocol = req.headers.referer?.split('://')[0] || 'https';
		const url = `${protocol}://${req.headers.host}${req.url}`;
		const serverState = await getServerState(<Home url={url} />, {
			renderToString
		});

		return {
			props: {
				serverState,
				url
			}
		};
	};
