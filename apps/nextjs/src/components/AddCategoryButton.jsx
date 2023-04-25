import BlankGallaryTab from './BlankGallaryTab';
import { useAuth } from '@clerk/nextjs';
import React, { useState } from 'react';

const AddCategoryButton = ({
	disableEditButton,
	disableDeleteButton,
	setIsTitleEmpty,
	isTitleEmpty,
	setDisableBlankSaveButton,
	disableBlankSaveButton,
	setSelectedFile,
	numberOfImages,
	setNumberOfImages,
	setDeleteDisableButton,
	setEditDisableButton,
	setDisableAddCategoryButton,
	disableAddCategoryButton,
	posts,
	uid,
	categories,
	setCategories,
	onSelectFile
}) => {
	const [blankCategory, showBlankCategory] = useState(false);
	const { userId, isSignedIn } = useAuth();
	const [deleteBlank, setDeleteBlank] = useState(false);
	const onClick = () => {
		showBlankCategory(true);
		setDisableAddCategoryButton('disable');
		setEditDisableButton('disable');
		setDeleteDisableButton('disable');
		setDeleteBlank(false);
	};
	return (
		<>
			{blankCategory && (
				<BlankGallaryTab
					setEditDisableButton={setEditDisableButton}
					setDeleteDisableButton={setDeleteDisableButton}
					disableEditButton={disableEditButton}
					disableDeleteButton={disableDeleteButton}
					setIsTitleEmpty={setIsTitleEmpty}
					isTitleEmpty={isTitleEmpty}
					setDisableBlankSaveButton={setDisableBlankSaveButton}
					disableBlankSaveButton={disableBlankSaveButton}
					numberOfImages={numberOfImages}
					setNumberOfImages={setNumberOfImages}
					setDeleteBlank={setDeleteBlank}
					deleteBlank={deleteBlank}
					setDisableAddCategoryButton={setDisableAddCategoryButton}
					showBlankCategory={showBlankCategory}
					blankCategory={blankCategory}
					setCategories={setCategories}
					categories={categories}
					posts={posts}
					onSelectFile={onSelectFile}
				/>
			)}
			{isSignedIn && userId === uid ? (
				<div className="m-4 flex justify-center ">
					<button
						disabled={disableAddCategoryButton}
						onClick={onClick}
						className="btn btn-sm rounded-2xl btn-primary  "
					>
						Add Categories
					</button>
				</div>
			) : null}
		</>
	);
};

export default AddCategoryButton;
