import { trpc } from '../utils/trpc';
import { Dialog, Tab, Transition } from '@headlessui/react';
import React, { Fragment, useEffect, useRef, useState } from 'react';
import 'react-datepicker/dist/react-datepicker.css';
import Modal from './Modal';
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
import { filterProps } from 'framer-motion';

const Availability = ({ uid }) => {
	function classNames(...classes) {
		return classes.filter(Boolean).join(' ');
	}
	let [isOpen, setIsOpen] = useState(false);
	function closeModal() {
		setIsOpen(false);
		setShowError(false);
	}
	function openModal() {
		setIsOpen(true);
	}
	const createAvailiability = trpc.user.createNewAvailability.useMutation();
	const deleteSellerAvailability = trpc.appointment.deleteSellerAvailability.useMutation();
	const [addFormData, setAddFormData] = useState({
		firstHours: null,
		firstMinutes: null,
		firstampm: null,
		secondHours: null,
		secondMinutes: null,
		secondampm: null
	});
	const today = startOfToday();
	const [startDate, setStartDate] = useState(new Date());
	const [showSaveButton, setShowSaveButton] = useState('disable');
	const [showError, setShowError] = useState(false);
	let [padding, setPadding] = useState(52);
	let [selectedDay, setSelectedDay] = useState(today);
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
	const getSellerAvailabilty = trpc.appointment.getSellerAvailabilty.useQuery(
		{
			sellerId: uid,
			day: format(selectedDay, 'EEEE').toUpperCase()
		},
		{
			refetchInterval: undefined,
			enabled: true,
			staleTime: undefined
		}
	);
	const [availability, setAvailability] = useState([]);
	useEffect(() => {
		console.log(selectedDay);
	}, [selectedDay]);

	useEffect(() => {
		let newArray = [];
		var i = 0;
		var j = 0;
		while (
			getSellerAvailabilty.data &&
			getSellerAvailabilty.data != undefined &&
			i < getSellerAvailabilty.data.length
		) {
			// while (j < getSellerAvailabilty.data[i].prices.length) {
			// 	newArray.push(getSellerAvailabilty.data[i].prices[j]);
			// 	j++;
			// }
			console.log(getSellerAvailabilty.data[i]);
			const obj = {
				from: getSellerAvailabilty.data[i].from,
				to: getSellerAvailabilty.data[i].to,
				id: getSellerAvailabilty.data[i].id
			};

			newArray.push(obj);
			i++;
		}
		console.log('Hello Ini');
		console.log(newArray);
		setAvailability(newArray);
	}, [getSellerAvailabilty.data]);

	const newDays = eachDayOfInterval({
		start: firstDayCurrentMonth,
		end: endOfWeek(endOfMonth(firstDayCurrentMonth))
	});
	function nextMonth() {
		let firstDayNextMonth = add(firstDayCurrentMonth, { months: 1 });
		setCurrentMonth(format(firstDayNextMonth, 'MMM-yyyy'));
	}

	function previousMonth() {
		let firstDayNextMonth = add(firstDayCurrentMonth, { months: -1 });
		setCurrentMonth(format(firstDayNextMonth, 'MMM-yyyy'));
	}
	function convertSecondsToHoursMinutes(seconds) {
		let hours = Math.floor(seconds / 3600);
		let minutes = Math.floor((seconds % 3600) / 60);
		let ampm = hours >= 12 ? 'pm' : 'am';

		if (hours > 12) {
			hours -= 12;
		}

		if (hours === 0) {
			hours = 12;
		}

		if (minutes < 10) {
			minutes = '0' + minutes;
		}

		return { hours, minutes, ampm };
	}

	const onSelectDate = (day) => {
		if (day.toISOString() === selectedDay.toISOString()) {
			setUserSelectedDay(!userSelectedDay);
		} else {
			setUserSelectedDay(true);
			setSelectedDay(day);
		}

		console.log(availability);
	};
	function hasNull(target) {
		for (var member in target) {
			if (target[member] == null) return true;
		}
		return false;
	}
	const onAvailabilitySubmit = async (event) => {
		event.preventDefault();

		var firstHour = parseFloat(addFormData.firstHours);
		var firstMinutes = '0.' + addFormData.firstMinutes;
		var fromHour;
		var fromMinutes;
		var toHour;
		var toMinutes;
		var from;
		var to;
		firstHour += parseFloat(firstMinutes);
		var secondHour = parseFloat(addFormData.secondHours);
		var secondMinutes = '0.' + addFormData.secondMinutes;
		secondHour += parseFloat(secondMinutes);
		if (addFormData.firstampm === 'pm' && addFormData.firstHours != '12') {
			firstHour = parseFloat(addFormData.firstHours) + 12;
			firstHour += parseFloat(firstMinutes);
		}
		if (addFormData.secondampm === 'pm' && addFormData.secondHours != '12') {
			secondHour = parseFloat(addFormData.secondHours) + 12;
			secondHour += parseFloat(secondMinutes);
		}
		if (firstHour > secondHour) {
			setPadding(32);
			setShowError(true);
		} else {
			setPadding(52);
			setShowError(false);
			if (firstHour % 1 != 0) {
				fromHour = Math.trunc(firstHour) * 3600;
				fromMinutes = 0.5 * 3600;
				from = fromHour + fromMinutes;
			} else {
				fromHour = Math.trunc(firstHour) * 3600;
				from = fromHour;
			}
			if (secondHour % 1 != 0) {
				toHour = Math.trunc(secondHour) * 3600;
				toMinutes = 0.5 * 3600;
				to = toHour + toMinutes;
			} else {
				toHour = Math.trunc(secondHour) * 3600;
				to = toHour;
			}
			// const newProduct = {
			// 	firstHours: addFormData.firstHours,
			// 	firstMinutes: addFormData.firstMinutes,
			// 	firstampm: addFormData.firstampm,
			// 	secondHours: addFormData.secondHours,
			// 	secondMinutes: addFormData.secondMinutes,
			// 	secondampm: addFormData.secondampm
			// };

			createAvailiability.mutate(
				{
					from: from,
					to: to,
					sellerId: uid,
					day: format(selectedDay, 'EEEE').toUpperCase()
				},
				{
					onSuccess: (data) => {
						console.log(data.timeslot);
						var newArray = [];
						// Line 227 to Line 258 is not being used
						var year = selectedDay.getFullYear();
						var month = selectedDay.getMonth() + 1; // Jan is 0, dec is 11
						var day = selectedDay.getDate();
						var dateString = '' + year + '-' + month + '-' + day;
						const fromHour = data.timeslot.from;
						const fromDiv = fromHour / 3600;
						var fromMin;
						var fromHr;
						if (fromDiv % 1 != 0) {
							fromHr = Math.trunc(fromDiv);
							fromMin = 30;
						} else {
							fromHr = Math.trunc(fromDiv);
							fromMin = '00';
						}

						const toHour = data.timeslot.to;
						const toDiv = toHour / 3600;
						var toMin;
						var toHr;
						if (toDiv % 1 != 0) {
							toHr = Math.trunc(toDiv);
							toMin = 30;
						} else {
							toHr = Math.trunc(toDiv);
							toMin = '00';
						}

						var fromTimeString = 'T' + fromHr + ':' + fromMin + ':00';
						var toTimeString = 'T' + toHr + ':' + toMin + ':00';
						var from = new Date(dateString + ' ' + fromTimeString);
						var to = new Date(dateString + ' ' + toTimeString);

						const obj = {
							id: data.timeslot.id,
							from: data.timeslot.from,
							to: data.timeslot.to
						};

						console.log(availability);
						console.log(newArray);
						setAvailability([...availability, obj]);
						setIsOpen(false);
					}
				}
			);
		}
	};

	const onDeleteClick = (id) => {
		console.log(id);
		const newAvailability = [...availability];
		newAvailability.splice(
			newAvailability.map((availabilities) => availabilities.id).indexOf(id),
			1
		);
		setAvailability(newAvailability);
		deleteSellerAvailability.mutate({
			availabilityId: id
		});
	};
	const onChangeTime = (event) => {
		event.preventDefault();
		const fieldName = event.target.getAttribute('name');
		const value = event.target.value;
		const newProductData = { ...addFormData };

		newProductData[fieldName] = value;
		if (hasNull(newProductData)) {
			console.log(newProductData);
			setShowSaveButton('disable');
		} else {
			setShowSaveButton('');
		}
		setAddFormData(newProductData);
	};
	return (
		<div className="flex items-center justify-center py-8 px-4">
			<div className="w-full shadow-lg">
				<div className="md:p-8 p-5 dark:bg-base-200 bg-white rounded-t">
					<div className="px-4 flex items-center justify-between">
						<span tabIndex="0" className="focus:outline-none  text-base font-bold ">
							{format(firstDayCurrentMonth, 'MMM yyyy')}
						</span>
						<div className="flex items-center">
							{format(firstDayCurrentMonth, 'MMM yyyy') === format(today, 'MMM yyyy') ? null : (
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
											'text-black',
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
					<div className="md:py-8 py-5 md:px-16 px-5 dark:bg-neutral bg-gray-50 rounded-b">
						<div className=" text-white flex space-x-8 pl-8">
							<label>From</label>
							<label>To</label>
						</div>
						<div className="px-4">
							{availability.map((time) => (
								<div key={time.key} className="border-b pb-4 border-gray-400 border-dashed">
									<div className="inline-flex">
										<button className="bg-secondary text-white m-1 btn btn-xs">
											{`${convertSecondsToHoursMinutes(time.from).hours}:${
												convertSecondsToHoursMinutes(time.from).minutes
											} ${convertSecondsToHoursMinutes(time.from).ampm}`}
										</button>
									</div>
									<div className="inline-flex">
										<button className="bg-secondary text-white m-1 btn btn-xs">
											{`${convertSecondsToHoursMinutes(time.to).hours}:${
												convertSecondsToHoursMinutes(time.to).minutes
											} ${convertSecondsToHoursMinutes(time.to).ampm}`}
										</button>
									</div>
									<div className="inline-flex">
										<button
											onClick={() => onDeleteClick(time.id)}
											className="ml-16 btn-error text-white m-1 btn btn-xs"
										>
											Delete
										</button>
									</div>
								</div>
							))}
						</div>
						<div className="pt-5 flex justify-center ">
							<button type="button" onClick={openModal} className="btn btn-sm	btn-secondary">
								Add Availability
							</button>
						</div>

						<Modal isOpen={isOpen} closeModal={closeModal}>
							<Transition.Child
								as={Fragment}
								enter="ease-out duration-300"
								enterFrom="opacity-0 scale-95"
								enterTo="opacity-100 scale-100"
								leave="ease-in duration-200"
								leaveFrom="opacity-100 scale-100"
								leaveTo="opacity-0 scale-95"
							>
								<Dialog.Panel className=" w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
									{/* <Dialog.Title as="h3" className="text-lg font-medium leading-6 text-gray-900">
										Add Availability
									</Dialog.Title> */}
									<label
										htmlFor="my-modal-3"
										onClick={closeModal}
										className="btn btn-sm btn-circle absolute right-2 top-2"
									>
										✕
									</label>
									{!showError && (
										<div className="p-4 mb-4 text-sm text-white-700 bg-white-100 rounded-lg dark:bg-white-200 dark:text-white-800"></div>
									)}
									{showError && (
										<div
											className="p-4 mb-4 text-sm text-red-700 bg-red-100 rounded-lg dark:bg-red-200 dark:text-red-800"
											role="alert"
										>
											<span className="font-medium">Incorrect Format!</span>{' '}
											<p>From time must be less than To time</p>
										</div>
									)}

									<form onSubmit={onAvailabilitySubmit}>
										{' '}
										{
											<div className="flex">
												<div className={`inline-flex pb-${padding}`}>
													<div className="mt-2 p-5 w-40 bg-white rounded-lg shadow-xl">
														<label>From</label>
														<div className="flex">
															<select
																defaultValue={'-'}
																onChange={onChangeTime}
																name="firstHours"
																className=" max-h-fit bg-transparent text-xl appearance-none outline-none"
															>
																<option disabled defaultValue>
																	-
																</option>
																<option value="1">1</option>
																<option value="2">2</option>
																<option value="3">3</option>
																<option value="4">4</option>
																<option value="5">5</option>
																<option value="6">6</option>
																<option value="7">7</option>
																<option value="8">8</option>
																<option value="9">9</option>
																<option value="10">10</option>
																<option value="11">11</option>
																<option value="12">12</option>
															</select>
															<span className="text-xl mr-3">:</span>
															<select
																defaultValue={'--'}
																onChange={onChangeTime}
																name="firstMinutes"
																className="max-h-fit bg-transparent text-xl appearance-none outline-none mr-4"
															>
																<option disabled defaultValue>
																	--
																</option>
																<option value="0">00</option>
																<option value="30">30</option>
															</select>
															<select
																defaultValue={'--'}
																onChange={onChangeTime}
																name="firstampm"
																className="bg-transparent text-xl appearance-none outline-none"
															>
																<option disabled defaultValue>
																	--
																</option>
																<option value="am">AM</option>
																<option value="pm">PM</option>
															</select>
														</div>
													</div>
													<div className="mt-2 p-5 w-40 bg-white rounded-lg shadow-xl">
														<label>To</label>
														<div className="flex">
															<select
																defaultValue={'-'}
																onChange={onChangeTime}
																name="secondHours"
																className="bg-transparent text-xl appearance-none outline-none"
															>
																<option disabled defaultValue>
																	-
																</option>
																<option value="1">1</option>
																<option value="2">2</option>
																<option value="3">3</option>
																<option value="4">4</option>
																<option value="5">5</option>
																<option value="6">6</option>
																<option value="7">7</option>
																<option value="8">8</option>
																<option value="9">9</option>
																<option value="10">10</option>
																<option value="11">11</option>
																<option value="12">12</option>
															</select>
															<span className="text-xl mr-3">:</span>
															<select
																defaultValue={'--'}
																onChange={onChangeTime}
																name="secondMinutes"
																className="bg-transparent text-xl appearance-none outline-none mr-4"
															>
																<option disabled defaultValue>
																	--
																</option>
																<option value="0">00</option>
																<option value="30">30</option>
															</select>
															<select
																defaultValue={'--'}
																onChange={onChangeTime}
																name="secondampm"
																className="bg-transparent text-xl appearance-none outline-none"
															>
																<option disabled defaultValue>
																	--
																</option>
																<option value="am">AM</option>
																<option value="pm">PM</option>
															</select>
														</div>
													</div>
												</div>
											</div>
										}
										<div className="pt-12 flex justify-center ">
											<button
												disabled={showSaveButton}
												className="btn btn-sm rounded-2xl btn-primary  "
											>
												{' '}
												Save
											</button>
										</div>
									</form>
								</Dialog.Panel>
							</Transition.Child>
						</Modal>
					</div>
				)}
			</div>
		</div>
	);
};

export default Availability;
