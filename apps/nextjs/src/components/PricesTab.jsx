import { useBearStore } from '../utils/messsageStore';
import { trpc } from '../utils/trpc';
import BuyerAppointment from './BuyerAppointment';
import EditPrice from './EditPrice';
import Modal from './Modal';
import NewAppointmentModal from './NewAppointmentModal';
import ProductForm from './ProductForm';
import { useAuth } from '@clerk/nextjs';
import { Dialog, Transition } from '@headlessui/react';
import Image from 'next/image';
import { useRouter } from 'next/router';
import React, { useState, Fragment, useEffect, useRef } from 'react';
import 'react-datepicker/dist/react-datepicker.css';
import ImageWithFallback from './Utils/ImageWithFallback';

const PricesTab = ({ productID, uid, posts, categories }) => {
	const bears = useBearStore((state) => state.bears);
	const setBears = useBearStore((state) => state.setBears);
	const ref = useRef();

	let [isOpen, setIsOpen] = useState(false);
	let [isEditOpen, setIsEditOpen] = useState(false);
	let [isServiceSelected, setIsServiceSelected] = useState(false);
	let [isEditServiceSelected, setIsEditServiceSelected] = useState(false);

	const [isAppointmentOpen, setIsAppointmentOpen] = useState(false);
	const [editPriceID, setEditPriceID] = useState(null);
	const { userId, isSignedIn } = useAuth();
	const [startDate, setStartDate] = useState(new Date());
	const [price, setPrice] = useState([]);
	const [disableAddButton, setDisableAddButton] = useState('disable');
	const [disableSaveButton, setDisableSaveButton] = useState('');
	const [uniqueProductAmount, setUniqueProductAmount] = useState([]);
	const [selectedPriceId, setSelectedPriceId] = useState();
	const [editPrice, editSetPrice] = useState({
		id: null,
		categoryId: null,
		amount: null,
		name: null,
		type: null,
		...(isServiceSelected && { duration: null })
	});

	useEffect(() => {
		let newArray = [];
		var i = 0;
		var j = 0;
		while (posts && posts != undefined && i < posts.length) {
			while (j < posts[i].prices.length) {
				newArray.push(posts[i].prices[j]);
				j++;
			}
			j = 0;
			i++;
		}
		setPrice(newArray);
	}, [posts]);

	// We dont understand how this works

	useEffect(() => {
		ref?.current?.scrollIntoView({ behavior: 'smooth' });
	}, [price, productID]);
	const [numberOfInput, setNumberOfInput] = useState(0);

	function closeModal() {
		setIsOpen(false);
	}
	function cancelModel() {
		setIsOpen(false);
		setAddFormData({
			categoryId: null,
			amount: null,
			name: null,
			type: null,
			...(isServiceSelected && { duration: null })
		});
	}

	function closeAppointmentModal() {
		setIsAppointmentOpen(false);
	}

	function openAppointmentModal() {
		setIsAppointmentOpen(true);
	}

	function openModal() {
		setIsOpen(true);
	}

	function closeEditModal() {
		setIsEditOpen(false);
	}

	const [addFormData, setAddFormData] = useState({
		categoryId: null,
		amount: null,
		name: null,
		type: null,
		...(isServiceSelected && { duration: null })
	});
	const createPrice = trpc.price.createPrice.useMutation();
	const updatePrice = trpc.price.updatePrice.useMutation();
	const deletePrice = trpc.price.deletePrice.useMutation();
	const addToCart = trpc.cart.addToCart.useMutation();
	const openEditModal = (event, userPrice) => {
		event.preventDefault();
		setIsEditOpen(true);
		setEditPriceID(userPrice.id);
		console.log(userPrice);
		const newProduct = {
			categoryId: userPrice.categoryId,
			amount: userPrice.amount,
			name: userPrice.name,
			type: userPrice.type,
			...(userPrice.duration != null &&
				userPrice.duration != undefined && { duration: userPrice.duration })
		};
		console.log(newProduct);
		editSetPrice(newProduct);
	};

	const handleAddPricesChanges = async (event) => {
		event.preventDefault();

		const fieldName = event.target.getAttribute('name');
		const value = event.target.value;

		const newProductData = { ...addFormData };
		if (fieldName === 'amount') {
			newProductData[fieldName] = parseFloat(value);
		} else if (fieldName === 'type') {
			if (value === 'SERVICE') {
				setIsServiceSelected(true);
				newProductData[fieldName] = value;
			} else {
				setIsServiceSelected(false);
				newProductData[fieldName] = value;
				newProductData['duration'] = null;
			}
		} else if (fieldName === 'duration') {
			newProductData[fieldName] = parseInt(value);
		} else {
			newProductData[fieldName] = value;
		}
		console.log(newProductData['name']);
		if (
			newProductData['name'] === null ||
			newProductData['type'] === null ||
			newProductData['categoryId'] === null ||
			newProductData['amount'] === null ||
			newProductData['name'] === '' ||
			newProductData['type'] === '' ||
			newProductData['categoryId'] === '' ||
			newProductData['amount'] === '' ||
			(newProductData['type'] === 'SERVICE' &&
				(newProductData['duration'] === null || newProductData['duration'] === ''))
		) {
			setNumberOfInput(0);
			setDisableAddButton('disable');
		} else {
			setNumberOfInput(1);
			setDisableAddButton('');
		}
		console.log(newProductData);
		setAddFormData(newProductData);
	};

	const handleOnCartClick = (product) => {
		const exists = uniqueProductAmount.find((x) => x.id === product.id);
		if (exists) {
			setUniqueProductAmount(
				uniqueProductAmount.map((x) =>
					x.id === product.id ? { ...exists, qty: exists.qty + 1 } : x
				)
			);
		} else {
			setUniqueProductAmount([...uniqueProductAmount, { ...product, qty: 1 }]);
		}
		setBears(bears + 1);
		addToCart.mutate(
			{
				priceId: product.id,
				quantity: 1
			},
			{
				onError: (data) => {
					if (data.data.code === 'UNAUTHORIZED') {
						document.getElementById('my-modal-4')?.click();
					}
				}
			}
		);
	};

	const handleEditFormChange = async (event) => {
		event.preventDefault();
		const fieldName = event.target.getAttribute('name');
		const value = event.target.value;
		const newFormData = { ...editPrice };

		// alert(JSON.stringify(newFormData))
		// alert(editPriceID)
		if (fieldName === 'amount') {
			newFormData[fieldName] = parseFloat(value);
		} else if (fieldName === 'type') {
			if (value === 'SERVICE') {
				setIsEditServiceSelected(true);
				newFormData[fieldName] = value;
			} else {
				setIsEditServiceSelected(false);
				newFormData[fieldName] = value;
				newFormData['duration'] = null;
			}
		} else if (fieldName === 'duration') {
			newFormData[fieldName] = parseInt(value);
		} else {
			newFormData[fieldName] = value;
		}
		if (
			newFormData['name'] === null ||
			newFormData['type'] === null ||
			newFormData['categoryId'] === null ||
			newFormData['amount'] === null ||
			newFormData['name'] === '' ||
			newFormData['type'] === '' ||
			newFormData['categoryId'] === '' ||
			newFormData['amount'] === '' ||
			newFormData['duration'] === '' ||
			newFormData['duration'] === null
		) {
			setNumberOfInput(0);
			setDisableSaveButton('disable');
		} else {
			setNumberOfInput(1);
			setDisableSaveButton('');
		}
		editSetPrice(newFormData);
	};

	const handleEditFormSubmit = async (event) => {
		event.preventDefault();
		const newProduct = {
			categoryId: editPrice.categoryId,
			amount: editPrice.amount,
			name: editPrice.name,
			type: editPrice.type,
			...(editPrice.duration != null &&
				editPrice.duration != undefined &&
				isEditServiceSelected === true && { duration: editPrice.duration })
		};
		const index1 = price.map((object) => object.categoryId).indexOf(editPrice.categoryId);
		const newprices = [...price];
		newprices[index1] = newProduct;
		console.log(newprices);
		updatePrice.mutate({
			priceId: editPriceID,
			amount: editPrice.amount,
			categoryId: editPrice.categoryId,
			name: editPrice.name,
			type: editPrice.type,
			...(editPrice.duration != null &&
				editPrice.duration != undefined &&
				isEditServiceSelected === true && { duration: editPrice.duration })
		});
		setPrice(newprices);
		closeEditModal();
	};
	const handleBuyNowClick = () => {
		console.log(uniqueProductAmount);
	};
	const handleAddPrices = async (event) => {
		event.preventDefault();

		await createPrice.mutateAsync(
			{
				categoryId: addFormData.categoryId,
				amount: addFormData.amount,
				name: addFormData.name,
				type: addFormData.type,
				...(addFormData.duration != null &&
					addFormData.duration != undefined &&
					isServiceSelected === true && { duration: addFormData.duration })
			},
			{
				onSuccess: (data) => {
					setPrice([...price, data.price]);
					editSetPrice(data.price);
				}
			}
		);
	};

	const handleDeleteClick = (id) => {
		setEditPriceID(id);
		alert(id);
		const newPrice = [...price];
		newPrice.splice(newPrice.map((category) => category.id).indexOf(id), 1);
		setPrice(newPrice);
		deletePrice.mutate({
			priceId: id
		});
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
			<div className="grid grid-cols-3 justify-center">
				<div className="col-start-3 justify-self-end self-center">
					{isSignedIn && userId === uid ? (
						<button type="button" onClick={openModal} className="btn btn-sm	btn-secondary">
							Add Product
						</button>
					) : null}

					<Transition appear show={isOpen} as={Fragment}>
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
												onClick={cancelModel}
												className="btn btn-sm btn-circle absolute right-2 top-2"
											>
												✕
											</label>
											<ProductForm
												isServiceSelected={isServiceSelected}
												startDate={startDate}
												setStartDate={setStartDate}
												disableAddButton={disableAddButton}
												categories={categories}
												handleAddPricesChanges={handleAddPricesChanges}
												handleAddPrices={handleAddPrices}
												posts={posts}
												closeModal={closeModal}
											/>
										</Dialog.Panel>
									</Transition.Child>
								</div>
							</div>
						</Dialog>
					</Transition>
				</div>
			</div>

			<div className="md:grid md:grid-cols-2  lg:grid-cols-3 items-center mx-auto max-w-7xl p-5 place-items-center">
				{price &&
					price != undefined &&
					price.map((prc) => (
						<>
							<div
								key={prc.id}
								ref={prc.id === productID ? ref : null}
								className="card w-96 bg-base-100 shadow-xl p-2 m-3"
							>
								<figure className="px-10 pt-10">
									<ImageWithFallback
										className="min-w-full max-w-xs md:max-w-md max-h-full shadow-lg object-cover rounded-lg h-56 w-40 md:w-60 md:h-72  object-center mx-auto"
										alt=""
										width={270}
										placeholder="blur"
										height={360}
										src={
											categories &&
											categories != undefined &&
											categories[categories.findIndex((cate) => cate.id == prc.categoryId)]
												?.Image[0].link
										}
										blurDataURL={`data:image/svg+xml;base64,${toBase64(convertImage(200, 266))}`}
									/>
								</figure>
								<div className="card-body items-center text-center">
									<h2 className="card-title">{prc.name}</h2>${prc.amount}
									<div className="card-actions">
										{isSignedIn && userId === uid ? (
											<>
												<button
													onClick={(event) => openEditModal(event, prc)}
													className="btn btn-primary"
												>
													Edit
												</button>
												{isEditOpen && editPriceID === prc.id && (
													<EditPrice
														isEditServiceSelected={isEditServiceSelected}
														disableSaveButton={disableSaveButton}
														price={price}
														handleEditFormSubmit={handleEditFormSubmit}
														handleEditFormChange={handleEditFormChange}
														editPrice={editPrice}
														editPriceID={editPriceID}
														categories={categories}
														isEditOpen={isEditOpen}
														closeEditModal={closeEditModal}
														setIsEditOpen={setIsEditOpen}
													/>
												)}
											</>
										) : prc.type === 'GOOD' ? (
											<button onClick={() => handleOnCartClick(prc)} className="btn btn-primary">
												Add to Cart
											</button>
										) : null}
										{isSignedIn && userId === uid ? (
											<button onClick={() => handleDeleteClick(prc.id)} className="btn btn-primary">
												Delete
											</button>
										) : prc.type === 'GOOD' ? (
											<button onClick={handleBuyNowClick} className="btn btn-primary">
												Buy Now{' '}
											</button>
										) : (
											<>
												<button
													onClick={() => {
														openAppointmentModal();
														setSelectedPriceId(prc.id);
													}}
													className="btn btn-primary"
												>
													Book Appointment
												</button>
											</>
										)}
									</div>
								</div>
							</div>
						</>
					))}
				<Modal isOpen={isAppointmentOpen} closeModal={closeAppointmentModal}>
					<NewAppointmentModal
						priceId={selectedPriceId}
						sellerId={uid}
						isOpen={isAppointmentOpen}
						closeModal={closeAppointmentModal}
					/>
				</Modal>
			</div>
		</>
	);
};

export default PricesTab;
