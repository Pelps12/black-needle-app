import { Dialog, Tab, Transition } from '@headlessui/react';
import React, { Fragment, useEffect, useRef, useState } from 'react';
import { trpc } from '../utils/trpc';
import { env } from '../env/client.mjs';
import { useRouter } from 'next/router';
import {
	add,
	eachDayOfInterval,
	startOfMonth,
	endOfMonth,
	format,
	getDay,
	isEqual,
	isSameDay,
	isSameMonth,
	isToday,
	parse,
	parseISO,
	endOfWeek,
	startOfToday,
	eachMonthOfInterval,
	isPast
} from 'date-fns';
import { Day } from '@prisma/client';
import { inferRouterOutputs } from '@trpc/server';
import { AppRouter } from 'server/trpc/router';

type RouterOutput = inferRouterOutputs<AppRouter>;

type TimeSlotsOutput = RouterOutput['appointment']['getFreeTimeslots'];

type ArrayElement<ArrayType extends readonly unknown[]> =
	ArrayType extends readonly (infer ElementType)[] ? ElementType : never;

type TimeSlot = ArrayElement<TimeSlotsOutput>;

const BuyerAppointment = ({
	sellerId,
	priceId,
	isOpen,
	closeModal
}: {
	sellerId: string;
	priceId: string;
	isOpen: boolean;
	closeModal: () => void;
}) => {
	function classNames(...classes: (string | boolean | undefined)[]) {
		return classes.filter(Boolean).join(' ');
	}
	const router = useRouter();
	const getFreeTimeslots = trpc.appointment.getFreeTimeslots.useMutation();
	const createAppointment = trpc.appointment.createAppointment.useMutation();
	const today = startOfToday();

	const [selectedDay, setSelectedDay] = useState(today);
	const [selectedTimeSlot, setSelectedTimeSlot] = useState<TimeSlot>();
	const [userSelectedDay, setUserSelectedDay] = useState(false);
	const [currentMonth, setCurrentMonth] = useState(format(today, 'MMM-yyyy'));
	const firstDayCurrentMonth = parse(currentMonth, 'MMM-yyyy', new Date());
	const [selectedOption, setSelectedOption] = useState<string>('');

	const newDays = eachDayOfInterval({
		start: isSameMonth(today, firstDayCurrentMonth) ? today : firstDayCurrentMonth,
		end: endOfMonth(isSameMonth(today, firstDayCurrentMonth) ? today : firstDayCurrentMonth)
	});

	useEffect(() => {
		onSelectDate(selectedDay);
	}, []);

	useEffect(() => {
		console.log(currentMonth);
	}, [currentMonth]);

	function setCurrentMonthHandler(e: React.ChangeEvent<HTMLSelectElement>) {
		console.log(new Date(e.target.value));
		setCurrentMonth(format(new Date(e.target.value), 'MMM-yyyy'));
	}

	function getMonthsInYear() {
		const currentYear = new Date().getFullYear();
		const startOfYear = new Date(currentYear, 0, 1);
		const endOfYear = new Date(currentYear, 11, 31);

		return eachMonthOfInterval({ start: startOfYear, end: endOfYear });
	}

	function onSelectTime(time: TimeSlot) {
		console.log(time);

		createAppointment.mutate(
			{
				sellerAvailability: time.availabilityId,
				date: time.date,
				priceId: priceId,
				origin: document.referrer
			},
			{
				onSuccess: (data) => {
					// var windowReference = window.open();
					// windowReference.location.assign(`${env.NEXT_PUBLIC_URL}/profile`)
					// window.open(`${env.NEXT_PUBLIC_URL}/profile`, '_self');
					router.push({
						pathname: `${env.NEXT_PUBLIC_URL}/profile`,
						query: { defaultIndex: 1 }
					});
				},
				onError: (err) => {
					if (err.data?.code === 'UNAUTHORIZED') {
						if (err.message !== 'UNAUTHORIZED') {
							alert(err.message);
						} else {
							document.getElementById('my-modal-4')?.click();
						}
					}
				}
			}
		);
	}
	function onSelectDate(day: Date) {
		if (day.toISOString() === selectedDay.toISOString()) {
			setUserSelectedDay(!userSelectedDay);
		} else {
			setUserSelectedDay(true);
		}
		setSelectedDay(day);

		const selectDate = getFreeTimeslots.mutate({
			sellerId: sellerId,
			day: format(day, 'EEEE').toUpperCase() as Day,
			priceId: priceId,
			date: day
		});
	}
	return (
		<>
			<Transition.Child
				enter="ease-out duration-300"
				enterFrom="opacity-0 scale-95"
				enterTo="opacity-100 scale-100"
				leave="ease-in duration-200"
				leaveFrom="opacity-100 scale-100"
				leaveTo="opacity-0 scale-95"
			>
				<Dialog.Panel className="w-full max-w-sm md:max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle transition-all">
					<Dialog.Title as="h3" className="text-lg font-medium leading-6 text-gray-900">
						<div className="flex items-center gap-3">
							<div> Book Appointment in </div>
							<select
								className="select select-ghost max-w-xs select-sm"
								onChange={(e) => setCurrentMonthHandler(e)}
							>
								{getMonthsInYear().map((month, idx) => (
									<option
										key={idx}
										selected={format(month, 'MMM') == format(today, 'MMM')}
										disabled={isPast(endOfMonth(month))}
										value={month.toISOString()}
									>
										{format(month, 'MMM')}
									</option>
								))}
							</select>
						</div>
					</Dialog.Title>
					<label
						htmlFor="my-modal-3"
						onClick={closeModal}
						className="btn btn-sm btn-circle absolute right-2 top-2"
					>
						✕
					</label>

					<div className="flex overflow-x-auto snap-x snap-mandatory gap-4 basis-0">
						{newDays.map((day, dayIdx) => (
							<div
								key={day.toString()}
								className={`p-5  flex-shrink-0 w-20 rounded-md ${
									isEqual(day, selectedDay) ? 'bg-primary text-base-100' : 'border-2'
								}`}
								onClick={() => onSelectDate(day)}
							>
								<p className="text-center">{format(day, 'EE')}</p>
								<p className="text-center font-bold text-2xl">{format(day, 'd')}</p>
							</div>
						))}
					</div>

					<div className=" mx-auto">
						{getFreeTimeslots.isLoading ? (
							<svg
								version="1.1"
								id="L4"
								xmlns="http://www.w3.org/2000/svg"
								xmlnsXlink="http://www.w3.org/1999/xlink"
								x="0px"
								y="0px"
								viewBox="0 0 100 100"
								enable-background="new 0 0 0 0"
								xmlSpace="preserve"
								className="fill-neutral w-20 h-20 mx-auto"
							>
								<circle stroke="none" cx="6" cy="50" r="6">
									<animate
										attributeName="opacity"
										dur="1s"
										values="0;1;0"
										repeatCount="indefinite"
										begin="0.1"
									/>
								</circle>
								<circle stroke="none" cx="26" cy="50" r="6">
									<animate
										attributeName="opacity"
										dur="1s"
										values="0;1;0"
										repeatCount="indefinite"
										begin="0.2"
									/>
								</circle>
								<circle stroke="none" cx="46" cy="50" r="6">
									<animate
										attributeName="opacity"
										dur="1s"
										values="0;1;0"
										repeatCount="indefinite"
										begin="0.3"
									/>
								</circle>
							</svg>
						) : (
							<>
								<div
									className={`grid grid-cols-3 justify-center ${
										createAppointment.isLoading ? 'opacity-25' : ''
									} `}
								>
									{getFreeTimeslots.data?.map((slot, idx) => (
										<button
											key={idx}
											className="mx-auto border-2 p-3 m-2 rounded-xl"
											onClick={() => setSelectedTimeSlot(slot)}
										>
											{slot.date.toLocaleTimeString([], {
												hour: '2-digit',
												minute: '2-digit'
											})}
										</button>
									))}
								</div>
								{getFreeTimeslots.data?.length === 0 && (
									<div className="mx-auto text-3xl text-center font-bold p-3">NO TIME SLOTS</div>
								)}
							</>
						)}
						{selectedTimeSlot && (
							<>
								<div
									className="mx-2 text-xl font-semibold flex justify-between items-center
							"
								>
									<div>{format(selectedTimeSlot.date, 'MMM dd hh:mma')}</div>
									<button
										className={`btn  ${
											createAppointment.isLoading ? 'btn-disabled' : 'btn-primary'
										}`}
										onClick={() => onSelectTime(selectedTimeSlot)}
									>
										{createAppointment.isLoading && (
											<svg
												className="mr-3 h-5 w-5 animate-spin text-white"
												xmlns="http://www.w3.org/2000/svg"
												fill="none"
												viewBox="0 0 24 24"
											>
												<circle
													className="opacity-25"
													cx="12"
													cy="12"
													r="10"
													stroke="currentColor"
													strokeWidth="4"
												></circle>
												<path
													className="opacity-75"
													fill="currentColor"
													d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
												></path>
											</svg>
										)}
										CONFIRM?
									</button>
								</div>
								<div className="text-xs font-bold mx-2 text-warning">
									Note: Appointment still requires seller approval
								</div>
							</>
						)}
					</div>
				</Dialog.Panel>
			</Transition.Child>
		</>
	);
};

export default BuyerAppointment;
