//import dynamic from 'next/dynamic';

import Chat from '../../components/Chat';
import ChatSidebar from '../../components/ChatSidebar';
import { useAuth } from '@clerk/nextjs';
import { NextSeo } from 'next-seo';
import { useRouter } from 'next/router';
import { GetServerSideProps, InferGetServerSidePropsType, NextPage } from 'next/types';
import React, { MouseEvent } from 'react';

const ChatPage: NextPage = () => {
	const router = useRouter();
	const { id } = router.query;
	const { userId, isSignedIn } = useAuth();

	const handleClick = (e: MouseEvent<HTMLButtonElement>) => {
		e.preventDefault();
		router.push('chat?id=hey', undefined, { shallow: true });
	};
	return (
		<>
			<NextSeo title="Chat | Sakpa" description="Chat with others for services on campus" />
			{isSignedIn && (
				<div className=" mx-auto">
					<div className="min-w-full border rounded lg:grid lg:grid-cols-3">
						<ChatSidebar />
						{(typeof id === 'string' || id === undefined) && (
							<Chat id={userId} rId={id} routerReady={router.isReady} />
						)}
					</div>
				</div>
			)}
		</>
	);
};

export default ChatPage;
