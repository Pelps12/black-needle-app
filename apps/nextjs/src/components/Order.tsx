import React, { useEffect, useState } from 'react';
import { Tab } from '@headlessui/react';
import { trpc } from '../utils/trpc';
import { Category, OrderOnItem, Price, Image as PrismaImage, OrderStatus } from '@prisma/client';
import Image from 'next/image';
import { useSession } from 'next-auth/react';
import { env } from '../env/client.mjs';
import Appointment from './Appointment';
import { useRouter } from 'next/router';

function classNames(...classes: string[]) {
	return classes.filter(Boolean).join(' ');
}

const Order: React.FC = () => {
	const { data: session, status } = useSession();
	const router = useRouter();
	const ind = router.query.defaultIndex;
	const index = typeof ind === 'string' ? ind : typeof ind === 'undefined' ? 'undefined' : ind[0]!;
	const [sellerMode, setSellerMode] = useState(false);
	const paymentMut = trpc.order.createOrder.useMutation();
	const [idList, setIdList] = useState<string[]>([]); //For adding to create checkout
	const orders = trpc.order.getOrders.useQuery({
		sellerMode: sellerMode
	});
	const appointment = trpc.appointment.getAppointment.useQuery({
		sellerMode: sellerMode
	});

	useEffect(() => {
		console.log(sellerMode);
	}, [sellerMode]);

	useEffect(() => {
		console.log(idList);
	}, [idList]);

	const handlePayment = () => {
		paymentMut.mutate(
			{
				itemIds: idList,
				origin: `${env.NEXT_PUBLIC_URL}/profile`
			},
			{
				onSuccess: (data) => {
					if (data.url) {
						window.open(data.url, '_self');
					}
				}
			}
		);
	};
	return (
		<div className="col-span-2 mx-auto w-full m-3 px-2">
			<Tab.Group defaultIndex={index === undefined ? 0 : parseInt(index)}>
				<Tab.List className="flex space-x-1 rounded-xl p-1 justify-center">
					<Tab
						key={'upcoming'}
						className={({ selected }) =>
							classNames(
								'transition px-2 py-2.5 text-lg font-bold leading-5',
								'ring-white ring-opacity-60 ring-offset-2 ring-offset-base-200 focus:outline-none border-b-4 ',
								selected
									? 'border-b-primary'
									: 'border-b-transparent hover:bg-white/[0.12] hover:border-b-secondary/50 active:border-b-secondary/75'
							)
						}
					>
						Orders
					</Tab>
					<Tab
						key={'past'}
						className={({ selected }) =>
							classNames(
								'transition px-2 py-2.5 text-lg font-bold leading-5',
								'ring-white ring-opacity-60 ring-offset-2 ring-offset-base-200 focus:outline-none border-b-4 ',
								selected
									? 'border-b-primary'
									: 'border-b-transparent hover:bg-white/[0.12] hover:border-b-secondary/50 active:border-b-secondary/75'
							)
						}
						defaultChecked={true}
					>
						Appointments
					</Tab>
				</Tab.List>
				<div className="flex justify-end items-center">
					{session?.user?.role === 'SELLER' && (
						<div className="flex items-center gap-2 font-semibold">
							SELLER MODE
							<input
								type="checkbox"
								className="  toggle toggle-secondary "
								onChange={(e) => {
									setSellerMode(!sellerMode);
								}}
							/>
						</div>
					)}
					{idList.length > 0 && (
						<button className="btn btn-primary btn-sm" onClick={() => handlePayment()}>
							PAY
						</button>
					)}
				</div>

				<Tab.Panels className="mt-2 w-full select-none">
					<Tab.Panel
						className={classNames(
							'rounded-xl bg-base-100 p-3',
							'ring-white ring-opacity-60 ring-offset-2 ring-offset-blue-400 '
						)}
					>
						{orders.data?.map((order) => (
							<>
								<OrderComp
									order={order}
									sellerMode={sellerMode}
									refetch={orders.refetch}
									list={idList}
									setIdList={setIdList}
								/>
								<div className="divider"></div>
							</>
						))}
					</Tab.Panel>

					<Tab.Panel
						className={classNames(
							'rounded-xl bg-base-100 p-3',
							'ring-white ring-opacity-60 ring-offset-2 ring-offset-blue-400 '
						)}
					>
						{appointment.data?.map((appointments) => (
							<>
								<Appointment
									refetch={appointment.refetch}
									appointments={appointments}
									sellerMode={sellerMode}
								/>
								<div className="divider"></div>
							</>
						))}
					</Tab.Panel>
				</Tab.Panels>
			</Tab.Group>
		</div>
	);
};

