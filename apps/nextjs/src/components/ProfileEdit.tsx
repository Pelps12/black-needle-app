import { Dialog, Tab, Transition } from '@headlessui/react';
import React, { Fragment, useEffect, useRef, useState } from 'react';
import { useSession } from 'next-auth/react';
import { Session } from 'next-auth';
import { trpc } from '../utils/trpc';
import { env } from '../env/client.mjs';

function classNames(...classes: string[]) {
	return classes.filter(Boolean).join(' ');
}

const ProfileEdit = ({
	isOpen,
	session,
	closeModal
}: {
	isOpen: boolean;
	session: Session | null;
	closeModal: () => void;
}) => {
	const [imageButton, setImageButton] = useState(false);
	const [selectedFile, setSelectedFile] = useState<File>();
	const [selectedDataURI, setSelectedDataURI] = useState<string>();
	const [name, setName] = useState(session?.user?.name);

	const updateUser = trpc.user.updateUser.useMutation();
	const getUser = trpc.user.getMe.useQuery(undefined, {
		staleTime: undefined,
		onSuccess: (data) => {
			setPhoneNumber(data?.phoneNumber || '');
			console.log(
				name === session?.user?.name && !selectedFile && !phoneNumber
					? true
					: phoneNumber === (getUser.data?.phoneNumber || '')
			);
		}
	});
	const [phoneNumber, setPhoneNumber] = useState<string>('');

	function onSelectFile(images: FileList | null) {
		if (images && images.length > 0) {
			//console.log(image.link);

			setSelectedFile(images[0]);
			//setCrop(undefined); // Makes crop preview update between images.

			if (images[0]) {
				setSelectedDataURI(URL.createObjectURL(images[0]));
				console.log(images[0]);
			}
		}
	}
	const imageUpload = async (file: File) => {
		const formData = new FormData();
		formData.append('UPLOADCARE_PUB_KEY', env.NEXT_PUBLIC_UPLOADCARE_PUB_KEY);
		formData.append('UPLOADCARE_STORE', 'auto');

		formData.append(`my_file.jpg`, file, file.name);

		const response = await fetch('https://upload.uploadcare.com/base/', {
			method: 'POST',
			body: formData
		});
		if (response.ok) {
			console.log(response);
			const result = await response.json();
			console.log(result);
			const cdnUrl = `https://ucarecdn.com/${result['my_file.jpg']}/`;
			return cdnUrl;
		} else {
			console.log(await response.text(), response.status);
		}
	};

	const submitChanges = async () => {
		if (selectedFile) {
			const link = await imageUpload(selectedFile);

			if (link) {
				updateUser
					.mutateAsync({
						image: link,
						...(name ? { name: name } : {}),
						phoneNumber: phoneNumber === '' ? undefined : phoneNumber
					})
					.then(() => {
						closeModal();
					});
			}
		} else {
			if (name) {
				updateUser
					.mutateAsync({
						name: name,
						phoneNumber: phoneNumber === '' ? undefined : phoneNumber
					})
					.then(() => {
						closeModal();
					});
			}
		}
	};
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
				<Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
					<Dialog.Title as="h3" className="text-lg font-medium leading-6 text-gray-900">
						Edit Profile
					</Dialog.Title>
					<div></div>

					<div className="mt-2">
						<div className="relative ">
							<label htmlFor="file-input">
								<div className="h-24 w-24 absolute flex justify-center items-center ">
									<img
										src={'./photochange.svg'}
										className={`ml-0 rounded-full h-12 w-12 ${
											imageButton ? 'opacity-100' : 'opacity-75'
										} `}
										onFocus={() => setImageButton(true)}
										onBlur={() => setImageButton(false)}
										alt=""
									/>
								</div>
							</label>

							<img
								src={selectedDataURI || session?.user?.image || '/Missing_avatar.svg'}
								className="mx-auto cursor-pointer ml-0   rounded-full h-24 w-24 object-cover"
								alt=""
							/>
						</div>

						<input
							id="file-input"
							type="file"
							className="hidden"
							accept="image/png, image/jpeg"
							onChange={(e) => onSelectFile(e.target.files)}
						/>

						<div className="my-2">
							<input
								type="text"
								className="input input-secondary"
								placeholder="Name"
								value={name || undefined}
								onChange={(e) => setName(e.target.value)}
							/>
						</div>
						<div className="my-2">
							<input
								type="text"
								className="input input-secondary"
								placeholder="Phone Number"
								value={phoneNumber}
								onChange={(e) => setPhoneNumber(e.target.value)}
							/>
						</div>
						<div className="flex justify-end">
							<button
								className={`btn btn-sm  mr-0 text-right ${
									(name === session?.user?.name &&
										!selectedFile &&
										(!phoneNumber ? true : phoneNumber === (getUser.data?.phoneNumber || ':)'))) ||
									updateUser.isLoading
										? 'btn-disabled'
										: 'btn-primary'
								}`}
								onClick={() => submitChanges()}
							>
								{updateUser.isLoading && (
									<svg
										className="mr-3 h-5 w-5 animate-spin text-white"
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
								CHANGE
							</button>
						</div>
					</div>
				</Dialog.Panel>
			</Transition.Child>
		</>
	);
};

export default ProfileEdit;
