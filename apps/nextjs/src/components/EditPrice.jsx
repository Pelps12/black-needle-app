import { Dialog, Transition } from '@headlessui/react';
import { Fragment, useEffect, useState } from 'react';

const EditPrice = ({
	isEditServiceSelected,
	handleEditFormSubmit,
	handleEditFormChange,
	closeEditModal,
	isEditOpen,
	categories,
	editPrice,
	disableSaveButton
}) => {
	const categoryIndex = categories.findIndex((cate) => cate.id == editPrice.categoryId);
	useEffect(() => {
		console.log(categories[categoryIndex].name);
	}, []);

	return (
		<>
			{/* <div className="fixed inset-0 flex items-center justify-center">
        <button
          type="button"
          onClick={openModal}
          className="rounded-md bg-black bg-opacity-20 px-4 py-2 text-sm font-medium text-white hover:bg-opacity-30 focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75"
        >
          Open dialog
        </button>
      </div> */}

			<Transition appear show={isEditOpen} as={Fragment}>
				<Dialog as="div" className="relative z-10" onClose={closeEditModal}>
					<Transition.Child
						as={Fragment}
						enter="ease-out duration-300"
						enterFrom="opacity-0"
						enterTo="opacity-100"
						leave="ease-in duration-200"
						leaveFrom="opacity-100"
						leaveTo="opacity-0"
					>
						<div className="fixed inset-0 bg-black bg-opacity-25" />
					</Transition.Child>

					<div className="fixed inset-0 overflow-y-auto">
						<div className="flex min-h-full items-center justify-center p-4 text-center">
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
									<label
										htmlFor="my-modal-3"
										onClick={closeEditModal}
										className="btn btn-sm btn-circle absolute right-2 top-2"
									>
										✕
									</label>
									<div className="w-full h-auto  block p-4 flex items-center justify-center overflow-hidden">
										<div className="py-6 px-10 sm:max-w-md w-full ">
											<div className=" whitespace-nowrap sm:text-3xl text-2xl font-semibold text-center text-sky-600  mb-12">
												Edit Product
											</div>
											<div className="">
												<form onSubmit={handleEditFormSubmit}>
													<div>
														<input
															required
															value={editPrice.name}
															onChange={handleEditFormChange}
															type="text"
															name="name"
															className="input mb-4 input-primary input-ghost focus:outline-none  w-full pb-2  placeholder-gray-500"
															placeholder="Product name "
														/>
													</div>
													<div>
														<div>
															{/* <label for="price" className="block text-sm font-medium text-gray-700">Price</label> */}
															<div className="relative mt-1 rounded-md shadow-sm">
																<div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
																	<span className="text-gray-500 sm:text-sm">$</span>
																</div>
																<input
																	required
																	value={editPrice.amount}
																	onChange={handleEditFormChange}
																	type="number"
																	name="amount"
																	className=" input mb-4 input-ghost input-primary focus:outline-none  w-full   placeholder-gray-500 block w-full rounded-md border-gray-300 pl-7 pr-12 sm:text-sm"
																	placeholder="0.00"
																/>
																{/* <div className="absolute inset-y-0 right-0 flex items-center">
      <label for="currency" className="sr-only">Currency</label>
      <select id="currency" name="currency" className="h-full rounded-md border-transparent bg-transparent py-0 pl-2 pr-7 text-gray-500 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm">
        <option>USD</option>
        <option>CAD</option>
        <option>EUR</option>
      </select>
    </div> */}
															</div>
														</div>
													</div>
													<div>
														<select
															required
															value={editPrice.categoryId}
															onChange={handleEditFormChange}
															name="categoryId"
															defaultValue={categories[categoryIndex].id}
															className="select select-primary focus:outline-none mb-4  w-full pb-2  placeholder-gray-500 mb-8 "
															// defaultValue={'Category'}
														>
															<option disabled>Category</option>
															{categories != null ? (
																categories.map((post) => (
																	<option value={post.id} key={post.id}>
																		{' '}
																		{post.name}{' '}
																	</option>
																))
															) : (
																<option>
																	<a>Add Category</a>
																</option>
															)}
														</select>
													</div>
													<div>
														<select
															required
															onChange={handleEditFormChange}
															value={editPrice.type}
															name="type"
															className="select select-primary focus:outline-none mb-4  w-full pb-2  placeholder-gray-500 mb-8 "
														>
															<option disabled>Type of Product</option>
															<option>GOOD</option>
															<option>SERVICE</option>
														</select>
													</div>
													{ (isEditServiceSelected === true || editPrice.duration != null) &&  <div>
								<select
									required
									onChange={handleEditFormChange}
									value={editPrice.duration}
									name="duration"
									className="select select-primary focus:outline-none mb-4  w-full pb-2  placeholder-gray-500 mb-8 "
								>
									<option disabled defaultValue>
										Service Duration
									</option>
									<option value="1800">30 min</option>
									<option value="3600">1 hr</option>
									<option value="5400">1 hr 30 min</option>
									<option value="7200">2 hr</option>
									<option value="9000">2 hr 30 min</option>
									<option value="10800">3 hr</option>
									<option value="12600">3 hr 30 min</option>
									<option value="14400">4 hr</option>
									<option value="16200">4 hr 30 min</option>
									<option value="18000">5 hr</option>
								</select> 
								</div>}
													<div className="flex justify-center my-6">
														<button
															disabled={disableSaveButton}
															type="submit"
															className="btn rounded-full  p-3 w-full sm:w-56   btn-primary  text-white text-lg font-semibold "
														>
															Save
														</button>
													</div>
												</form>
											</div>
										</div>
									</div>
								</Dialog.Panel>
							</Transition.Child>
						</div>
					</div>
				</Dialog>
			</Transition>
		</>
	);
};

export default EditPrice;
