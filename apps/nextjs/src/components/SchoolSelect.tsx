import { useState, useRef } from 'react';
import {
	ClearRefinements,
	UseRefinementListProps,
	UseSearchBoxProps,
	useClearRefinements,
	useRefinementList,
	useSearchBox
} from 'react-instantsearch-hooks-web';

enum UserStatus {
	NOTHING = '',
	ASC = 'asc',
	DESC = 'desc'
}

const SearchBar: React.FC<UseRefinementListProps & UseSearchBoxProps & { text?: string }> = (
	props
) => {
	const [selectedSchool, setSelectedSchool] = useState<string | undefined>('UT Dallas');

	const { items, refine, canRefine } = useRefinementList(props);

	const { query, refine: searchRefine } = useSearchBox(props);

	const [inputValue, setInputValue] = useState(query);
	const inputRef = useRef<HTMLInputElement>(null);

	const handleRefine = (value: string | null) => {
		console.log(value);

		canRefine && value && refine(value);
	};

	if (query !== inputValue && !inputRef.current) {
		setInputValue(query);
	}
	return (
		<div className="mx-auto  relative ">
			<select
				className="select select-sm lg:select-md  max-w-xs select-secondary mx-auto rounded-md lg:rounded-xl"
				value={selectedSchool}
				onChange={(e) => handleRefine(e.target.value)}
			>
				<option disabled selected>
					School
				</option>
				{items.map((item) => (
					<option key={item.value} value={item.value}>
						{item.label}
					</option>
				))}
			</select>
		</div>
	);
};

export default SearchBar;
