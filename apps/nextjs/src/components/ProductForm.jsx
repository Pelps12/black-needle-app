import 'react-datepicker/dist/react-datepicker.css';

const ProductForm = ({
	isServiceSelected,

	startDate,
	setStartDate,
	disableAddButton,
	handleAddPricesChanges,
	handleAddPrices,
	closeModal,
	categories
}) => {
	return (
		<>
			<div className="w-full h-auto  block p-4 flex items-center justify-center overflow-hidden">
				<div className="py-6 px-10 sm:max-w-md w-full ">
					<div className=" whitespace-nowrap sm:text-3xl text-2xl font-semibold text-center text-sky-600  mb-12">
						Add Product
					</div>
					<div className="">
						<form onSubmit={handleAddPrices} id="price-form" action="">
							<div>
								<input
									required
									onChange={handleAddPricesChanges}
									type="text"
									name="name"
									className="input mb-4 input-primary input-ghost focus:outline-none  w-full pb-2  placeholder-gray-500"
									placeholder="Product name "
								/>
							</div>
							<div>
								<div>
									<div>
										{/* <label for="price" className="block text-sm font-medium text-gray-700">Price</label> */}
										<div className="relative mt-1 rounded-md shadow-sm">
											<div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
												<span className="text-gray-500 sm:text-sm">$</span>
											</div>
											<input
												required
												onChange={handleAddPricesChanges}
												type="number"
												name="amount"
												id="price"
												className=" input mb-4 input-ghost input-primary focus:outline-none  w-full   placeholder-gray-500 block w-full rounded-md border-gray-300 pl-7 pr-12 sm:text-sm"
												placeholder="0.00"
											/>
										</div>
									</div>
								</div>
							</div>
							<div>
								<select
									required
									onChange={handleAddPricesChanges}
									name="categoryId"
									className="select select-primary focus:outline-none mb-4  w-full pb-2  placeholder-gray-500 mb-8 "
									defaultValue={'Category'}
								>
									<option disabled defaultValue>
										Category
									</option>
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
									onChange={handleAddPricesChanges}
									defaultValue={'Type of Product'}
									name="type"
									className="select select-primary focus:outline-none mb-4  w-full pb-2  placeholder-gray-500 mb-8 "
								>
									<option disabled defaultValue>
										Type of Product
									</option>
									<option>GOOD</option>
									<option>SERVICE</option>
								</select>
							</div>
							{isServiceSelected && (
								<div>
									<select
										required
										onChange={handleAddPricesChanges}
										defaultValue={'Service Duration'}
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
									{/* <DatePicker
								className= "select select-primary focus:outline-none mb-4  w-full pb-2  placeholder-gray-500 mb-8"
									
									placeholderText="Click to select duration"
									onChange={(date) => {
										setTime(new Date(date).toLocaleTimeString('en-US'))
										setStartDate(date)
									}}
									showTimeSelect
									showTimeSelectOnly
									timeIntervals={30}
									timeCaption="Time"
									dateFormat="h:mm aa"
									name="time"
									selected={startDate}
								/> */}
								</div>
							)}

							<div className="flex justify-center my-6">
								<button
									disabled={disableAddButton}
									onClick={closeModal}
									type="submit"
									className="btn rounded-full  p-3 w-full sm:w-56   btn-primary  text-white text-lg font-semibold "
								>
									Add
								</button>
							</div>
						</form>
					</div>
				</div>
			</div>
		</>
	);
};

export default ProductForm;
