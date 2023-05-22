import SellersPage from '../../components/SellersPage';
import { trpc } from '../../utils/trpc';
import { appRouter } from '@acme/api';
import { prisma } from '@acme/db';
import { getAuth } from '@clerk/nextjs/server';
import type { Category, Image, User } from '@prisma/client';
import { env } from 'env/client.mjs';
import fsPromises from 'fs/promises';
import isbot from 'isbot';
import { GetServerSideProps, NextPage } from 'next';
import { NextSeo, ProfilePageJsonLd } from 'next-seo';
import Head from 'next/head';
import { useRouter } from 'next/router';
import path from 'path';
import React, { useEffect, useState } from 'react';
import { getServerAuthSession } from 'server/common/get-server-auth-session';

export const config = {
	runtime: 'experimental-edge' // for Edge API Routes only
};

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
			{/* <NextSeo
				title={
					props?.meta?.title
						? `${props?.meta?.title} | Seller Page`
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
			/> */}

			<SellersPage uid={uid} posts={categories} reviews={reviews} user={user} />
		</>
	);
};

export default Sellers;
/* 
export const getServerSideProps: GetServerSideProps = async (context) => {
	const uid =
		typeof context.query.uid === 'string'
			? context.query.uid
			: context.query.uid == undefined
			? ':)'
			: context.query.uid[0]!;
	const productId =
		typeof context.query.productID === 'string'
			? context.query.productID
			: context.query.productID == undefined
			? ':)'
			: context.query.productID[0]!;
	if (isbot(context.req.headers['user-agent'])) {
		const user = getAuth(context.req);
		const client = appRouter.createCaller({
			auth: user,
			prisma: prisma
		});
		const data = await client.user.getCategories({
			id: uid
		});
		const category = data.user?.seller?.Category.find((category) =>
			category.prices.find((price) => price.id === productId)
		);
		return {
			props: {
				meta: {
					id: data.user?.id,
					title: `${data.user?.name} | Seller Page${category?.name && ' (' + category?.name + ')'}`,
					image: category?.Image[0]?.link ?? data.user?.image
				}
			}
		};
	}
	return {
		props: {} // will be passed to the page component as props
	};
}; */
