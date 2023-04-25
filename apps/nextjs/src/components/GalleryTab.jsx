import { env } from '../env/client.mjs';
import { useLoadingStore } from '../utils/sellerUploadStore';
import { trpc } from '../utils/trpc';
import AddCategoryButton from './AddCategoryButton';
import EditAndSaveCategory from './EditAndSaveCategory';
import Modal from './Modal';
import RemoveImageButton from './RemoveImageButton';
import SaveAndDeleteCategory from './SaveAndDeleteCategory';
import { useAuth } from '@clerk/nextjs';
import dataURItoBlob from '@utils/URItoFile';
import Image from 'next/image';
import React, { Fragment, useEffect, useRef, useState } from 'react';

const GalleryTab = ({ uid, posts, setCategories, categories }) => {
	const catUpdate = trpc.user.updateImage.useMutation();
	const catDelete = trpc.user.deleteCategory.useMutation();
	const { userId, isSignedIn } = useAuth();
	const [selectedFile, setSelectedFile] = useState();
	const [oldCategory, setOldCategory] = useState(null);
	const [disableSaveButton, setSaveDisableButton] = useState('');
	const [disableBlankSaveButton, setDisableBlankSaveButton] = useState('disable');
	const [isTitleEmpty, setIsTitleEmpty] = useState(true);
	const [disableEditButton, setEditDisableButton] = useState('');
	const [disableDeleteButton, setDeleteDisableButton] = useState('');
	const [disableCancelButton, setDisableCancelButton] = useState('');
	const [disableAddCategoryButton, setDisableAddCategoryButton] = useState('');
	const [editCategory, setEditCategory] = useState(null);
	const [numberOfImages, setNumberOfImages] = useState(0);
	const [editFormData, setEditFormData] = useState({
		id: '',
		name: ''
	});

	const cat = trpc.user.updateCategory.useMutation();
	const setLoading = useLoadingStore((state) => state.setLoading);
	const [isOpen, setIsOpen] = useState(false);
	function closeModal() {
		setIsOpen(false);
	}

	function openModal() {
		setIsOpen(true);
	}

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

	useEffect(() => {
		console.log('Title Empty: ' + isTitleEmpty);
		console.log('Number of images: ' + numberOfImages);
		setNumberOfImages(numberOfImages);
		setIsTitleEmpty(isTitleEmpty);
	}, [isTitleEmpty, numberOfImages]);

	// useEffect(()=>{
	// 	cat.mutate({
	// 		name: "Hello"
	// 	})
	// }, [])

	const imageUpload = async (files, changedImages) => {
		const formData = new FormData();
		formData.append('UPLOADCARE_PUB_KEY', env.NEXT_PUBLIC_UPLOADCARE_PUB_KEY);
		formData.append('UPLOADCARE_STORE', 'auto');
		files.forEach((file, index) =>
			formData.append(`my_file(${index}).jpg`, file, `${uid}/${Date.now()}`)
		);

		for (const value of formData.values()) {
			console.log(value);
		}

		const response = await fetch('https://upload.uploadcare.com/base/', {
			method: 'POST',
			body: formData
		});
		if (response.ok) {
			console.log(response);
			const result = await response.json();
			console.log(result);
			const cdnUrl = `https://ucarecdn.com/${result['my_file.jpg']}`;
			catUpdate.mutate(
				changedImages.map((image, idx) => {
					return {
						link: `https://ucarecdn.com/${result[`my_file(${idx}).jpg`]}/`,
						imageId: image.id
					};
				})
			);
		} else {
			console.log(await response.text(), response.status);
		}
	};

	if (isSignedIn) console.log(userId);
	const handleEditClick = (event, categories) => {
		event.preventDefault();
		setEditCategory(categories.id);
		const formValues = {
			id: categories.id,
			name: categories.name,
			Image: categories.Image
		};
		setEditFormData(formValues);
		console.log(categories);
		setOldCategory(JSON.parse(JSON.stringify(categories)));
		categories.Image.every((element) => {
			if (element.link === null) {
				console.log(element);
				setSaveDisableButton('Disable');
				setDisableCancelButton('Disable');
				return false;
			}
			return true;
		});
		setEditDisableButton('Disable');
		setDeleteDisableButton('Disable');
		setDisableAddCategoryButton('disable');
	};

	const handleEditFormChange = (event) => {
		event.preventDefault();
		const categoryTitle = event.target.getAttribute('category');
		const value = event.target.value;
		const newCategory = { ...editFormData };
		newCategory.name = value;
		setEditFormData(newCategory);
	};

	const handleEditFormSubmit = async (event) => {
		event.preventDefault();
		setLoading(true);
		const editedCategory = {
			id: editFormData.id,
			name: editFormData.name,
			Image: editFormData.Image
		};
		console.log(editedCategory);

		const index1 = categories.map((object) => object.id).indexOf(editFormData.id);
		/* 		cat.mutate({
			categoryId: 'cl8i9afy30030ikuhyg7b9am1',
			name: 'John'
		}); */
		const newCategory = [...categories];

		console.log(oldCategory);
		newCategory[index1] = editedCategory;

		//If name is different from oldCategories then update the category name

		//If the picture is different, update the category image

		console.log('HHHH' + oldCategory);
		cat.mutate({
			categoryId: editFormData.id,
			name: editFormData.name
		});
		const changedImages = newCategory[index1].Image.filter(
			(image, index) => oldCategory.Image[index].link !== image.link
		);

		console.log(changedImages);

		const changedName = newCategory[index1].name !== oldCategory.name ? newCategory[index1] : null;

		const getFileObjects = async () => {
			return Promise.all(changedImages.map((image) => dataURItoBlob(image.link)));
		};

		const files = await getFileObjects();
		console.log(files);

		if (files.length > 0) {
			console.log(changedImages);
			imageUpload(files, changedImages);
		}

		setCategories(newCategory);

		setEditCategory(null);
		setEditDisableButton('');
		setDeleteDisableButton('');
		setDisableAddCategoryButton('');
		setLoading(false);
	};

	const handleCancelClick = () => {
		setEditCategory(null);
		setEditDisableButton('');
		setDeleteDisableButton('');
		setDisableAddCategoryButton('');
	};

	const handleDeleteClick = (id) => {
		const newCategory = [...categories];
		catDelete.mutate({
			categoryId: id
		});
		newCategory.splice(newCategory.map((category) => category.id).indexOf(id), 1);
		setCategories(newCategory);
	};
	const handleRemoveImageClick = (category, image) => {
		const editedImage = {
			id: image.id,

			link: '/placeholder(2).svg',
			categoryId: category.id
		};
		const newImage = { ...image };
		var categoryIndex;
		var imageIndex;

		const newCategory = [...categories];
		if (newCategory !== undefined) {
			categoryIndex = newCategory.map((cate) => cate.id).indexOf(category.id);
			newCategory.map((cate) => {
				if (cate.id === category.id) {
					imageIndex = cate.Image.map((img) => img.id).indexOf(image.id);
				}
			});
		}

		newCategory[categoryIndex].Image[imageIndex] = editedImage;
		setCategories(newCategory);
		setSaveDisableButton('Disable');
		setDisableCancelButton('Disable');
	};

	function onSelectFile(e, image) {
		if (e.target.files && e.target.files.length > 0) {
			//console.log(image.link);
			setSaveDisableButton('');
			setDisableCancelButton('');
			setSelectedFile(e.target.files[0]);
			//setCrop(undefined); // Makes crop preview update between images.
			const reader = new FileReader();
			reader.addEventListener('load', () => (image.link = reader.result?.toString() || ''));
			if (e.target.files[0]) {
				image.link = URL.createObjectURL(e.target.files[0]);
				reader.readAsDataURL(e.target.files[0]);
				if (numberOfImages === 3 && isTitleEmpty === false) {
					setDisableBlankSaveButton('');
				} else {
					setDisableBlankSaveButton('disable');
				}
				setNumberOfImages(numberOfImages + 1);
			} else {
				setDisableBlankSaveButton('disable');
			}
		} else {
			setDisableBlankSaveButton('disable');
		}
	}
	return (
		<>
			{categories &&
				categories !== undefined &&
				categories.map((post) => (
					<div key={post.id}>
						{isSignedIn && userId === uid && editCategory === post.id ? (
							<SaveAndDeleteCategory
								uid={uid}
								disableCancelButton={disableCancelButton}
								post={post}
								disableSaveButton={disableSaveButton}
								handleEditFormSubmit={handleEditFormSubmit}
								editFormData={editFormData}
								handleCancelClick={handleCancelClick}
								handleEditFormChange={handleEditFormChange}
							/>
						) : (
							<EditAndSaveCategory
								uid={uid}
								disableDeleteButton={disableDeleteButton}
								disableEditButton={disableEditButton}
								handleDeleteClick={handleDeleteClick}
								handleEditClick={handleEditClick}
								editCategory={editCategory}
								setEditCategory={setEditCategory}
								post={post}
							/>
						)}
						<div className="flex overflow-x-auto snap-x snap-mandatory gap-2 lg:grid lg:grid-cols-4 lg:mx-auto lg:justify-between md:gap-8 lg:gap-10 xl:gap-14">
							{post?.Image &&
								post?.Image !== undefined &&
								post.Image.map((image) => (
									<div key={image.key} className="m-2  flex-shrink-0 snap-center justify-center">
										<div className="w-40 md:w-60 max-w-xs md:max-w-md flex justify-center mx-auto">
											<div className="indicator">
												{editCategory !== post.id ? null : image.link === null ? null : (
													<RemoveImageButton
														post={post}
														image={image}
														handleRemoveImageClick={handleRemoveImageClick}
													/>
												)}
												{image.link !== '/placeholder(2).svg' ? (
													<Image
														className="min-w-full max-w-xs md:max-w-md max-h-full shadow-lg object-cover rounded-lg h-56 w-40 md:w-60 md:h-72  object-center"
														alt="Category Picture"
														width={500}
														placeholder="blur"
														height={666}
														src={
															image.link.includes('ucarecdn')
																? `${image.link}-/preview/-/quality/smart/-/format/auto/`
																: image.link
														}
														blurDataURL={`data:image/svg+xml;base64,${toBase64(
															convertImage(500, 666)
														)}`}
													/>
												) : (
													<div>
														<label htmlFor="file-input">
															<img src="/placeholder(2).svg" />
														</label>

														<input
															id="file-input"
															type="file"
															className="hidden"
															onChange={(e) => onSelectFile(e, image)}
														/>
													</div>
												)}
											</div>
										</div>
									</div>
								))}
						</div>
					</div>
				))}
			<AddCategoryButton
				setEditDisableButton={setEditDisableButton}
				setDeleteDisableButton={setDeleteDisableButton}
				disableEditButton={disableEditButton}
				disableDeleteButton={disableDeleteButton}
				isTitleEmpty={isTitleEmpty}
				setIsTitleEmpty={setIsTitleEmpty}
				setDisableBlankSaveButton={setDisableBlankSaveButton}
				disableBlankSaveButton={disableBlankSaveButton}
				setSelectedFile={setSelectedFile}
				numberOfImages={numberOfImages}
				setNumberOfImages={setNumberOfImages}
				uid={uid}
				disableAddCategoryButton={disableAddCategoryButton}
				setDisableAddCategoryButton={setDisableAddCategoryButton}
				posts={posts}
				categories={categories}
				setCategories={setCategories}
				onSelectFile={onSelectFile}
			/>
		</>
	);
};

export default GalleryTab;
