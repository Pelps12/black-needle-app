import type { Price } from '@acme/db';
import { env } from '@acme/env-config/env';
import ImageCarousel from '@components/ImageCarousel';
import SearchBar from '@components/SchoolSelect';
import Services from '@components/Search/Services';
import ImageWithFallback from '@components/Utils/ImageWithFallback';
import { useAutoAnimate } from '@formkit/auto-animate/react';
import algoliasearch from 'algoliasearch/lite';
import type { NextPage } from 'next';
import { GetServerSideProps } from 'next';
import { NextSeo } from 'next-seo';
import Head from 'next/head';
import Image from 'next/image';
import Link from 'next/link';
import singletonRouter from 'next/router';
import {
	useState,
	useEffect,
	SetStateAction,
	Dispatch,
	useCallback,
	useRef,
	memo,
	useMemo
} from 'react';
import { renderToString } from 'react-dom/server';
import { createInstantSearchRouterNext } from 'react-instantsearch-hooks-router-nextjs';
import { getServerState } from 'react-instantsearch-hooks-server';
import {
	DynamicWidgets,
	InstantSearch,
	Hits,
	Highlight,
	SearchBox,
	InstantSearchServerState,
	InstantSearchSSRProvider,
	useHits,
	RefinementList,
	HitsProps,
	useInfiniteHits
} from 'react-instantsearch-hooks-web';
import { SearchBoxClassNames } from 'react-instantsearch-hooks-web/dist/es/ui/SearchBox';
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
		<div className="grid p-2 md:grid-cols-3  gap-5">
			{hits.map((hit) => (
				<Hit hit={hit} />
			))}
		</div>
	);
};

const InfiniteHits = memo((props: HitsProps<any>) => {
	const { hits, isLastPage, showMore } = useInfiniteHits(props);
	const sentinelRef = useRef(null);

	return (
		<div className="ais-InfiniteHits">
			<ul className="ais-InfiniteHits-list">
				<div className="grid p-2 md:grid-cols-3  gap-5">
					{hits.map((hit) => (
						<Hit hit={hit} />
					))}
					<div ref={sentinelRef} aria-hidden="true" />
				</div>
			</ul>
		</div>
	);
});
const CustomComponent = ({ classNames }: { classNames: Partial<SearchBoxClassNames> }) => {
	return (
		<svg
			version="1.1"
			id="Layer_1"
			xmlns="http://www.w3.org/2000/svg"
			xmlnsXlink="http://www.w3.org/1999/xlink"
			x="0px"
			y="0px"
			className="h-10 sm:h-12 sm:w-10 w-8 fill-white p-2 sm:p-3 bg-primary m-2 rounded-xl"
			viewBox="0 0 122.879 119.799"
			enableBackground="new 0 0 122.879 119.799"
			xmlSpace="preserve"
		>
			<g>
				<path d="M49.988,0h0.016v0.007C63.803,0.011,76.298,5.608,85.34,14.652c9.027,9.031,14.619,21.515,14.628,35.303h0.007v0.033v0.04 h-0.007c-0.005,5.557-0.917,10.905-2.594,15.892c-0.281,0.837-0.575,1.641-0.877,2.409v0.007c-1.446,3.66-3.315,7.12-5.547,10.307 l29.082,26.139l0.018,0.016l0.157,0.146l0.011,0.011c1.642,1.563,2.536,3.656,2.649,5.78c0.11,2.1-0.543,4.248-1.979,5.971 l-0.011,0.016l-0.175,0.203l-0.035,0.035l-0.146,0.16l-0.016,0.021c-1.565,1.642-3.654,2.534-5.78,2.646 c-2.097,0.111-4.247-0.54-5.971-1.978l-0.015-0.011l-0.204-0.175l-0.029-0.024L78.761,90.865c-0.88,0.62-1.778,1.209-2.687,1.765 c-1.233,0.755-2.51,1.466-3.813,2.115c-6.699,3.342-14.269,5.222-22.272,5.222v0.007h-0.016v-0.007 c-13.799-0.004-26.296-5.601-35.338-14.645C5.605,76.291,0.016,63.805,0.007,50.021H0v-0.033v-0.016h0.007 c0.004-13.799,5.601-26.296,14.645-35.338C23.683,5.608,36.167,0.016,49.955,0.007V0H49.988L49.988,0z M50.004,11.21v0.007h-0.016 h-0.033V11.21c-10.686,0.007-20.372,4.35-27.384,11.359C15.56,29.578,11.213,39.274,11.21,49.973h0.007v0.016v0.033H11.21 c0.007,10.686,4.347,20.367,11.359,27.381c7.009,7.012,16.705,11.359,27.403,11.361v-0.007h0.016h0.033v0.007 c10.686-0.007,20.368-4.348,27.382-11.359c7.011-7.009,11.358-16.702,11.36-27.4h-0.006v-0.016v-0.033h0.006 c-0.006-10.686-4.35-20.372-11.358-27.384C70.396,15.56,60.703,11.213,50.004,11.21L50.004,11.21z" />
			</g>
		</svg>
	);
};

