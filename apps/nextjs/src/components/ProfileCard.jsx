import React, { useEffect, useState } from 'react';
import avater from '../../public/avatar.png';
import Image from 'next/image';
import GalleryTab from './GalleryTab';
import PricesTab from './PricesTab';

const ProfileCard = ({ setActive, seller }) => {
	useEffect(() => {
		console.log(seller);
	}, [seller]);

	return (
		<>
			<div className=" bg-base-100 ">
				<div className="  p-3 rounded-b-3xl">
					<div className="grid grid-flow-col items-center rounded-b-3xl rounded-full space-y-5 gap-3 md:gap-5 py-4 max-w-md mx-auto justify-start">
						{seller ? (
							<Image
								className="rounded-full w-[100px] h-[100px] object-cover"
								src={seller?.image}
								alt="User"
								width={100}
								height={100}
							/>
						) : (
							<p className="h-[100px] w-[100px] animate-pulse bg-gray-400 rounded-full"></p>
						)}

						<div className="flex flex-col gap-2 max-w-sm">
							{' '}
							{seller ? (
								<>
									<span className="text-2xl uppercase font-bold text-primary">{seller.name}</span>
									<a className="btn btn-sm btn-secondary" href={`/chat?id=${seller.id}`}>
										Contact
									</a>
								</>
							) : (
								<p className="h-[2rem] w-32 animate-pulse bg-gray-400 rounded-md" />
							)}
						</div>
					</div>
				</div>
			</div>
		</>
	);
};

export default ProfileCard;