export default Order;

const OrderComp = ({
	order,
	sellerMode,
	refetch,
	list,
	setIdList
}: {
	order: OrderOnItem & {
		price: Price & {
			category: Category & {
				Image: PrismaImage[];
				seller: {
					downPaymentPercentage: number | null;
				};
			};
		};
	};
	sellerMode: boolean;
	refetch: any;
	list: string[];
	setIdList: React.Dispatch<React.SetStateAction<string[]>>;
}) => {
	const mutation = trpc.order.updateOrderStatus.useMutation();

	const [add, setAdd] = useState<{
		previousState: boolean | null;
		newState: boolean;
	}>({
		previousState: null,
		newState: true
	});

	const toggleAddtionToList = (id: string) => {
		setAdd({
			previousState: add.newState,
			newState: !add.newState
		});
	};
	useEffect(() => {
		console.log(add);
		if (!(add.previousState === null)) {
			if (add.previousState) {
				setIdList([...list, order.id]);
			} else {
				console.log('THIS STATE');
				const arr = [...list];
				const index = arr.indexOf(order.id, 0);

				if (index > -1) {
					arr.splice(index, 1);
					setIdList(arr);
				}
			}
		}
	}, [add]);

	const changeStatus = async (newStatus: OrderStatus, itemId: string) => {
		await mutation.mutateAsync({
			newStatus,
			itemId
		});
		refetch();
	};

	return (
		<div className="flex flex-col">
			<div key={order.id} className="flex gap-3 items-center justify-between">
				<div className="flex  items-center basis-3/4">
					<Image
						src={order.price.category.Image[0]?.link || ':)'}
						alt={order.price.category.name}
						width={100}
						className="object-cover rounded-md h-[100px] w-[100px]"
						height={100}
					/>{' '}
					<p className="uppercase font-extrabold text-xs sm:text-sm">
						{order.price.name.substring(0, 20)}
						{order.price.name.length > 20 && '...'}
					</p>
				</div>

				<div className="text-sm">
					<strong>Qty: </strong>
					{order.quantity}
				</div>
				<div className="text-right flex flex-col items-end md:flex-row gap-3">
					<div className="text-primary font-bold">$ {order.quantity * order.price.amount}</div>
				</div>
			</div>

			<div className="flex justify-end gap-2 items-center">
				{sellerMode && order.status === 'PENDING' && (
					<>
						<button onClick={() => changeStatus('APPROVED', order.id)}>
							<Image
								src="/yes.svg"
								alt={'Yes'}
								width={20}
								className="object-cover rounded-md mx-5"
								height={20}
							/>
						</button>
						<button onClick={() => changeStatus('DECLINED', order.id)}>
							<Image
								src="/no.svg"
								alt={'Yes'}
								width={20}
								className="object-cover rounded-md mx-5"
								height={20}
							/>
						</button>
					</>
				)}
				{!sellerMode && order.status === 'APPROVED' && (
					<button
						className={`btn btn-outline btn-sm ${add.newState ? 'btn-secondary' : 'btn-error'}`}
						onClick={() => toggleAddtionToList(order.id)}
					>
						{add.newState ? 'ADD TO' : 'REMOVE FROM'} PAYMENTS
					</button>
				)}
				<div
					className={`${
						order.status === 'PENDING'
							? 'text-warning'
							: order.status === 'DECLINED' ||
							  order.status === 'FAILED' ||
							  order.status === 'CANCELED'
							? 'text-error'
							: 'text-success'
					} font-bold `}
				>
					{order.status}
				</div>
			</div>
		</div>
	);
};
