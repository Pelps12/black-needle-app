import SellersPage from '../../components/SellersPage';
import { trpc } from '../../utils/trpc';
import { appRouter } from '@acme/api';
import type { Category, Image, User } from '@acme/db';
import { env } from '@acme/env-config';
import { getAuth } from '@clerk/nextjs/server';
import isbot from 'isbot';
import { GetServerSideProps, NextPage } from 'next';
import { NextSeo } from 'next-seo';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/router';
import React, { useEffect, useState } from 'react';

/* export async function getServerSideProps() {
	const filePath = path.join(process.cwd(), 'Gallery.json');
	const jsonData = await fsPromises.readFile(filePath);
	const objectData = JSON.parse(jsonData.toString());

	return {
		props: objectData
	};
} */

const Sellers: NextPage<{
	meta: {
		id: string;
		title: string;
		image: string;
	} | null;
}> = (props) => {
	const router = useRouter();
	const [pageName, setPageName] = useState('Seller Page');

	const { uid } = router.query;
	const id = typeof uid === 'string' ? uid : typeof uid === 'undefined' ? ':)' : uid[0]!;
	const [categories, setCategories] = useState<(Category & { Image: Image[] })[] | undefined>(
		undefined
	);
	const [user, setUser] = useState<any>(undefined);

	const getCat = trpc.user.getCategories.useQuery(
		{
			id: id
		},
		{
			refetchInterval: undefined,
			enabled: false
		}
	);

	useEffect(() => {
		console.log(props);
	}, []);

	useEffect(() => {
		async function anyNameFunction() {
			const { data, isSuccess } = await getCat.refetch();
			if (isSuccess) {
				data.user?.name && setPageName(`${data.user.name} | Seller Page`);
				setCategories(data.user?.seller?.Category);
				setUser(data.user);
				console.log(data);
			}
		}

		// Execute the created function directly
		anyNameFunction();
	}, [router.isReady]);
	const reviews = null;
	return (
		<>
			<NextSeo
				title={
					props?.meta?.title
						? `${props?.meta?.title}`
						: user
						? `${user.name} | Seller Page`
						: 'Seller Page'
				}
				openGraph={{
					title: `${props?.meta?.title}` || user?.name,
					description: `Seller Profile of ${user?.name}`,
					url: `https://${env.NEXT_PUBLIC_URL}/seller/${props.meta?.id ?? user?.id}`,
					type: '	profile',
					profile: {
						username: props?.meta?.title ?? user?.name
					},
					images: [
						{ url: props.meta?.image ?? ':)', width: 100, height: 100, alt: 'Profile Picture' }
					]
				}}
			/>

			<SellersPage uid={uid} posts={categories} reviews={reviews} user={user} />
		</>
	);
};

export default Sellers;
