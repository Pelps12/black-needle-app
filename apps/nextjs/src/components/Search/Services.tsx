import React from 'react';
import {
	UseRefinementListProps,
	UseSearchBoxProps,
	useClearRefinements,
	useRefinementList
} from 'react-instantsearch-hooks-web';

const Services: React.FC<UseRefinementListProps & UseSearchBoxProps & { text?: string }> = (
	props
) => {
	const { items, refine, canRefine } = useRefinementList(props);
	const { refine: clear } = useClearRefinements({
		includedAttributes: ['service']
	});
	const [selectedService, setSelectedService] = React.useState<string>();

	const toggleCase = React.useCallback(
		(str: string) => {
			return str
				.toLowerCase()
				.split(' ')
				.map(function (word) {
					return word.charAt(0).toUpperCase() + word.slice(1);
				})
				.join(' ');
		},
		[items]
	);

	const handleRefine = (value: string | null) => {
		console.log(value);
		if (canRefine && value) {
			clear();
			refine(value);
			setSelectedService(value);
		}
	};
	return (
		<div className="mt-2 sm:mt-4 grid grid-cols-2 md:grid-cols-4 gap-3 w-full">
			<>
				{items.map((item) => (
					<button
						className={`btn bg-white py-3 rounded-xl ${
							selectedService === item.value ? 'btn-secondary' : ''
						}`}
						onClick={(e) => handleRefine(item.value)}
					>
						{toggleCase(item.label)}
					</button>
				))}
			</>
		</div>
	);
};

export default Services;
