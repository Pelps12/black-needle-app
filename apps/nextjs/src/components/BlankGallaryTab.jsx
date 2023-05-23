import svg from '../../public/placeholder.svg';
import dataURItoBlob from '../utils/URItoFile';
import { trpc } from '../utils/trpc';
import BlankGalleryImages from './BlankGalleryImages';
import { env } from '@acme/env-config/env';
import { useLoadingStore } from '@utils/sellerUploadStore';
import Image from 'next/image';
import { useRouter } from 'next/router';
import React, { useEffect, useState } from 'react';

const BlankGallaryTab = ({
	disableEditButton,
	disableDeleteButton,
	setIsTitleEmpty,
	isTitleEmpty,
	setDisableBlankSaveButton,
	disableBlankSaveButton,
	setNumberOfImages,
	numberOfImages,
	setDeleteBlank,
	deleteBlank,
	setEditDisableButton,
	setDeleteDisableButton,
	posts,
	categories,
	setCategories,
	showBlankCategory,
	setDisableAddCategoryButton,
	onSelectFile
}) => {
	const router = useRouter();
	const { uid } = router.query;
	const [addFormData, setAddFormData] = useState({
		id: (posts?.length || 0) + 1,
		name: '',
		Image: [
			{
				id: 1,
				link: '/placeholder(2).svg'
			},
			{
				id: 2,
				link: '/placeholder(2).svg'
			},
			{
				id: 3,
				link: '/placeholder(2).svg'
			},
			{
				id: 4,
				link: '/placeholder(2).svg'
			}
		]
	});
	const cat = trpc.user.createCategory.useMutation();
	const setLoading = useLoadingStore((state) => state.setLoading);
	const imageMapperTRPC = trpc.upload.uploadImages.useMutation();
	useEffect(() => {
		console.log(categories);
	}, []);
	const handleAddFormChange = (event) => {
		event.preventDefault();
		const categoryTitle = event.target.getAttribute('category');
		const value = event.target.value;
		const newCategory = { ...addFormData };
		newCategory.name = value;

		setAddFormData(newCategory);
		if (value.length > 0) {
			setIsTitleEmpty(false);
			// if(numberOfImages === 3){
			// 	alert(numberOfImages)
			// 	setDisableBlankSaveButton("")
			// }
			// else{
			// 	alert(numberOfImages)
			// }
		} else {
			setIsTitleEmpty(true);
		}

		if (numberOfImages === 4 && value.length > 0) {
			setDisableBlankSaveButton('');
		} else {
			setDisableBlankSaveButton('disable');
		}
	};

	const imageUpload = async (files, categoryId) => {
		const formData = new FormData();
		formData.append('UPLOADCARE_PUB_KEY', env.NEXT_PUBLIC_UPLOADCARE_PUB_KEY);
		formData.append('UPLOADCARE_STORE', 'auto');
		formData.append('metadata[user]', uid);
		files.forEach((file, index) => formData.append(`my_file(${index}).jpg`, file));

		for (const value of formData.values()) {
			console.log(value);
		}

		const response = await fetch('https://upload.uploadcare.com/base/', {
			method: 'POST',
			body: formData
		});
		return response;
	};
	const handleAddFormSubmit = async (event) => {
		event.preventDefault();
		setLoading(true);
		const newCategory = {
			id: addFormData.id++,
			name: addFormData.name,
			Image: [...addFormData.Image]
		};

		const getFileObjects = async () => {
			return Promise.all(newCategory.Image.map((image) => dataURItoBlob(image.link)));
		};

		const files = await getFileObjects();
		console.log(files);

		if (files.length > 0) {
			const response = await imageUpload(files);
			if (response.ok) {
				console.log(response);
				const result = await response.json();

				const val = await cat.mutateAsync({
					name: addFormData.name
				});
				if (val) {
					imageMapperTRPC.mutate({
						url1: `https://ucarecdn.com/${result['my_file(0).jpg']}/`,
						url2: `https://ucarecdn.com/${result['my_file(1).jpg']}/`,
						url3: `https://ucarecdn.com/${result['my_file(2).jpg']}/`,
						url4: `https://ucarecdn.com/${result['my_file(3).jpg']}/`,
						categoryId: val.id
					});
					newCategory['id'] = val.id;
				}

				//const cdnUrl = `https://ucarecdn.com/${result['my_file.jpg']}/`;
			} else {
				console.log(await response.text(), response.status);
			}
		}
		const newCategories = [...categories, newCategory];
		console.log(newCategories);
		setCategories(newCategories);
		showBlankCategory(false);
		setDisableAddCategoryButton('');
		setEditDisableButton('');
		setDeleteDisableButton('');
		setLoading(false);
	};

	const handleDeleteOnClick = () => {
		setDeleteBlank(true);
		setAddFormData({
			id: (posts?.length || 0) + 1,
			name: '',
			Image: [
				{
					id: 1,
					link: '/placeholder(2).svg'
				},
				{
					id: 2,
					link: '/placeholder(2).svg'
				},
				{
					id: 3,
					link: '/placeholder(2).svg'
				},
				{
					id: 4,
					link: '/placeholder(2).svg'
				}
			]
		});
		setDisableAddCategoryButton('');
		setEditDisableButton('');
		setDeleteDisableButton('');
	};
	return (
		<>
			{!deleteBlank && (
				<BlankGalleryImages
					setEditDisableButton={setEditDisableButton}
					setDeleteDisableButton={setDeleteDisableButton}
					disableEditButton={disableEditButton}
					disableDeleteButton={disableDeleteButton}
					isTitleEmpty={isTitleEmpty}
					setIsTitleEmpty={setIsTitleEmpty}
					setDisableBlankSaveButton={setDisableBlankSaveButton}
					disableBlankSaveButton={disableBlankSaveButton}
					numberOfImages={numberOfImages}
					setNumberOfImages={setNumberOfImages}
					handleDeleteOnClick={handleDeleteOnClick}
					handleAddFormSubmit={handleAddFormSubmit}
					handleAddFormChange={handleAddFormChange}
					images={addFormData.Image}
					onSelectFile={onSelectFile}
				/>
			)}
		</>
	);
};

export default BlankGallaryTab;
