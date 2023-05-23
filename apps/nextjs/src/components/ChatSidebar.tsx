import { trpc } from '../utils/trpc';
import { formatDistance, formatDistanceStrict } from 'date-fns';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { NextPage } from 'next/types';
import React from 'react';

const ChatSidebar: NextPage = () => {
	const router = useRouter();
	const roomsEndpoint = trpc.chat.getRecentRooms.useQuery();

	return (
		<div className="border-r border-gray-300 lg:col-span-1">
			<div className="overflow-auto">
				<h2 className="my-2 mb-2 ml-2 text-lg text-gray-600 hidden lg:block">Chats</h2>
				<div className="flex lg:flex-col">
					{roomsEndpoint.data &&
						[...roomsEndpoint.data].map((room, idx) => (
							<div
								className="flex items-center px-3 py-2 text-sm transition duration-150 ease-in-out  cursor-pointer hover:bg-gray-100 focus:outline-none  hover:bg-base-200"
								key={idx}
								onClick={() =>
									room.Participant[0] &&
									router.push(`/chat?id=${room.Participant[0].userId}`, undefined)
								}
							>
								<Image
									className="object-cover w-10 h-10 rounded-full"
									src={room.Participant[0]?.user.image || '/Missing_avatar.svg'}
									alt="username"
									width={100}
									height={100}
								/>
								<div className="w-full pb-2 hidden lg:block">
									<div className="flex justify-between">
										<span className="block ml-2 font-semibold text-gray-600">
											{room.Participant[0]?.user.name}
										</span>
										<span className="block ml-2 text-sm text-gray-600">
											{formatDistanceStrict(room.Message[0]?.sendAt || new Date(), new Date(), {
												addSuffix: true
											})}
										</span>
									</div>
									<span className="block ml-2 text-sm text-gray-600">
										{room.Message[0]?.message}
									</span>
								</div>
							</div>
						))}
				</div>
			</div>
		</div>
	);
};

export default ChatSidebar;
