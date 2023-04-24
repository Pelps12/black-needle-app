import { useLoadingStore } from '@utils/sellerUploadStore';
import { useEffect } from 'react';

const SaveAndDeleteCategory = ({
	disableCancelButton,
	disableSaveButton,
	editFormData,
	handleEditFormChange,
	handleEditFormSubmit,
	handleCancelClick
}) => {
	const uploading = useLoadingStore((state) => state.loading);
	useEffect(() => {
		console.log(uploading);
	}, [uploading]);
	return (
		<div className="m-4 flex justify-between ">
			<form onSubmit={handleEditFormSubmit} id="b-form" action="">
				<input
					value={editFormData.name}
					onChange={handleEditFormChange}
					type="text"
					name="category"
					placeholder="Type here"
					className="input input-bordered input-primary w-full max-w-xs"
				/>
			</form>
			<div className="col-start-2 self-center justify-self-center"></div>
			<div className="col-start-3  justify-self-end self-center">
				<div className="ml-14 space-x-0.5 space-y-0.5 ">
					<button
						disabled={disableSaveButton}
						form="b-form"
						type="submit"
						className={`btn btn-sm ml-2 sm:ml-0 ${uploading && 'btn-disabled'}`}
					>
						Save
					</button>
					<button disabled={disableCancelButton} onClick={handleCancelClick} className="btn btn-sm">
						Cancel
					</button>
				</div>
			</div>
		</div>
	);
};

export default SaveAndDeleteCategory;
