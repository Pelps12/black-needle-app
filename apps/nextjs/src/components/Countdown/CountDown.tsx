import type { NextPage } from 'next';
import Head from 'next/head';
import { useEffect, useState } from 'react';
import { TimerContainer } from './TimerContainer';

const CountDown = ({ date }: { date: Date }) => {
	const [time, setTime] = useState<number>(
		new Date('2023-01-24T04:59:59.000Z').getTime() - Date.now()
	);
	const [newTime, setNewTime] = useState<number>(0);
	const [days, setDays] = useState<number>(0);
	const [hours, setHours] = useState<number>(0);
	const [minutes, setMinutes] = useState<number>(0);
	const [seconds, setSeconds] = useState<number>(0);
	const [message, setMessage] = useState<string>('');

	const timeToDays = time;

	useEffect(() => {
		console.log(new Date('2023-01-24T06:00:00.000Z').toLocaleTimeString());
	}, []);

	const countDownDate = new Date().getTime() + timeToDays;

	useEffect(() => {
		console.log(countDownDate);
		const updateTime = setInterval(() => {
			const now = Date.now();

			const difference = countDownDate - now;

			const newDays = Math.floor(difference / (1000 * 60 * 60 * 24));
			const newHours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
			const newMinutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
			const newSeconds = Math.floor((difference % (1000 * 60)) / 1000);

			setDays(newDays);
			setHours(newHours);
			setMinutes(newMinutes);
			setSeconds(newSeconds);

			if (difference <= 0) {
				clearInterval(updateTime);
				setMessage('The Launch Has Started');
				setDays(0);
				setHours(0);
				setMinutes(0);
				setSeconds(0);
			}
		});
		console.log(new Date('2023-01-24T04:59:59.000Z').toLocaleTimeString());

		return () => {
			clearInterval(updateTime);
		};
	}, [time]);

	const handleClick = () => {
		setTime(newTime);
		console.log(time);
		setNewTime(0);
	};

	const handleChange = (e: any) => {
		const inputTime = e.target.value;
		setNewTime(inputTime);
	};

	return <TimerContainer days={days} hours={hours} minutes={minutes} seconds={seconds} />;
};

export default CountDown;
