import { MixpanelContext } from '../../providers/Mixpanel';
import { env } from '../env/client.mjs';
import { useLoginStore } from '../utils/loginModalStore';
import { trpc } from '../utils/trpc';
import Footer from './Footer';
import LoginForm from './LoginForm';
import Navbar from './Navbar';
import SearchBar from './SearchBar';
import { useRouter } from 'next/router';
import { useState, useEffect, useContext } from 'react';

export default function Layout({ children }) {
	const [providers, setProviders] = useState(null);
	const [checked2, setChecked2] = useState(false);
	const resultMut = trpc.search.getSearchedPrices.useMutation();
	const [searchResults, setSearchResults] = useState([]);
	const [filterValue, setFilterValue] = useState('');
	const router = useRouter();

	useEffect(() => {
		console.log(checked2);
	}, [checked2]);
	return (
		<>
			{env.NEXT_PUBLIC_IN_DEV !== 'dev' && <Navbar />}
			{router.pathname !== '/' && (
				<SearchBar
					setSearchResults={setSearchResults}
					resultMut={resultMut}
					filterValue={filterValue}
				/>
			)}
			<main>{children}</main>
			<input
				type="checkbox"
				id="my-modal-4"
				className="modal-toggle"
				value={checked2}
				onChange={(e) => setChecked2(e.target.checked)}
			/>
			<label htmlFor="my-modal-4" className="modal cursor-pointer">
				<label className="relative" htmlFor="">
					<LoginForm />
				</label>
			</label>
			{/* <Footer /> */}
		</>
	);
}
