import { autocomplete, AutocompleteOptions } from '@algolia/autocomplete-js';
import { BaseItem } from '@algolia/autocomplete-core';
import React, { createElement, Fragment, useEffect, useRef } from 'react';
import { createRoot } from 'react-dom/client';
import { trpc } from '@utils/trpc';
import { SearchSuggest } from '@elastic/elasticsearch/lib/api/types';
import { env } from 'env/client.mjs';

const Test = () => {
	const suggestionMut = trpc.upload.getPresignedUrl.useMutation();
	return (
		<>
			<button className="btn" onClick={() => suggestionMut.mutate({})}>
				CLICK
			</button>

			<img src={suggestionMut.data} alt="" />
			{/* <AutoComplete
				openOnFocus={true}
				options={{
					getSources: async ({ query }) => [
						{
							sourceId: 'categories',
							getItems: async ({ query }) => {
								const result = await suggestionMut.mutateAsync({
									category: query
								});
								const result2 = result ? result['category-suggest-fuzzy']?.map(val => val.options) ?? [] : [];
								return result2
							},
							getItemUrl: ({ item }) => {
								return `${env.NEXT_PUBLIC_URL}/?query=${getStringFromESResult(item)}`
							}
						}
					]
				}}
			/> */}
		</>
	);
};

export default Test;
