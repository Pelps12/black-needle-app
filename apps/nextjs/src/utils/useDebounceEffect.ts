import { useEffect, DependencyList } from 'react';

export function useDebounceEffect(fn: () => void, waitTime: number, deps: any[]) {
	useEffect(() => {
		/* const t = setTimeout(() => {
			fn([...deps ]);
		}, waitTime); */

		return () => {
			//clearTimeout(t);
		};
	}, deps);
}
