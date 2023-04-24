import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import RemoveImageButton from './RemoveImageButton';
import { useLoadingStore } from '@utils/sellerUploadStore';

const BlankGalleryImages = ({
	setEditDisableButton,
	setDeleteDisableButton,
	disableEditButton,
	disableDeleteButton,
	setDisableBlankSaveButton,
	disableBlankSaveButton,
	numberOfImages,
	setNumberOfImages,
	handleDeleteOnClick,
	handleAddFormSubmit,
	handleAddFormChange,
	images,
	onSelectFile
}) => {
	const [placeHolder, setImages] = useState(images);
	const uploading = useLoadingStore((state) => state.loading);

	const handleBlankRemoveImageClick = (image) => {
		const editedImage = {
			id: image.id,
			link: '/placeholder(2).svg',
			
		};

		var imagesIndex;

		const newImages = [...placeHolder];

		if (newImages !== undefined) {
			imagesIndex = newImages.map((img) => img.id).indexOf(image.id);
		}

		newImages[imagesIndex] = editedImage;

		setImages(newImages);
		setNumberOfImages(numberOfImages - 1);

		setDisableBlankSaveButton('disable');
	};
	return (
		<>
			<div className="m-3 flex justify-between ">
				<form onSubmit={handleAddFormSubmit} id="a-form" action="">
					<input
						onChange={handleAddFormChange}
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
							disabled={disableBlankSaveButton}
							form="a-form"
							type="submit"
							className={`btn btn-sm ml-2 sm:ml-0 ${uploading && 'btn-disabled'}`}
						>
							Save
						</button>
						<button onClick={handleDeleteOnClick} className="btn btn-sm">
							Delete
						</button>
					</div>
				</div>
			</div>
			<div className="flex overflow-x-auto snap-x snap-mandatory gap-2 lg:grid lg:grid-cols-4 lg:mx-auto lg:justify-between md:gap-8 lg:gap-10 xl:gap-14">
				{placeHolder.map((image) => (
					<div key={image.key} className="m-4  flex-shrink-0 snap-center justify-center">
						<div className="w-40 md:w-60 max-w-xs md:max-w-md flex justify-center mx-auto">
							<div className="indicator">
								{image.link === null && (
									<RemoveImageButton
										post={post}
										image={image}
										handleRemoveImageClick={handleRemoveImageClick}
									/>
								)}

								{image.link !== '/placeholder(2).svg' ? (
									<>
										<span
											onClick={() => handleBlankRemoveImageClick(image)}
											className="cursor-pointer indicator-item rounded-full m-1 h-5 w-5 badge bg-[red] "
										>
											X
										</span>
										<Image
											className="min-w-full max-w-xs md:max-w-md max-h-full shadow-lg object-cover rounded-lg h-56 w-40 md:w-60 md:h-72  object-center"
											alt=""
											width={500}
											height={666}
											src={image.link}
										/>
									</>
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
				{/*              <div className="m-2  flex-shrink-0 snap-center" >
                    <div className="w-40 md:w-60 max-w-xs md:max-w-md flex justify-center ">
                    <div>
												<label htmlFor="file-input">
                                                <Image className="min-w-full max-w-xs md:max-w-md max-h-full shadow-lg object-cover rounded-lg h-56 w-40 md:w-60 md:h-72  object-center rounded-lg" alt="Picture of the author"
                            width={500}
                            height={666} src='/placeholder(2).svg' />
												</label>

												<input
													id="file-input"
													type="file"
													className="hidden"
													onChange={(e) => onSelectFile(e, image)}
												/>
											</div>
                        
                    </div>
                </div>
                <div className="m-2  flex-shrink-0 snap-center" >
                    <div className="w-40 md:w-60 max-w-xs md:max-w-md flex justify-center ">
                    <div>
												<label htmlFor="file-input">
                                                <Image className="min-w-full max-w-xs md:max-w-md max-h-full shadow-lg object-cover rounded-lg h-56 w-40 md:w-60 md:h-72  object-center rounded-lg" alt="Picture of the author"
                            width={500}
                            height={666} src='/placeholder(2).svg' />
												</label>

												<input
													id="file-input"
													type="file"
													className="hidden"
													onChange={(e) => onSelectFile(e, image)}
												/>
											</div>
                        
                    </div>
                </div>
                <div className="m-2  flex-shrink-0 snap-center" >
                    <div className="w-40 md:w-60 max-w-xs md:max-w-md flex justify-center ">
                    <div>
												<label htmlFor="file-input">
                                                <Image className="min-w-full max-w-xs md:max-w-md max-h-full shadow-lg object-cover rounded-lg h-56 w-40 md:w-60 md:h-72  object-center rounded-lg" alt="Picture of the author"
                            width={500}
                            height={666} src='/placeholder(2).svg' />
												</label>

												<input
													id="file-input"
													type="file"
													className="hidden"
													onChange={(e) => onSelectFile(e, image)}
												/>
											</div>
                        
                    </div>
                </div>
                <div className="m-2  flex-shrink-0 snap-center" >
                    <div className="w-40 md:w-60 max-w-xs md:max-w-md flex justify-center ">
                    <div>
												<label htmlFor="file-input">
                                                <Image className="min-w-full max-w-xs md:max-w-md max-h-full shadow-lg object-cover rounded-lg h-56 w-40 md:w-60 md:h-72  object-center rounded-lg" alt="Picture of the author"
                            width={500}
                            height={666} src='/placeholder(2).svg' />
												</label>

												<input
													id="file-input"
													type="file"
													className="hidden"
													onChange={(e) => onSelectFile(e, image)}
												/>
											</div>
                        
                    </div>
                </div> */}
			</div>
		</>
	);
};

export default BlankGalleryImages;
