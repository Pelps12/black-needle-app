import ImageWithFallback from './Utils/ImageWithFallback';
import Image from 'next/image';
import React, { useEffect, useMemo, useState } from 'react';
import { useInterval } from 'react-use';

const ImageCarousel = ({
	images,
	currentIndex,
	showing
}: {
	images: string[];
	currentIndex: number;
	showing?: boolean;
}) => {
	const currentImage = useMemo(() => {
		return images[currentIndex];
	}, [currentIndex]);

	return (
		<div className="">
			<ImageWithFallback
				className={`transition ease-in duration-600 w-[900px] h-auto rounded-xl object-cover aspect-[4/3] ${
					showing !== undefined && !showing ? 'opacity-0' : 'opacity-100'
				}`}
				src={currentImage ?? ''}
				alt="Image Description"
				width={900}
				height={700}
			/>
		</div>
	);
};

export default ImageCarousel;
