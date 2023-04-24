import React, { useEffect, useState } from 'react';
import { useLoadingStore } from '@utils/sellerUploadStore';

const EditAndSaveCategory = ({
	status,
	disableDeleteButton,
	disableEditButton,
	post,
	session,
	setEditCategory,
	handleEditClick,
	handleDeleteClick,
	uid
}) => {
	const onClick = () => {
		setEditCategory(false);
	};
	const uploading = useLoadingStore((state) => state.loading);
	const setLoading = useLoadingStore((state) => state.setLoading);
	const wrap = () => {
		console.log(uploading);
		setLoading(!uploading);
	};

	useEffect(() => {
		console.log(uploading);
	}, [uploading]);
	// const { data: session, status } = useSession();
	return (
		<div className="flex justify-between items-center">
			<h2
				className="font-epilogue text-left text-3xl text-secondary p-5 font-black basis-2/3 uppercase"
				key={post.id}
			>
				{post.name}
			</h2>
			{}
			<div className=" self-center max-w-fit  p-5">
				{/* <button className="btn" onClick={() => wrap()}>
					hhh
				</button> */}
				<div className="flex flex-col lg:flex-row gap-1 items-end">
					{status === 'authenticated' && session.user.id === uid ? (
						<button
							form="a-form"
							type="submit"
							disabled={disableEditButton}
							onClick={(event) => handleEditClick(event, post)}
							className={`btn btn-sm ${uploading && 'btn-disabled'}`}
						>
							Edit
						</button>
					) : null}
					{status === 'authenticated' && session.user.id === uid ? (
						<button
							disabled={disableDeleteButton}
							onClick={() => handleDeleteClick(post.id)}
							className="btn btn-sm"
						>
							Delete
						</button>
					) : null}
				</div>
			</div>
		</div>
	);
};

export default EditAndSaveCategory;
