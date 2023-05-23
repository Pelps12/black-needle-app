import { trpc } from '../utils/trpc';
import { env } from '@acme/env-config/env';
import { Dialog, Tab, Transition } from '@headlessui/react';
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
	startOfToday
} from 'date-fns';
import { useRouter } from 'next/router';
import React, { Fragment, useEffect, useRef, useState } from 'react';

const BuyerAppointment = ({ sellerId, priceId, isOpen, closeModal }) => {
	function classNames(...classes) {
		return classes.filter(Boolean).join(' ');
	}
	const router = useRouter();
	const getFreeTimeslots = trpc.appointment.getFreeTimeslots.useMutation();
	const createAppointment = trpc.appointment.createAppointment.useMutation();
	const today = startOfToday();
	let [selectedDay, setSelectedDay] = useState(today);
	const [morningTime, setMorningTime] = useState([]);
	const [afternoonTime, setAfternoonTime] = useState([]);
	let [userSelectedDay, setUserSelectedDay] = useState(false);
	let [currentMonth, setCurrentMonth] = useState(format(today, 'MMM-yyyy'));
	let firstDayCurrentMonth = parse(currentMonth, 'MMM-yyyy', new Date());

	let colStartClasses = [
		'',
		'col-start-2',
		'col-start-3',
		'col-start-4',
		'col-start-5',
		'col-start-6',
		'col-start-7'
	];
	const newDays = eachDayOfInterval({
		start: firstDayCurrentMonth,
		end: endOfWeek(endOfMonth(firstDayCurrentMonth))
	});

	useEffect(() => {
		console.log(newDays);
	}, []);
	function nextMonth() {
		let firstDayNextMonth = add(firstDayCurrentMonth, { months: 1 });
		setCurrentMonth(format(firstDayNextMonth, 'MMM-yyyy'));
	}

	function previousMonth() {
		let firstDayNextMonth = add(firstDayCurrentMonth, { months: -1 });
		setCurrentMonth(format(firstDayNextMonth, 'MMM-yyyy'));
	}
	function onSelectTime(time) {
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
					if (err.data.code === 'UNAUTHORIZED') {
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
	function onSelectDate(day) {
		var tempArray = [];

		if (day.toISOString() === selectedDay.toISOString()) {
			setUserSelectedDay(!userSelectedDay);
		} else {
			setUserSelectedDay(true);
		}
		setSelectedDay(day);

		const selectDate = getFreeTimeslots.mutate(
			{
				sellerId: sellerId,
				day: format(day, 'EEEE').toUpperCase(),
				priceId: priceId,
				date: day
			},
			{
				onSuccess: (data) => {
					// console.log(data)
					const [morning, afternoon] = data.reduce(
						(result, value) => {
							// console.log(value)
							result[value.date.getHours() < 12 ? 0 : 1].push(value);
							return result;
						},
						[[], []]
					);
					setMorningTime(morning);
					setAfternoonTime(afternoon);

					console.log(morning);
					console.log(afternoon);
				}
			}
		);
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
				<Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle transition-all">
					<Dialog.Title as="h3" className="text-lg font-medium leading-6 text-gray-900">
						Book Appointment
					</Dialog.Title>
					<label
						htmlFor="my-modal-3"
						onClick={closeModal}
						className="btn btn-sm btn-circle absolute right-2 top-2"
					>
						✕
					</label>
					<div className="flex items-center justify-center py-8 px-4">
						<div className="max-w-sm w-full">
							<div className="md:p-8 p-5 dark:bg-white bg-white rounded-t">
								<div className="px-4 flex items-center justify-between">
									<span
										tabIndex="0"
										className="focus:outline-none   text-base font-bold dark:text-gray-800 text-gray-800"
									>
										{format(firstDayCurrentMonth, 'MMM yyyy')}
									</span>
									<div className="flex items-center">
										{format(firstDayCurrentMonth, 'MMM yyyy') ===
										format(today, 'MMM yyyy') ? null : (
											<button
												aria-label="calendar backward"
												type="button"
												onClick={previousMonth}
												className="focus:text-gray-400 hover:text-gray-400 text-gray-800 dark:text-black"
											>
												<svg
													xmlns="http://www.w3.org/2000/svg"
													className="icon icon-tabler icon-tabler-chevron-left"
													width="24"
													height="24"
													viewBox="0 0 24 24"
													strokeWidth="1.5"
													stroke="currentColor"
													fill="none"
													strokeLinecap="round"
													strokeLinejoin="round"
												>
													<path stroke="none" d="M0 0h24v24H0z" fill="none" />
													<polyline points="15 6 9 12 15 18" />
												</svg>
											</button>
										)}
										<button
											aria-label="calendar forward"
											className="focus:text-gray-400 hover:text-gray-400 ml-3 text-gray-800 dark:text-black"
											onClick={nextMonth}
											type="button"
										>
											<svg
												xmlns="http://www.w3.org/2000/svg"
												className="icon icon-tabler  icon-tabler-chevron-right"
												width="24"
												height="24"
												viewBox="0 0 24 24"
												strokeWidth="1.5"
												stroke="currentColor"
												fill="none"
												strokeLinecap="round"
												strokeLinejoin="round"
											>
												<path stroke="none" d="M0 0h24v24H0z" fill="none" />
												<polyline points="9 6 15 12 9 18" />
											</svg>
										</button>
									</div>
								</div>

								<div className="grid grid-cols-7 mt-10 text-xs leading-6 text-center text-gray-500">
									<div>S</div>
									<div>M</div>
									<div>T</div>
									<div>W</div>
									<div>T</div>
									<div>F</div>
									<div>S</div>
								</div>
								<div className="grid grid-cols-7 mt-2 text-sm">
									{newDays.map((day, dayIdx) => (
										<div
											key={day.toString()}
											className={classNames(dayIdx === 0 && colStartClasses[getDay(day)], 'py-1.5')}
										>
											<button
												type="button"
												onClick={() => onSelectDate(day)}
												className={classNames(
													isEqual(day, selectedDay) && 'text-white',
													!isEqual(day, selectedDay) && isToday(day) && 'text-red-500',
													!isEqual(day, selectedDay) &&
														!isToday(day) &&
														isSameMonth(day, firstDayCurrentMonth) &&
														'text-gray-900',
													!isEqual(day, selectedDay) &&
														!isToday(day) &&
														!isSameMonth(day, firstDayCurrentMonth) &&
														'text-gray-400',
													isEqual(day, selectedDay) && isToday(day) && 'bg-primary',
													isEqual(day, selectedDay) && !isToday(day) && 'bg-gray-900',
													!isEqual(day, selectedDay) && 'hover:bg-gray-200',
													(isEqual(day, selectedDay) || isToday(day)) && 'font-semibold',
													'mx-auto flex h-8 w-8 items-center justify-center rounded-full'
												)}
											>
												<time dateTime={format(day, 'yyyy-MM-dd')}>{format(day, 'd')}</time>
											</button>
										</div>
									))}
								</div>
							</div>
							{userSelectedDay && (
								<>
									<div className="md:py-8 py-5 md:px-16 px-5 dark:bg-secondary rounded-b">
										<div className="px-4">
											<p className="focus:outline-none   leading-5 text-gray-800 dark:text-gray-100 mt-2">
												Morning
											</p>
											<div className="border-b pb-4 border-gray-100 border-dashed pt-5">
												<div className="grid grid-cols-2 gap-2">
													{morningTime.map((time, idx) => (
														<div key={idx}>
															<button onClick={() => onSelectTime(time)} className="m-1 btn btn-xs">
																{time.date.toLocaleTimeString([], {
																	hour: '2-digit',
																	minute: '2-digit'
																})}
															</button>
														</div>
													))}
												</div>
											</div>

											<div className="border-b pb-4 border-gray-400 border-dashed pt-5">
												<p className="focus:outline-none   leading-5 text-gray-800 dark:text-gray-100 mt-2">
													Afternoon
												</p>
												<div className="grid grid-cols-2 gap-2">
													{afternoonTime.map((time, idx) => (
														<div key={idx}>
															<button onClick={() => onSelectTime(time)} className="m-1 btn btn-xs">
																{time.date.toLocaleTimeString([], {
																	hour: '2-digit',
																	minute: '2-digit'
																})}
															</button>
														</div>
													))}
												</div>
											</div>
										</div>
									</div>
								</>
							)}
						</div>
					</div>
				</Dialog.Panel>
			</Transition.Child>
		</>
	);
};

export default BuyerAppointment;
