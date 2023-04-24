import { Transition } from '@headlessui/react';
import React, { useEffect, useState } from 'react';

const Test = () => {
	useEffect(() => {
		setIsShowing(true);
	}, []);

	const [isShowing, setIsShowing] = useState(false);

	return (
		<>
			<Transition
				show={isShowing}
				enter="transition  duration-5000 transform"
				enterFrom="translate-y-full"
				enterTo="translate-y-0"
				leave="transition-opacity duration-150"
				leaveFrom="opacity-100"
				leaveTo="opacity-0"
			>
				<div className="chat-bubble">NOICE</div>
			</Transition>
		</>
	);
};

export default Test;
