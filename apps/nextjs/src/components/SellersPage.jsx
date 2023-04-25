import { trpc } from '../utils/trpc';
import Availability from './Availability';
import GalleryTab from './GalleryTab';
import PricesTab from './PricesTab';
import ProfileCard from './ProfileCard';
import RatingTab from './RatingTab';
import Ratings from './Ratings';
import { useAuth } from '@clerk/nextjs';
import { useRouter } from 'next/router';
import React, { useState, useEffect } from 'react';
import { useEffectOnce } from 'react-use';

function classNames(...classes) {
	return classes.filter(Boolean).join(' ');
}

const SellersPage = ({ uid, posts, reviews, user }) => {
	const router = useRouter();
	const { userId, isSignedIn } = useAuth();
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
				{isSignedIn && userId === uid ? (
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
