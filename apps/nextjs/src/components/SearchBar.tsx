import { useState, useEffect, SetStateAction, Dispatch } from 'react';

import AsyncSelect from 'react-select/async-creatable';
import { trpc } from '../utils/trpc';
import { useRouter } from 'next/router';

enum UserStatus {
	NOTHING = '',
	ASC = 'asc',
	DESC = 'desc'
}

const SearchBar: React.FC<{
	setSearchResults: Dispatch<SetStateAction<any[]>>;
	filterValue: UserStatus;
	text?: string;
	resultMut: any;
	setText?: Dispatch<SetStateAction<string>>;
	setIsRunning?: Dispatch<SetStateAction<boolean>>;
}> = ({ setSearchResults, filterValue, text, resultMut, setText, setIsRunning }) => {
	const [searchInput, setSearchInput] = useState<string | null>(null);
	const [selectedSchool, setSelectedSchool] = useState<string | undefined>('UT Dallas');
	const router = useRouter();
	const suggestionMut = trpc.search.getSuggestedCategories.useMutation();

	const search = (val: string) => {
		if (selectedSchool) {
			router.push(`/?query=${val}`, undefined, {
				shallow: true
			});
		}
	};

	const handleKeyPress = (e: React.KeyboardEvent<HTMLDivElement>) => {
		if (e.key === 'Enter') {
			console.log(selectedSchool);
			searchInput && search(searchInput);
		}
	};
	const value = {
		value: searchInput,
		label: <div>{searchInput}</div>
	};

	useEffect(() => {
		searchInput && search(searchInput);
	}, [filterValue]);

	useEffect(() => {
		const val =
			typeof router.query.query === 'string'
				? router.query.query
				: typeof router.query.query === 'undefined'
				? undefined
				: router.query.query[0]!;

		if (val && selectedSchool) {
			setText && setText('services');
			setIsRunning && setIsRunning(false);

			resultMut.mutate(
				{
					category: val,
					school: selectedSchool,
					...(filterValue === UserStatus.NOTHING ? {} : { price: { order: filterValue } })
				},
				{
					onSuccess: (data: any) => {
						setSearchResults(data);
					}
				}
			);
		}
	}, [router.query.query]);

	const customStyles = {
		control: (base: any) => ({
			...base,
			height: 48,
			minHeight: 48
		})
	};
	return (
		<div className="mx-auto flex gap-2 flex-col md:flex-row md:justify-between max-w-3xl">
			<div className="mx-auto">
				<select
					className="select  max-w-xs select-secondary mx-auto"
					value={selectedSchool}
					onChange={(e) => setSelectedSchool(e.target.value)}
				>
					<option disabled>School</option>
					<option value={'UT Dallas'}>UT Dallas</option>
				</select>
			</div>

			<div className="flex gap-4 basis-3/4 mx-auto w-full justify-center">
				<AsyncSelect
					defaultOptions
					instanceId=":)"
					defaultValue={searchInput}
					isClearable={true}
					onKeyDown={(e) => handleKeyPress(e)}
					placeholder={`Search for ${text || 'services'}`}
					components={{ DropdownIndicator: () => null, IndicatorSeparator: () => null }}
					className="input basis-3/4 h-12"
					styles={customStyles}
					formatCreateLabel={(userInput) => `Search for ${userInput || 'service'}`}
					noOptionsMessage={() => null}
					onChange={(newValue: any) => {
						newValue?.value && setSearchInput(newValue.value);
						newValue && search(newValue.value);
					}}
					loadOptions={async (inputValue: string, callback: any) => {
						setSearchInput(inputValue);
						if (inputValue.length < 2) {
							return [];
						}
						console.log(inputValue);
						const suggestions = await suggestionMut.mutateAsync({
							category: inputValue
						});
						const textSuggestions = suggestions
							? suggestions['category-suggest-fuzzy']
									?.map((result) => {
										if (Array.isArray(result.options)) {
											return result.options.map((option) => {
												return option.text;
											});
										} else {
											return result.options.text;
										}
									})
									.flat()
							: [];

						const textSuggestSet = Array.from(new Set(textSuggestions));
						const result = textSuggestSet
							? textSuggestSet.map((name: string) => ({
									value: name,
									label: (
										<div
											onClick={() => {
												search(name);
												setSearchInput(name);
											}}
										>
											{name}
										</div>
									)
							  }))
							: [];
						return callback(result);
					}}
				/>
				<button onClick={() => searchInput && search(searchInput)}>
					<svg
						version="1.1"
						id="Layer_1"
						xmlns="http://www.w3.org/2000/svg"
						xmlnsXlink="http://www.w3.org/1999/xlink"
						x="0px"
						y="0px"
						className="h-6 fill-primary"
						viewBox="0 0 122.879 119.799"
						enableBackground="new 0 0 122.879 119.799"
						xmlSpace="preserve"
					>
						<g>
							<path d="M49.988,0h0.016v0.007C63.803,0.011,76.298,5.608,85.34,14.652c9.027,9.031,14.619,21.515,14.628,35.303h0.007v0.033v0.04 h-0.007c-0.005,5.557-0.917,10.905-2.594,15.892c-0.281,0.837-0.575,1.641-0.877,2.409v0.007c-1.446,3.66-3.315,7.12-5.547,10.307 l29.082,26.139l0.018,0.016l0.157,0.146l0.011,0.011c1.642,1.563,2.536,3.656,2.649,5.78c0.11,2.1-0.543,4.248-1.979,5.971 l-0.011,0.016l-0.175,0.203l-0.035,0.035l-0.146,0.16l-0.016,0.021c-1.565,1.642-3.654,2.534-5.78,2.646 c-2.097,0.111-4.247-0.54-5.971-1.978l-0.015-0.011l-0.204-0.175l-0.029-0.024L78.761,90.865c-0.88,0.62-1.778,1.209-2.687,1.765 c-1.233,0.755-2.51,1.466-3.813,2.115c-6.699,3.342-14.269,5.222-22.272,5.222v0.007h-0.016v-0.007 c-13.799-0.004-26.296-5.601-35.338-14.645C5.605,76.291,0.016,63.805,0.007,50.021H0v-0.033v-0.016h0.007 c0.004-13.799,5.601-26.296,14.645-35.338C23.683,5.608,36.167,0.016,49.955,0.007V0H49.988L49.988,0z M50.004,11.21v0.007h-0.016 h-0.033V11.21c-10.686,0.007-20.372,4.35-27.384,11.359C15.56,29.578,11.213,39.274,11.21,49.973h0.007v0.016v0.033H11.21 c0.007,10.686,4.347,20.367,11.359,27.381c7.009,7.012,16.705,11.359,27.403,11.361v-0.007h0.016h0.033v0.007 c10.686-0.007,20.368-4.348,27.382-11.359c7.011-7.009,11.358-16.702,11.36-27.4h-0.006v-0.016v-0.033h0.006 c-0.006-10.686-4.35-20.372-11.358-27.384C70.396,15.56,60.703,11.213,50.004,11.21L50.004,11.21z" />
						</g>
					</svg>
				</button>
			</div>
		</div>
	);
};

export default SearchBar;
