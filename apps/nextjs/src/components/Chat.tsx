import useOnScreen from '../../hooks/useOnScreen';
import { useBearStore, useMessageCountStore } from '../utils/messsageStore';
import { trpc } from '../utils/trpc';
import { useChannel } from '@ably-labs/react-hooks';
import { useAuth } from '@clerk/nextjs';
import emojiRegex from 'emoji-regex';
import GraphemeSplitter from 'grapheme-splitter';
import Image from 'next/image';
import { useRouter } from 'next/router';
import React, { FC, MouseEvent, useEffect, useRef, useState } from 'react';
import { useInView } from 'react-intersection-observer';

const Chat: FC<{ id: string | undefined; rId: string | undefined; routerReady: boolean }> = ({
	id,
	rId,
	routerReady
}): JSX.Element => {
	const { userId, isSignedIn, isLoaded } = useAuth();
	const [messageText, setMessageText] = useState<string>('');

	const router = useRouter();
	const trpcUtils = trpc.useContext();
	const getRoom = trpc.chat.getRoom.useQuery({
		userId: rId as string
	});
	const createRoom = trpc.chat.createRoom.useMutation();
	const increasePopulation = useBearStore((state: any) => state.increasePopulation);
	const { addMessage }: any = useMessageCountStore();
	const [messages, setMessages] = useState<{ isSender: boolean; message: string }[]>([]);
	const [ablyMessages, setAblyMessages] = useState<
		{
			isSender: boolean;
			data: {
				roomId: string;
				message: string;
			};
		}[]
	>([]);
	const prevMessRouter = trpc.chat.getPreviousChats.useInfiniteQuery(
		{
			limit: 20,
			userId: rId || ':)',
			roomId: getRoom?.data?.room?.id
		},
		{
			getPreviousPageParam: (firstPage) => firstPage.nextCursor,
			getNextPageParam: (lastPage) => lastPage.nextCursor,
			select: (data) => ({
				pages: [...data.pages].reverse(),
				pageParams: [...data.pageParams].reverse()
			}),
			refetchOnWindowFocus: false,
			refetchOnMount: false,
			refetchOnReconnect: false,
			staleTime: Infinity
		}
	);

	const chatBoxRef = useRef<HTMLLIElement>(null);
	const lastTextVisible = useOnScreen(chatBoxRef);
	const containerRef = useRef<HTMLDivElement>(null);
	const { ref, inView } = useInView();

	useEffect(() => {
		containerRef?.current?.scrollIntoView({ behavior: 'smooth' });
	}, []);

	useEffect(() => {
		if (router.isReady) {
			setAblyMessages([]);
			trpcUtils.chat.invalidate();
		}
	}, [router]);

	useEffect(() => {
		if (inView && prevMessRouter.isFetched) {
			prevMessRouter.fetchNextPage();
		}
	}, [inView]);

	const [channel, ably] = useChannel(`chat:${userId}}`, (message) => {
		console.log(message);
		setAblyMessages((ablyMessages) => [
			...ablyMessages,
			{
				isSender: false,
				data: {
					roomId: message.data.roomId,
					message: message.data.message
				}
			}
		]);
	});

	const createRoomWrapper = () => {
		if (rId) {
			createRoom.mutate(
				{
					userId: rId
				},
				{
					onSuccess: (data) => {
						getRoom.refetch();
					}
				}
			);
		}
	};

	const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
		if (e.key === 'Enter') {
			handleSubmit();
		}
	};

	const handleSubmit = async () => {
		//console.log(routerReady && getRoom.isSuccess && getRoom.data.room && messageText !== '');
		if (routerReady && getRoom.isSuccess && getRoom.data.room && messageText !== '') {
			await ably.channels.get(`chat:${rId}`).publish({
				name: 'message',
				data: {
					roomId: getRoom.data.room?.id,
					message: messageText
				}
			});
			setAblyMessages([
				...ablyMessages,
				{
					isSender: true,
					data: {
						roomId: getRoom.data.room?.id,
						message: messageText
					}
				}
			]);
		}
		setMessageText('');
	};

	const splitter = new GraphemeSplitter();

	const nonBubble = (message: string): boolean => {
		const regex = emojiRegex();
		const length = splitter.splitGraphemes(message).length;
		return message.match(regex)?.length === length && length < 4;
	};

	useEffect(() => {
		console.log(lastTextVisible);
		if (chatBoxRef.current && !lastTextVisible) {
			chatBoxRef?.current?.scrollIntoView({ behavior: 'smooth' });
		}
	}, [ablyMessages]);

	useEffect(() => {
		if (
			prevMessRouter.isFetched &&
			prevMessRouter.data?.pages.length === 1 &&
			!prevMessRouter.isFetching
		) {
			console.log('fnmkeor');
			//chatBoxRef?.current?.scrollIntoView({ behavior: 'smooth' });
		}
	}, [prevMessRouter]);

	return (
		<div className="col-span-2 block">
			<div className="w-full">
				<div className="relative flex items-center p-3 border-b border-gray-300">
					{rId ? (
						<>
							<div className="">
								{!isLoaded && !isSignedIn ? (
									<Image
										className="object-cover w-16 h-16 rounded-full"
										src={getRoom.data?.user?.image || '/Missing_avatar.svg'}
										alt="Pic"
										width={40}
										height={40}
									/>
								) : (
									<p className="h-16 w-16 animate-pulse bg-gray-400 rounded-full"></p>
								)}
							</div>
							<span className="block ml-2 font-bold text-gray-600">
								{getRoom.data?.user?.name || 'No Name'}
							</span>
						</>
					) : (
						<div></div>
					)}
				</div>

				<div
					className={`relative w-full  overflow-y-auto h-[60vh] lg:h-[78vh] overflow:hidden  ${
						!getRoom?.data?.room?.id && 'flex justify-center items-center'
					} `}
				>
					{getRoom?.data?.room?.id ? (
						<ul className=" ">
							<li ref={ref}></li>
							{prevMessRouter.data &&
								isSignedIn &&
								prevMessRouter.data.pages.map((page, idx) => (
									<React.Fragment key={page.nextCursor?.sendAt.toISOString()}>
										{[...page.messages].reverse().map((message) => (
											<li
												key={message.id}
												className={`chat ${message.userId !== userId ? 'chat-start' : 'chat-end'}`}
											>
												<div
													className={` chat-bubble  ${
														!nonBubble(message.message)
															? `${
																	message.userId === userId
																		? 'chat-bubble-primary'
																		: 'bg-base-200 text-neutral'
															  }`
															: 'bg-transparent text-5xl'
													}`}
												>
													<span className="block">{message.message}</span>
												</div>
											</li>
										))}
									</React.Fragment>
								))}

							{ablyMessages.map((message, idx) => (
								<li key={idx} className={`chat ${!message.isSender ? 'chat-start' : 'chat-end'}`}>
									<div
										className={` chat-bubble  ${
											!nonBubble(message.data.message)
												? `${message.isSender ? 'chat-bubble-primary' : 'bg-base-200 text-neutral'}`
												: 'bg-transparent text-5xl'
										}`}
									>
										<span className="block">{message.data.message}</span>
									</div>
								</li>
							))}
							<li ref={chatBoxRef}></li>
						</ul>
					) : rId ? (
						<button
							className="btn btn-primary flex flex-col items-center justify-center"
							onClick={() => createRoomWrapper()}
						>
							START CHAT
						</button>
					) : (
						<button className="btn btn-primary flex flex-col items-center justify-center">
							SELECT A CHAT
						</button>
					)}
				</div>

				<div className="flex gap-2 items-center justify-between w-full p-3 " ref={containerRef}>
					<input
						type="text"
						placeholder="Message"
						value={messageText}
						onChange={(e) => setMessageText(e.target.value)}
						onKeyDown={(e) => handleKeyPress(e)}
						className="input w-full input-bordered"
						name="message"
						required
					/>

					<button type="submit" onClick={(e) => handleSubmit()}>
						<svg
							className="w-5 h-5 text-gray-500 origin-center transform rotate-90"
							xmlns="http://www.w3.org/2000/svg"
							viewBox="0 0 20 20"
							fill="currentColor"
						>
							<path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
						</svg>
					</button>
				</div>
			</div>
		</div>
	);
};

export default Chat;
