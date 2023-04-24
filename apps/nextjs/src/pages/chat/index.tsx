//import dynamic from 'next/dynamic';
import { useRouter } from 'next/router';
import { GetServerSideProps, InferGetServerSidePropsType, NextPage } from 'next/types';
import type { Session } from 'next-auth';
import React, { MouseEvent } from 'react';
import ChatSidebar from '../../components/ChatSidebar';

import Chat from '../../components/Chat';
import { useSession } from 'next-auth/react';
import { NextSeo } from 'next-seo';
const ChatPage: NextPage = () => {
	const router = useRouter();
	const { id } = router.query;
	const { data: session, status } = useSession();

	const handleClick = (e: MouseEvent<HTMLButtonElement>) => {
		e.preventDefault();
		router.push('chat?id=hey', undefined, { shallow: true });
	};
	return (
		<>
			<NextSeo title="Chat | Sakpa" description="Chat with others for services on campus" />
			{status === 'authenticated' && (
				<div className=" mx-auto">
					<div className="min-w-full border rounded lg:grid lg:grid-cols-3">
						<ChatSidebar />
						{(typeof id === 'string' || id === undefined) && (
							<Chat id={session?.user?.id} rId={id} routerReady={router.isReady} />
						)}
					</div>
				</div>
			)}
		</>
	);
};

export default ChatPage;
