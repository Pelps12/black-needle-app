import { trpc } from '@utils/trpc';

const Test = () => {
	const suggestionMut = trpc.upload.getPresignedUrl.useMutation();

	const handleClick = () => {
		suggestionMut.mutate({
			type: 'GET',
			roomId: 'cldcra91i0000mo0ffkxiye76',
			key: 'chat/b248cbcb-3c92-4fa4-a952-dfc9d97adc6b.JPG'
		});
	};
	return (
		<>
			<button className="btn" onClick={() => handleClick()}>
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
