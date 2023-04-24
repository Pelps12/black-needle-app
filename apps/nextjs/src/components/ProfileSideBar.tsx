import { useSession } from 'next-auth/react';
import { NextPage } from 'next/types';
import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import Modal from './Modal';
import ProfileEdit from './ProfileEdit';
import { useRouter } from 'next/router';
import { trpc } from '../utils/trpc';
const ProfileSideBar: NextPage = () => {
	const { data: session, status } = useSession();
	const [isOpen, setIsOpen] = useState(false);
	const router = useRouter();
	const stripePageMut = trpc.user.createStripeAccountLink.useMutation();
	const { newUser } = router.query;
	const newUserString =
		typeof newUser === 'string' ? newUser : typeof newUser === 'undefined' ? ':)' : newUser[0]!;

	useEffect(() => {
		if (newUserString === 'true') {
			openModal();
		}
	}, [router.query]);
	function closeModal() {
		setIsOpen(false);
	}

	function openModal() {
		setIsOpen(true);
	}

	const handleSellerStripe = () => {
		stripePageMut.mutate(undefined, {
			onSuccess: (data) => {
				window.open(data.url, '_self');
			}
		});
	};
	return (
		<div className="border-b lg:border-b-0 border-r  border-gray-300 lg:col-span-1">
			<div className="m-3 ">
				<div className="flex items-center gap-5 my-3">
					{status !== 'loading' ? (
						<div className="avatar">
							<div className="w-24 rounded-full">
								<Image
									className="rounded-full w-auto object-cover"
									src={session?.user?.image || '/Missing_avatar.svg'}
									alt="User"
									width={100}
									height={100}
								/>
							</div>
						</div>
					) : (
						<p className="h-[100px] w-[100px] animate-pulse bg-gray-400 rounded-full"></p>
					)}

					<div className="flex flex-col gap-2 max-w-sm">
						{' '}
						{session?.user ? (
							<span className="text-2xl uppercase font-bold ">{session?.user.name}</span>
						) : (
							<p className="h-[2rem] w-32 animate-pulse bg-gray-400 rounded-md" />
						)}
					</div>
				</div>

				<div className="flex justify-end gap-2">
					{session?.user?.role !== 'BUYER' && (
						<button className="btn btn-sm mr-2 btn-primary" onClick={(e) => handleSellerStripe()}>
							{stripePageMut.isLoading && (
								<svg
									className=" h-5 w-5 animate-spin text-white"
									xmlns="http://www.w3.org/2000/svg"
									fill="none"
									viewBox="0 0 24 24"
								>
									<circle
										className="opacity-25"
										cx="12"
										cy="12"
										r="10"
										stroke="currentColor"
										strokeWidth="4"
									></circle>
									<path
										className="opacity-75"
										fill="currentColor"
										d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
									></path>
								</svg>
							)}
							View Stripe Account
						</button>
					)}
					<button className="btn btn-sm mr-0 btn-primary" onClick={openModal}>
						Edit Profile
					</button>
				</div>

				<Modal isOpen={isOpen} closeModal={closeModal}>
					<ProfileEdit isOpen={isOpen} session={session} closeModal={closeModal} />
				</Modal>
			</div>
		</div>
	);
};

export default ProfileSideBar;
