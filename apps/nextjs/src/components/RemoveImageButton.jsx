import React from 'react';

const RemoveImageButton = ({ post, handleRemoveImageClick, image }) => {
	return (
		<span
			onClick={() => handleRemoveImageClick(post, image)}
			className="cursor-pointer indicator-item rounded-full m-1 h-5 w-5 badge bg-[red] "
		>
			X
		</span>
	);
};

export default RemoveImageButton;