const LoadingComponent = () => {
	return <span className="loading loading-dots loading-sm"></span>;
};

function Hit({ hit }: { hit: any }) {
	const getPriceRange = useCallback(
		(prices: Price[]) => {
			console.log('Random Number');
			const minimum = Math.min(...prices.map((price) => price.amount));
			const maximum = Math.max(...prices.map((price) => price.amount));
			if (minimum === maximum) {
				return `$${minimum}`;
			}
			return `$${minimum} - $${maximum}`;
		},
		[hit]
	);

	const getTruncatedName = useCallback(
		(name: string) => {
			const limit = hit.prices.length > 1 ? 12 : 20;
			console.log(name.length);
			return (name.length ?? 0) < limit ? name : name.substring(0, limit) + ' ...';
		},
		[hit]
	);
	if (hit?.prices?.length === 0) {
		return null;
	}
	return (
		<>
			{/* <Link
					href={`/seller/${hit.sellerId}?active=PRICES&productID=${item.id}`}
					key={hit.id}
					className="group"
				>
					<div className=" my-2 p-3 shadow-lg">
						<ImageWithFallback
							className="shadow-lg object-cover rounded-lg  aspect-square  object-center mx-auto"
							alt="Picture f the "
							width={270}
							height={360}
							src={`${hit.Image[0].link}-/preview/938x432/-/quality/smart/-/format/auto/`}
						/>

						<h3 className="mt-4 text-xl text-gray-700 text-left font-bold">{item.name} </h3>
						<p className="mt-1 text-md font-medium text-gray-900">${item.amount}</p>
					</div>
				</Link> */}

			<div className="py-3 px-4   relative ">
				<Link
					className="group  overflow-hidden flex flex-col items-start justify-between h-full"
					href={`/seller/${hit.sellerId}?active=PRICES&productID=${hit.prices[0]?.id}`}
					key={hit.id}
					shallow={true}
					prefetch={true}
				>
					<div className="relative rounded-xl overflow-hidden w-full">
						<ImageWithFallback
							className="mx-auto w-full h-64 md:h-72 top-0 left-0 object-cover group-hover:scale-105 transition-transform duration-500 ease-in-out rounded-xl"
							alt={hit.name}
							width={360}
							height={270}
							src={`${hit.Image[0].link}-/preview/938x432/-/quality/smart/-/format/auto/`}
						/>
					</div>

					<div className="mt-4 flex w-full flex-row gap-0 items-center font-semibold justify-between">
						<div className=" text-left text-xl  text-gray-700 tooltip " data-tip={hit.name}>
							<p>{getTruncatedName(hit.name)} </p>
						</div>
						<div className="text-md rounded-lg bg-primary px-2 py-1 font-medium text-gray-900">
							<p>{getPriceRange(hit.prices)} </p>
						</div>
					</div>
				</Link>
			</div>
		</>
	);
}

