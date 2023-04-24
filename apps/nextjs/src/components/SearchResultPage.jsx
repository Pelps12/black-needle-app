import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Image from 'next/image';
import Link from 'next/link';

const SearchResultPage = ({ filterValue, UserStatus, setFilterValue, searchResults }) => {
	const router = useRouter();
	const handleClick = (seller, priceId) => {
		router.push({
			pathname: `/seller/${seller}`,
			query: { active: 'PRICES', productID: priceId }
		});
	};

	const onFilterChange = (event) => {
		console.log(event.target.value);
		if (event.target.value === 'low-high') {
			setFilterValue(UserStatus.ASC);
		} else if (event.target.value === 'high-low') {
			setFilterValue(UserStatus.DESC);
		}
	};

	const convertImage = (w, h) => `
	<svg width=${w} height=${h} xmlns="http://www.w3.org/2000/svg">
<style>
 rect {
      fill: #D1D5DB; opacity: 0;
      animation: 1.5s opacity infinite ease-in;
    }
    @keyframes opacity {
      15% {opacity: 0.4} 
      35% {opacity: 1}
      65% {opacity: 1} 
      85% {opacity: 0.4}
    }</style>
   
  <rect width=${w} height=${h}  />
</svg>`;

	const toBase64 = (str) =>
		typeof window === 'undefined' ? Buffer.from(str).toString('base64') : window.btoa(str);

	return (
		<>
			<div className="w-full shadow p-5 rounded-lg ">
				{/* <div className="relative">
	<div className="absolute flex items-center ml-2 h-full">
	  <svg className="w-4 h-4 fill-current text-primary-gray-dark" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
		<path d="M15.8898 15.0493L11.8588 11.0182C11.7869 10.9463 11.6932 10.9088 11.5932 10.9088H11.2713C12.3431 9.74952 12.9994 8.20272 12.9994 6.49968C12.9994 2.90923 10.0901 0 6.49968 0C2.90923 0 0 2.90923 0 6.49968C0 10.0901 2.90923 12.9994 6.49968 12.9994C8.20272 12.9994 9.74952 12.3431 10.9088 11.2744V11.5932C10.9088 11.6932 10.9495 11.7869 11.0182 11.8588L15.0493 15.8898C15.1961 16.0367 15.4336 16.0367 15.5805 15.8898L15.8898 15.5805C16.0367 15.4336 16.0367 15.1961 15.8898 15.0493ZM6.49968 11.9994C3.45921 11.9994 0.999951 9.54016 0.999951 6.49968C0.999951 3.45921 3.45921 0.999951 6.49968 0.999951C9.54016 0.999951 11.9994 3.45921 11.9994 6.49968C11.9994 9.54016 9.54016 11.9994 6.49968 11.9994Z"></path>
	  </svg>
	</div>

	<input type="text" placeholder="Search by listing, location, bedroom number..." className="px-8 py-3 w-full rounded-md bg-gray-100 border-transparent focus:border-gray-500 focus:bg-white focus:ring-0 text-sm"/>
	  </div> */}

				<div className="flex items-center justify-between mt-0.5 space-x-4">
					{/* <p className="font-medium">
		Filters
	  </p> */}

					<button className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 text-sm font-medium rounded-md">
						Reset Filter {filterValue}
					</button>
				</div>

				<div>
					<div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 mt-4">
						<div className="mr-20">
							<form onChange={onFilterChange}>
								<select className="px-4 py-3 w-full rounded-md bg-gray-100 border-transparent focus:border-gray-500 focus:bg-white focus:ring-0 text-sm">
									<option value="">Sort by</option>
									<option value="low-high">Low-High</option>
									<option value="high-low">High-Low</option>
								</select>
							</form>
						</div>

						{/* <div className='ml-20'>
<select className="px-4 ml-30 py-3 w-full rounded-md bg-gray-100 border-transparent focus:border-gray-500 focus:bg-white focus:ring-0 text-sm">
<input type="range" name="amountRange" min="0" max="20" value="0" oninput="this.form.amountInput.value=this.value" />
		<input type="number" name="amountInput" min="0" max="20" value="0" oninput="this.form.amountRange.value=this.value" />
		</select>
</div> */}
					</div>
				</div>
			</div>
			<div className="">
				<div className="mx-auto max-w-2xl py-16 px-4 sm:py-24 sm:px-6 lg:max-w-7xl lg:px-8">
					<div className="grid grid-cols-1 gap-y-10 gap-x-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 xl:gap-x-8 2xl:gap-x-10 items-center">
						{searchResults.map((result) => (
							<Link
								href={`/seller/${result._source['seller-id']}?active=PRICES&productID=${result._id}`}
								key={result._id}
								className="group"
							>
								<div className=" my-2 items-start flex flex-col">
									<Image
										className="min-w-full max-w-xs md:max-w-md max-h-full shadow-lg object-cover rounded-lg h-[30vh] w-40 md:w-60 md:h-72  object-center mx-auto"
										alt="Picture f the "
										width={270}
										placeholder="blur"
										height={360}
										src={result._source.image}
										blurDataURL={`data:image/svg+xml;base64,${toBase64(convertImage(200, 266))}`}
									/>

									<h3 className="mt-4 text-xl text-gray-700 text-left font-bold">
										{result._source.name}{' '}
									</h3>
									<p className="mt-1 text-md font-medium text-gray-900">${result._source.amount}</p>
								</div>
							</Link>
						))}

						{/* <a href="#" className="group">
        <div className="aspect-w-1 aspect-h-1 w-full overflow-hidden rounded-lg bg-gray-200 xl:aspect-w-7 xl:aspect-h-8">
          <img src="https://tailwindui.com/img/ecommerce-images/category-page-04-image-card-02.jpg" alt="Olive drab green insulated bottle with flared screw lid and flat top." className="h-full w-full object-cover object-center group-hover:opacity-75"/>
        </div>
        <h3 className="mt-4 text-sm text-gray-700">Nomad Tumbler</h3>
        <p className="mt-1 text-lg font-medium text-gray-900">$35</p>
      </a>

      <a href="#" className="group">
        <div className="aspect-w-1 aspect-h-1 w-full overflow-hidden rounded-lg bg-gray-200 xl:aspect-w-7 xl:aspect-h-8">
          <img src="https://tailwindui.com/img/ecommerce-images/category-page-04-image-card-03.jpg" alt="Person using a pen to cross a task off a productivity paper card." className="h-full w-full object-cover object-center group-hover:opacity-75"/>
        </div>
        <h3 className="mt-4 text-sm text-gray-700">Focus Paper Refill</h3>
        <p className="mt-1 text-lg font-medium text-gray-900">$89</p>
      </a>

      <a href="#" className="group">
        <div className="aspect-w-1 aspect-h-1 w-full overflow-hidden rounded-lg bg-gray-200 xl:aspect-w-7 xl:aspect-h-8">
          <img src="https://tailwindui.com/img/ecommerce-images/category-page-04-image-card-04.jpg" alt="Hand holding black machined steel mechanical pencil with brass tip and top." className="h-full w-full object-cover object-center group-hover:opacity-75"/>
        </div>
        <h3 className="mt-4 text-sm text-gray-700">Machined Mechanical Pencil</h3>
        <p className="mt-1 text-lg font-medium text-gray-900">$35</p>
      </a>

      <a href="#" className="group">
        <div className="aspect-w-1 aspect-h-1 w-full overflow-hidden rounded-lg bg-gray-200 xl:aspect-w-7 xl:aspect-h-8">
          <img src="https://tailwindui.com/img/ecommerce-images/category-page-04-image-card-04.jpg" alt="Hand holding black machined steel mechanical pencil with brass tip and top." className="h-full w-full object-cover object-center group-hover:opacity-75"/>
        </div>
        <h3 className="mt-4 text-sm text-gray-700">Machined Mechanical Pencil</h3>
        <p className="mt-1 text-lg font-medium text-gray-900">$35</p>
      </a> */}
					</div>
				</div>
			</div>
		</>
	);
};

export default SearchResultPage;
