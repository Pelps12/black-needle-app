import React, { useEffect, useRef } from 'react';
import { NextSeo } from 'next-seo';
import Link from 'next/link';
import { env } from '../env/client.mjs';
import { motion } from 'framer-motion';

const JoinPage = () => {
	const canvasRef = useRef<HTMLCanvasElement>(null);
	const securityRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		const html = document.documentElement;
		const canvas = canvasRef.current;
		const context = canvasRef.current?.getContext('2d');
		if (canvas && context && securityRef.current) {
			const frameCount = 173;
			const currentFrame = (index: number) =>
				`https://r2.sakpa.co/padlock_images/image-${index.toString().padStart(4, '0')}.png`;

			const preloadImages = () => {
				for (let i = 1; i < frameCount; i++) {
					for (let j = 0; j < 3; j++) {
						const img = new Image();
						img.src = currentFrame(i);
					}
				}
			};

			const img = new Image();
			img.src = currentFrame(1);
			canvas.width = 234;
			canvas.height = 234;
			img.onload = function () {
				context.drawImage(img, 0, 0);
			};

			const updateImage = (index: number) => {
				img.src = currentFrame(index);
				context.drawImage(img, 0, 0);
			};

			window.addEventListener('scroll', () => {
				const scrollTop = html.scrollTop;
				const maxScrollTop =
					window.pageYOffset + (securityRef.current?.getBoundingClientRect()?.top ?? 0);
				const scrollFraction = scrollTop / maxScrollTop;
				const frameIndex = Math.min(frameCount - 1, Math.ceil(scrollFraction * frameCount));

				requestAnimationFrame(() => updateImage(frameIndex + 1));
			});

			preloadImages();
		}
	}, []);
	return (
		<>
			<NextSeo
				title="Join Sakpa"
				description="Get services from fellow students on your campus."
				openGraph={{
					title: 'Fuel your hustle | Sakpa',
					description: 'Get to offering your services stress free',
					url: `https://${env.NEXT_PUBLIC_URL}`,
					images: [
						{
							url: 'https://ucarecdn.com/2af64698-0319-4e34-9182-35e82d37cdf5/',
							alt: 'Benefits for Seller'
						}
					]
				}}
			/>
			<motion.div
				initial={{ opacity: 0, y: 20 }}
				whileInView={{ opacity: 1, y: 0 }}
				transition={{ delay: 0.1, duration: 0.4 }}
			>
				<section className="max-w-7xl mx-auto">
					<div className="card lg:card-side bg-base-100 justify-between lg:py-12">
						<div className="card-body max-w-md">
							<h1 className="card-title max-w-2xl mb-4 text-4xl font-extrabold tracking-tight leading-none md:text-5xl xl:text-6xl ">
								<div>
									Fuel your hustle with <span className="text-primary">Sakpa</span>
								</div>
							</h1>
							<p className="max-w-2xl mb-6 font-light text-gray-500 lg:mb-8 md:text-lg lg:text-xl ">
								With Sakpa, you can stop holding off on that side hustle you&apos;ve been thinking
								of starting all semester.
							</p>
							<div className="card-actions justify-start">
								<Link href="/register/seller" className="btn btn-primary px-5 py-3 mr-3">
									Get started
									<svg
										className="w-5 h-5 ml-2 -mr-1"
										fill="currentColor"
										viewBox="0 0 20 20"
										xmlns="http://www.w3.org/2000/svg"
									>
										<path
											fill-rule="evenodd"
											d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z"
											clip-rule="evenodd"
										></path>
									</svg>
								</Link>
							</div>
						</div>
						<div className="p-6">
							<figure>
								<img
									src="https://ucarecdn.com/99c3d630-7c20-439f-acbf-b1f9cfc75593/"
									className="object-cover h-96 w-auto  rounded-md"
									alt="Album"
								/>
							</figure>
						</div>
					</div>

					<div className="card lg:card-side bg-base-100 justify-between lg:py-12" ref={securityRef}>
						<div className="card-body max-w-md">
							<canvas
								className="rounded-full mx-auto border-secondary border-4"
								ref={canvasRef}
								width={100}
							></canvas>
						</div>
						<motion.div className="card-body max-w-lg">
							<h1 className="card-title max-w-2xl mb-4 text-4xl font-extrabold tracking-tight leading-none md:text-5xl xl:text-6xl ">
								<div>
									<span className="text-primary rotate-12 text-6xl md:text-7xl xl:text-8xl">$</span>
									ecurity deposits
								</div>
							</h1>
							<p className="max-w-2xl mb-6 font-light text-gray-500 lg:mb-8 md:text-lg lg:text-xl ">
								Your time is valuable, and we recognize that, so you can be paid at least a
								percentage you decide, even on cancellations.
							</p>

							<div className="card-actions justify-start">
								<Link href="/register/seller" className="btn btn-primary px-5 py-3 mr-3">
									WANNA JOIN?
									<svg
										className="w-5 h-5 ml-2 -mr-1"
										fill="currentColor"
										viewBox="0 0 20 20"
										xmlns="http://www.w3.org/2000/svg"
									>
										<path
											fill-rule="evenodd"
											d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z"
											clip-rule="evenodd"
										></path>
									</svg>
								</Link>
							</div>
						</motion.div>
					</div>

					<div className="card lg:card-side bg-base-100 justify-between py-12">
						<div className="card-body max-w-md">
							<h1 className="card-title max-w-2xl mb-4 text-4xl font-extrabold tracking-tight leading-none md:text-5xl xl:text-6xl ">
								<div>All-in-One management solution </div>
							</h1>
							<p className="max-w-2xl mb-6 font-light text-gray-500 lg:mb-8 md:text-lg lg:text-xl ">
								Leave the hassle of scheduling, reminders, and payments to us, while you focus on
								the quality of your service.
							</p>
							<div className="card-actions justify-start">
								<Link href="/register/seller" className="btn btn-primary px-5 py-3 mr-3">
									Check it out
									<svg
										className="w-5 h-5 ml-2 -mr-1"
										fill="currentColor"
										viewBox="0 0 20 20"
										xmlns="http://www.w3.org/2000/svg"
									>
										<path
											fill-rule="evenodd"
											d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z"
											clip-rule="evenodd"
										></path>
									</svg>
								</Link>
							</div>
						</div>
						<div className="p-6">
							<figure>
								<img
									src="https://ucarecdn.com/f6501077-59b0-4ac2-8699-e6aff010bc2c/"
									className="object-cover h-96 w-auto  rounded-md"
									alt="Album"
								/>
							</figure>
						</div>
					</div>
					<div className="flex flex-col justify-center items-center gap-3">
						<h1 className="card-title text-4xl font-extrabold tracking-tight leading-none md:text-5xl xl:text-6xl">
							Have <span className="text-secondary">questions?</span>
						</h1>
						<p className="text-lg md:text-xl"> Send an email to oluwapelps@gmail.com :)</p>
					</div>
				</section>
			</motion.div>
		</>
	);
};

export default JoinPage;
