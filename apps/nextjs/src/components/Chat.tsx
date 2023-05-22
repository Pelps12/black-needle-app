import useOnScreen from '../../hooks/useOnScreen';
import { useBearStore, useMessageCountStore } from '../utils/messsageStore';
import { trpc } from '../utils/trpc';
import { useChannel } from '@ably-labs/react-hooks';
import { useAuth, SignedIn } from '@clerk/nextjs';
import emojiRegex from 'emoji-regex';
import GraphemeSplitter from 'grapheme-splitter';
import Image from 'next/image';
import { useRouter } from 'next/router';
import React, { FC, useEffect, useRef, useState } from 'react';
import { useInView } from 'react-intersection-observer';

const Chat: FC<{ id: string | undefined; rId: string | undefined; routerReady: boolean }> = ({
	id,
	rId,
	routerReady
}) => {
	const { userId, isSignedIn, isLoaded } = useAuth();
	const [messageText, setMessageText] = useState<string>('');
	const [selectedFile, setSelectedFile] = useState<File>();
	const [isFilePicked, setIsFilePicked] = useState(false);

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

	const [channel, ably] = useChannel(`chat:${id}`, (message) => {
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

	const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
		const file = (event?.target?.files && event?.target?.files[0]) ?? undefined;
		setSelectedFile(file);
		setIsFilePicked(true);
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
		<SignedIn>
			<div className="col-span-2 block">
				<div className="w-full">
					<div className="relative flex items-center p-3 border-b border-gray-300">
						{rId ? (
							<>
								<div className="">
									{isLoaded && isSignedIn ? (
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
													className={`chat ${
														message.userId !== userId ? 'chat-start' : 'chat-end'
													}`}
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
													? `${
															message.isSender ? 'chat-bubble-primary' : 'bg-base-200 text-neutral'
													  }`
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
						{!selectedFile && (
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
						)}
						{selectedFile && (
							<div className="w-full">
								<Image
									src={URL.createObjectURL(selectedFile)}
									alt=":)"
									width={300}
									height={400}
									className="w-52 h-60"
								/>
							</div>
						)}

						<input type="file" id="fileupload" onChange={handleImageUpload} hidden />
						<label htmlFor="fileupload">
							<svg
								className="w-5 h-5 text-gray-500"
								version="1.1"
								id="Capa_1"
								xmlns="http://www.w3.org/2000/svg"
								xmlnsXlink="http://www.w3.org/1999/xlink"
								viewBox="0 0 184.69 184.69"
								xmlSpace="preserve"
								fill="#000000"
							>
								<g id="SVGRepo_bgCarrier" stroke-width="0"></g>
								<g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g>
								<g id="SVGRepo_iconCarrier">
									<g>
										<g>
											<g>
												<path
													className="fill-gray-500"
													d="M149.968,50.186c-8.017-14.308-23.796-22.515-40.717-19.813 C102.609,16.43,88.713,7.576,73.087,7.576c-22.117,0-40.112,17.994-40.112,40.115c0,0.913,0.036,1.854,0.118,2.834 C14.004,54.875,0,72.11,0,91.959c0,23.456,19.082,42.535,42.538,42.535h33.623v-7.025H42.538 c-19.583,0-35.509-15.929-35.509-35.509c0-17.526,13.084-32.621,30.442-35.105c0.931-0.132,1.768-0.633,2.326-1.392 c0.555-0.755,0.795-1.704,0.644-2.63c-0.297-1.904-0.447-3.582-0.447-5.139c0-18.249,14.852-33.094,33.094-33.094 c13.703,0,25.789,8.26,30.803,21.04c0.63,1.621,2.351,2.534,4.058,2.14c15.425-3.568,29.919,3.883,36.604,17.168 c0.508,1.027,1.503,1.736,2.641,1.897c17.368,2.473,30.481,17.569,30.481,35.112c0,19.58-15.937,35.509-35.52,35.509H97.391 v7.025h44.761c23.459,0,42.538-19.079,42.538-42.535C184.69,71.545,169.884,53.901,149.968,50.186z"
												></path>
											</g>
											<g>
												<path
													className="fill-gray-500"
													d="M108.586,90.201c1.406-1.403,1.406-3.672,0-5.075L88.541,65.078 c-0.701-0.698-1.614-1.045-2.534-1.045l-0.064,0.011c-0.018,0-0.036-0.011-0.054-0.011c-0.931,0-1.85,0.361-2.534,1.045 L63.31,85.127c-1.403,1.403-1.403,3.672,0,5.075c1.403,1.406,3.672,1.406,5.075,0L82.296,76.29v97.227 c0,1.99,1.603,3.597,3.593,3.597c1.979,0,3.59-1.607,3.59-3.597V76.165l14.033,14.036 C104.91,91.608,107.183,91.608,108.586,90.201z"
												></path>
											</g>
										</g>
									</g>
								</g>
							</svg>
						</label>

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
		</SignedIn>
	);
};

export default Chat;
