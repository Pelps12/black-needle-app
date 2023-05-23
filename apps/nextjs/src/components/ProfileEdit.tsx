import { trpc } from '../utils/trpc';
import { env } from '@acme/env-config/env';
import { UserProfile, useAuth, useUser } from '@clerk/nextjs';
import { Dialog, Tab, Transition } from '@headlessui/react';
import React, { Fragment, useEffect, useRef, useState } from 'react';

const ProfileEdit = ({
	isOpen,

	closeModal
}: {
	isOpen: boolean;

	closeModal: () => void;
}) => {
	return (
		<>
			<Transition.Child
				as={Fragment}
				enter="ease-out duration-300"
				enterFrom="opacity-0 scale-95"
				enterTo="opacity-100 scale-100"
				leave="ease-in duration-200"
				leaveFrom="opacity-100 scale-100"
				leaveTo="opacity-0 scale-95"
			>
				<Dialog.Panel className="w-auto transform overflow-hidden  text-left align-middle  transition-all">
					<UserProfile />
				</Dialog.Panel>
			</Transition.Child>
		</>
	);
};

export default ProfileEdit;
