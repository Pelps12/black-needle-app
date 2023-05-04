import { useBearStore, useMessageCountStore } from '../utils/messsageStore';
import { trpc } from '../utils/trpc';
import Modal from './Modal';
import ShoppingCart from './ShoppingCart';
import { assertConfiguration } from '@ably-labs/react-hooks';
import { useUser, useAuth } from '@clerk/nextjs';
import { motion } from 'framer-motion';
import Head from 'next/head';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';

const Navbar = () => {
	const { user, isSignedIn, signIn, isLoaded } = useUser();
	const { signOut } = useAuth();
	const [isOpen, setIsOpen] = useState(false);
	const [isCart, setIsCart] = useState(false);
	const products = trpc.cart.getCart.useQuery(undefined, {
		enabled: false
	});
	const deleteProducts = trpc.cart.deletefromCart.useMutation();
	function closeModal() {
		setIsOpen(false);
	}

	function openModal() {
		setIsOpen(true);
	}

	const onShoppingCartClick = () => {
		setIsCart(true);

		const { data, isSuccess } = products.refetch();
		if (isSuccess) {
			//console.log(data);
		}

		//console.log('HELLO');
	};
	const [providers, setProviders] = useState(null);
	const bears = useBearStore((state) => state.bears);
	const setBears = useBearStore((state) => state.setBears);
	const messages = useMessageCountStore((state) => state.messages);

	const uniqueItems = (list, keyFn) =>
		list.reduce(
			(resultSet, item) => resultSet.add(typeof keyFn === 'string' ? item[keyFn] : keyFn(item)),
			new Set()
		).size;

	const messageCount = uniqueItems(messages, 'name');

	useEffect(() => {
		async function anyNameFunction() {
			const { data, isSuccess } = await products.refetch();
			if (isSuccess) {
				setBears(data.length);
			}
		}

		// Execute the created function directly
		anyNameFunction();
	}, []);

	const handleLogout = (e) => {
		e.preventDefault();
		//assertConfiguration().close(); //Close Ably Client on Logout
		signOut({ redirect: true, callbackUrl: window.location.href });
	};
	return (
		<>
			<div className="navbar bg-base-100">
				<div className="flex-1">
					<Link className="font-bold text-xl no-animation uppercase p-0 flex items-end" href="/">
						<Image src="/logo.svg" width={50} height={50} alt="Logo" />
						akpa
					</Link>
				</div>
				<div className="flex-none gap-2">
					<a onClick={onShoppingCartClick} className="btn btn-ghost btn-circle">
						<div className="indicator">
							<svg
								xmlns="http://www.w3.org/2000/svg"
								className="h-5 w-5"
								fill="none"
								viewBox="0 0 24 24"
								stroke="currentColor"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth="2"
									d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
								/>
							</svg>
							<span className="badge badge-primary badge-sm indicator-item h-5 w-5 rounded-full">
								{bears}
							</span>
						</div>
					</a>
					{isCart && (
						<ShoppingCart
							deleteProducts={deleteProducts}
							setBears={setBears}
							products={products}
							setIsCart={setIsCart}
						/>
					)}

					<div className="dropdown dropdown-end">
						{!isSignedIn && isLoaded ? (
							<>
								<label tabIndex={0} className="btn btn-primary modal-button " htmlFor="my-modal-4">
									SIGN IN
								</label>
							</>
						) : !isSignedIn && !isLoaded ? (
							<label tabIndex={0} className=" avatar">
								<div className="w-10 rounded-full">
									<h2 className="h-10 w-10 rounded-full bg-gray-400 animate-pulse" />
								</div>
							</label>
						) : (
							<>
								<label tabIndex={0} className={`avatar `}>
									<div className="w-10 rounded-full">
										<Image
											src={user.profileImageUrl || '/Missing_avatar.svg'}
											className="w-10 rounded-full"
											width="100"
											height="100"
											alt="Profile Picture"
										/>
									</div>
								</label>
								<ul
									tabIndex={0}
									className="menu menu-compact dropdown-content mt-3 p-2 shadow-lg bg-base-100 rounded-box w-52"
								>
									<li>
										<Link href="/profile">Profile</Link>
									</li>
									<li>
										<Link href="/chat">Chat</Link>
									</li>
									<li>
										{user?.publicMetadata.role === 'SELLER' ? (
											<Link href={`/seller/${user.id}`}>Seller Page</Link>
										) : (
											<Link href="/join">Become a Seller</Link>
										)}
									</li>

									<li>
										<p onClick={handleLogout}>Logout</p>
									</li>
								</ul>
							</>
						)}
					</div>
				</div>
			</div>
		</>
	);
};

export default Navbar;
