import SellersPage from '../../components/SellersPage';
import { trpc } from '../../utils/trpc';
import { appRouter } from '@acme/api';
import type { Category, Image, User } from '@acme/db';
import { prisma } from '@acme/db';
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
const twentyFourHoursInMs = 1000 * 60 * 60 * 24;
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
			refetchOnWindowFocus: false,
			refetchOnMount: false,
			refetchOnReconnect: false,
			retry: false,
			staleTime: twentyFourHoursInMs
		}
	);

	useEffect(() => {
		console.log(props);
	}, []);

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

			<SellersPage
				uid={uid}
				posts={getCat.data?.user?.seller?.Category}
				reviews={reviews}
				user={getCat.data?.user}
			/>
		</>
	);
};

export const config = {
	runtime: 'nodejs'
};

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
			prisma: prisma,
			headers: context.req.headers
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
};

export default Sellers;
