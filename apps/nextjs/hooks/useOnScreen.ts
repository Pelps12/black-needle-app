import { useEffect, useState } from 'react';

export default function useOnScreen(ref: React.RefObject<HTMLLIElement>) {
	const [isIntersecting, setIntersecting] = useState(false);

	useEffect(() => {
		const observer = new IntersectionObserver(([entry]) =>
			setIntersecting(entry?.isIntersecting || true)
		);
		if (ref.current) {
			observer.observe(ref?.current);
		}

		// Remove the observer as soon as the component is unmounted
		return () => {
			observer.disconnect();
		};
	}, []);

	return isIntersecting;
}
