import { trpc } from '../utils/trpc';
import { env } from '@acme/env-config/env';
import React, { useEffect } from 'react';

const ShoppingCart = ({ setBears, deleteProducts, products, setIsCart }) => {
	const checkoutMut = trpc.cart.checkout.useMutation();

	const processCheckout = async () => {
		console.log(products);
		products.data.length > 0 &&
			(await checkoutMut.mutateAsync(undefined, {
				onSuccess: (data) => {
					window.open(`${env.NEXT_PUBLIC_URL}/profile`, '_self');
				}
			}));
		products.refetch();
	};

	const onClickCancel = () => {
		setIsCart(false);
		console.log(products.data);
		setBears(products.data?.length || 0);
	};
	const onClickRemove = async (prod) => {
		await deleteProducts.mutateAsync({
			priceId: prod.priceId
		});
		products.refetch();
		setBears(products.data.length);
	};
	return (
		<>
			<div className="relative z-10 " role="dialog">
				<div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"></div>

				<div className="fixed inset-0 overflow-hidden">
					<div className="absolute inset-0 overflow-hidden">
						<div className="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10">
							<div className="pointer-events-auto w-screen max-w-md">
								<div className="flex h-auto flex-col overflow-y-scroll bg-white shadow-xl rounded-bl-lg">
									<div className="flex-1 overflow-y-auto py-6 px-4 sm:px-6">
										<div className="flex items-start justify-between">
											<h2 className="text-lg font-medium text-gray-900" id="slide-over-title">
												Shopping cart
											</h2>
											<div className="ml-3 flex h-7 items-center">
												<button
													onClick={onClickCancel}
													type="button"
													className="-m-2 p-2 text-gray-400 hover:text-gray-500"
												>
													<span className="sr-only">Close panel</span>

													<svg
														className="h-6 w-6"
														xmlns="http://www.w3.org/2000/svg"
														fill="none"
														viewBox="0 0 24 24"
														strokeWidth="1.5"
														stroke="currentColor"
													>
														<path
															strokeLinecap="round"
															strokeLinejoin="round"
															d="M6 18L18 6M6 6l12 12"
														/>
													</svg>
												</button>
											</div>
										</div>

										<div className="mt-8">
											<div className="flow-root">
												<ul role="list" className="-my-6 divide-y divide-gray-200">
													{products.data &&
														products.data != undefined &&
														products.data.map((prod) => (
															<li key={prod.priceId} className="flex py-6">
																<div className="h-24 w-24 flex-shrink-0 overflow-hidden rounded-md border border-gray-200">
																	<img
																		src={prod.price.category.Image[0].link}
																		alt="Salmon orange fabric pouch with match zipper, gray zipper pull, and adjustable hip belt."
																		className="h-full w-full object-cover object-center"
																	/>
																</div>
																<div className="ml-4 flex flex-1 flex-col">
																	<div>
																		<div className="flex justify-between text-base font-medium text-gray-900">
																			<h3>
																				<a href="#">{prod.price.name}</a>
																			</h3>
																			<p className="ml-4">${prod.price.amount}</p>
																		</div>
																		{/* <p className="mt-1 text-sm text-gray-500">Salmon</p> */}
																	</div>
																	<div className="flex flex-1 items-end justify-between text-sm">
																		<p className="text-gray-500">Qty {prod.quantity}</p>

																		<div className="flex">
																			<button
																				onClick={() => onClickRemove(prod)}
																				type="button"
																				className="font-medium text-secondary"
																			>
																				Remove
																			</button>
																		</div>
																	</div>
																</div>
															</li>
														))}
												</ul>
											</div>
										</div>
									</div>

									<div className="border-t border-gray-200 py-6 px-4 sm:px-6">
										<div className="flex justify-between text-base font-medium text-gray-900">
											<p>Subtotal</p>
											<p>
												$
												{products.data?.reduce((accumulator, value) => {
													return accumulator + value.price.amount * value.quantity;
												}, 0)}
											</p>
										</div>
										<p className="mt-0.5 text-sm text-gray-500">
											Service Fee calculated during payment
										</p>
										<div className="mt-6 ">
											<button
												href="#"
												onClick={(e) => processCheckout()}
												className={`btn flex btn-primary w-full ${
													(checkoutMut.isLoading || products?.data?.length <= 0) && 'btn-disabled'
												}`}
											>
												{checkoutMut.isLoading && (
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
												Add to Orders
											</button>
										</div>
										<div className="mt-6 flex justify-center text-center text-sm text-gray-500">
											<p>
												<span className="font-bold text-neutral">Note: </span> Payment is not
												required till seller&apos;s approval
											</p>
										</div>
										<div className="mt-6 flex justify-center text-center text-sm text-gray-500">
											<p>
												or{' '}
												<button
													type="button"
													className="font-medium text-secondary"
													onClick={onClickCancel}
												>
													Continue Shopping
													<span> &rarr;</span>
												</button>
											</p>
										</div>
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</>
	);
};

export default ShoppingCart;
