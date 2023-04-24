//import dynamic from 'next/dynamic';
import { useRouter } from 'next/router';
import {
	GetServerSideProps,
	InferGetServerSidePropsType,
	NextApiRequest,
	NextPage
} from 'next/types';
import type { Session } from 'next-auth';
import React, { MouseEvent } from 'react';

import ProfileSideBar from '../components/ProfileSideBar';
import Order from '../components/Order';
import Head from 'next/head';
const ProfilePage: NextPage = () => {
	const router = useRouter();

	const handleClick = (e: MouseEvent<HTMLButtonElement>) => {
		e.preventDefault();
		router.push('chat?id=hey', undefined, { shallow: true });
	};
	return (
		<>
			<Head>
				<title>Profile</title>
			</Head>
			<div className=" mx-auto">
				<div className="min-w-full  rounded lg:grid lg:grid-cols-3 justify-center">
					<ProfileSideBar />
					<Order />
				</div>
			</div>
		</>
	);
};

export default ProfilePage;
