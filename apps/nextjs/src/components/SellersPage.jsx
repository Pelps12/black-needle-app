import React, { useState, useEffect } from 'react';
import ProfileCard from './ProfileCard';
import PricesTab from './PricesTab';
import GalleryTab from './GalleryTab';
import RatingTab from './RatingTab';
import Ratings from './Ratings';
import { trpc } from '../utils/trpc';
import { useEffectOnce } from 'react-use';
import { useRouter } from 'next/router';
import Availability from './Availability';
import { useSession } from 'next-auth/react';

function classNames(...classes) {
	return classes.filter(Boolean).join(' ');
}

const SellersPage = ({ uid, posts, reviews, user }) => {
	const router = useRouter();
	const { data: session, status } = useSession();
	const [active, setActive] = useState(
		router.query.active === undefined ? 'CATEGORIES' : router.query.active
	);

	const [categories, setCategories] = useState(posts);

	const onButtonClick = (tab) => {
		setActive(tab);
	};

	useEffectOnce(() => {
		console.log(uid);
	}, [posts]);
	useEffect(() => {
		router.query.active && setActive(router.query.active);
	}, [router.query]);
	useEffect(() => {
		console.log(posts);
		setCategories(posts);
	}, [posts]);

	return (
		<>
			<ProfileCard setActive={setActive} seller={user}></ProfileCard>
			<div className="tabs tabs-boxed bg-base-100 justify-center gap-5 md:gap-10">
				<div className={`tab ${active === 'CATEGORIES' && 'tab-active'}`}>
					<button
						onClick={() => onButtonClick('CATEGORIES')}
						className="text-xl font-bold dark:text-black-500"
					>
						CATEGORIES
					</button>
				</div>
				<div className={`tab ${active === 'PRICES' && 'tab-active'}`}>
					<button
						onClick={() => onButtonClick('PRICES')}
						className="text-xl font-bold dark:text-black-500"
					>
						PRICES
					</button>
				</div>
				{status === 'authenticated' && session.user.id === uid ? (
					<div className={`tab ${active === 'AVAILABILITY' && 'tab-active'}`}>
						<button
							onClick={() => onButtonClick('AVAILABILITY')}
							className="text-xl font-bold dark:text-black-500"
						>
							AVAILABILITY
						</button>
					</div>
				) : null}

				{/* <div className={`tab ${active === 'REVIEWS' && 'tab-active'}`}>
					<button
						onClick={() => onButtonClick('REVIEWS')}
						className="text-xl font-bold dark:text-black-500"
					>
						{' '}
						REVIEWS
					</button>
				</div> */}
			</div>
			{active === 'CATEGORIES' && (
				<GalleryTab
					uid={uid}
					posts={posts}
					setCategories={setCategories}
					categories={categories}
				></GalleryTab>
			)}
			{active === 'PRICES' && (
				<PricesTab
					productID={router.query.productID}
					uid={uid}
					posts={posts}
					categories={categories}
					setCategories={setCategories}
				></PricesTab>
			)}
			{active === 'AVAILABILITY' && (
				<Availability
					productID={router.query.productID}
					uid={uid}
					posts={posts}
					categories={categories}
					setCategories={setCategories}
				></Availability>
			)}
			{active === 'REVIEWS' && <RatingTab posts={posts} reviews={reviews}></RatingTab>}
		</>
	);
};

export default SellersPage;