const Home: NextPage<HomePageProps> = ({ serverState, url }) => {
	const [test, setTest] = useState(true);
	const [animationParent]: any = useAutoAnimate();
	const [count, setCount] = useState(0);
	const arr = useMemo(() => {
		return [
			{
				image: '/homepage/barbering.jpg',
				service: 'barbering'
			},
			{
				image: '/homepage/catering.jpeg',
				service: 'catering'
			},
			{
				image: '/homepage/hairdressing.jpg',
				service: 'hairdressing'
			}
		];
	}, []);

	const { ref } = useInView({
		/* Optional options */
		threshold: 0
	});

	function waitforme(milisec: number) {
		return new Promise((resolve) => {
			setTimeout(() => {
				resolve('');
			}, milisec);
		});
	}

	useInterval(async () => {
		setTest(false);
		if (arr.length > 0) {
			setTimeout(() => {
				setCount((count + 1) % arr.length);
				setTest(true);
			}, 600);
		}

		//console.log(count);
	}, 3000);

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
					indexName={env.NEXT_PUBLIC_ALGOLIA_INDEX_NAME}
					routing={{
						router: createInstantSearchRouterNext({
							serverUrl: url,
							singletonRouter
						})
					}}
					insights={true}
				>
					<main className="mx-auto" ref={animationParent}>
						<div className="max-w-[85rem] mx-auto px-4 sm:px-6 lg:px-8">
							<div className="grid lg:grid-cols-7 lg:gap-x-8 xl:gap-x-12 lg:items-center">
								<div className="lg:col-span-4 mt-10 lg:mt-0">
									<ImageWithFallback
										className={`transition ease-in duration-600 w-[900px] h-auto rounded-xl object-cover aspect-[4/3] ${
											test !== undefined && !test ? 'opacity-0' : 'opacity-100'
										}`}
										src={arr[count]?.image ?? ''}
										alt="Image Description"
										width={900}
										height={700}
									/>
								</div>

								<div className="lg:col-span-3">
									<div className="mx-0  px-2 py-4 font-semibold text-3xl sm:text-4xl md:text-6xl">
										<div className="flex items-start  w-full mx-auto justify-center">
											<h2 className=" text-left pt-4 px-4 pb-2  justify-start leading-tight justify-self-end">
												Get
											</h2>
											<div
												ref={ref}
												className={`transition ease-in duration-600 pt-4 px-4 pb-2 text-left text-secondary basis-3/4 leading-tight ${
													test ? 'opacity-100' : 'opacity-0'
												}`}
											>
												{arr[count]?.service ?? 'services'}
											</div>
										</div>

										<h2 className=" pt-4 px-4 pb-2 text-left">
											on your{' '}
											<span className="before:block before:absolute before:-inset-1 before:-skew-y-3 before:bg-primary relative inline-block">
												<span className="relative text-white">campus</span>
											</span>
										</h2>
									</div>

									<div className="mx-4">
										<SearchBar attribute="school" />
										<SearchBox
											classNames={{
												root: 'my-2 flex basis-3/4 gap-4 mx-auto w-auto justify-center   border-2 rounded-md px-2 py-1 items-center',
												form: 'relative w-full flex items-center',
												input:
													'input input-md sm:h-12 sm:input-lg input-bordered input-primary w-full',
												submitIcon: 'absolute top-0 right-0',
												resetIcon: 'hidden',
												reset: 'hidden'
											}}
											placeholder={`Search for ${arr[count]?.service ?? 'services'}`}
											submitIconComponent={CustomComponent}
											loadingIconComponent={LoadingComponent}
										/>
									</div>

									<div className="mt-6 lg:mt-12">
										<span className="text-xs font-medium text-gray-800 uppercase dark:text-gray-200">
											Choose a service
										</span>

										<Services attribute="service" />
									</div>
								</div>
							</div>
						</div>
						<div className="max-w-5xl mx-auto">
							<InfiniteHits />
						</div>
					</main>
					{/* {resultMut.isSuccess && (
				
			)}

			{resultMut.isIdle && <NewUser />} */}
				</InstantSearch>
			</InstantSearchSSRProvider>
		</>
	);
};

export const config = {
	runtime: 'nodejs'
};

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

export default Home;
