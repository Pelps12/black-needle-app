import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { trpc } from '../utils/trpc';
import Modal from './Modal';
import Cancellation from './Cancellation';

const Appointment = ({ refetch, appointments, sellerMode }) => {
	const appointmentMutation = trpc.appointment.updateAppointmentStatus.useMutation();

	const [isOpen, setIsOpen] = useState(false);
	/* const [add, setAdd] = useState({
		previousState: null,
		newState: true
	}); */
	const appointmentEndpoint = trpc.appointment.payAppointment.useMutation();
	const completionEndpoint = trpc.appointment.completePayment.useMutation();

	const payForAppointment = () => {
		if (appointments.status === 'DOWNPAID') {
			completionEndpoint.mutate(
				{
					appointmentId: appointments.id
				},
				{
					onSuccess: (data) => {
						if (data.url) {
							window.open(data.url, '_self');
						}
					}
				}
			);
		} else {
			appointmentEndpoint.mutate(
				{
					appointmentId: appointments.id
				},
				{
					onSuccess: (data) => {
						if (data.url) {
							window.open(data.url, '_self');
						}
					}
				}
			);
		}
	};

	const chargeAppointmentStatus = async (newStatus, itemId) => {
		await appointmentMutation.mutateAsync({
			newStatus,
			itemId
		});
		refetch();
	};

	function closeModal() {
		setIsOpen(false);
	}

	function openModal() {
		setIsOpen(true);
	}
	return (
		<>
			<div className="flex flex-col">
				<div key={appointments.id} className="flex gap-3 items-center justify-between">
					<div className="flex  items-center basis-3/4">
						<Image
							src={
								`${appointments.price.category.Image[0]?.link}-/preview/-/quality/smart/-/format/auto/` ||
								'https://storage.googleapis.com/proudcity/mebanenc/uploads/2021/03/placeholder-image.png'
							}
							alt={appointments.price.category.name}
							width={100}
							className="object-cover rounded-md h-[100px] w-[100px]"
							height={100}
						/>{' '}
						<p className="uppercase font-extrabold text-xs sm:text-sm">
							{appointments.price.name.substring(0, 20)}
							{appointments.price.name.length > 20 && '...'}
						</p>
					</div>

					<div className="text-sm">
						<strong>Time: </strong>
					</div>
					<div className="text-right flex flex-col items-end  gap-0.5 whitespace-nowrap">
						<div>
							{appointments.appointmentDate.toLocaleDateString('en-US', {
								month: 'short',
								day: 'numeric'
							})}
						</div>
						<div className="text-primary font-bold">
							{appointments.appointmentDate.toLocaleTimeString([], {
								hour: '2-digit',
								minute: '2-digit'
							})}
						</div>
					</div>
				</div>

				<div className="flex justify-end gap-2 items-center">
					{sellerMode && appointments.status === 'PENDING' && (
						<>
							<button onClick={() => chargeAppointmentStatus('APPROVED', appointments.id)}>
								<Image
									src="/yes.svg"
									alt={'Yes'}
									width={20}
									className="object-cover rounded-md mx-5"
									height={20}
								/>
							</button>
							<button onClick={() => chargeAppointmentStatus('DECLINED', appointments.id)}>
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
					{!sellerMode && appointments.status === 'APPROVED' && (
						<button
							className={`btn btn-outline btn-sm btn-secondary`}
							onClick={() => payForAppointment(appointments.id)}
						>
							PAY
						</button>
					)}

					{(appointments.status === 'DOWNPAID' ||
						!appointments.price.category.seller.downPaymentPercentage) &&
						(appointments.appointmentDate > new Date() ? (
							<button className={`btn btn-outline btn-sm btn-error`} onClick={() => openModal()}>
								CANCEL
							</button>
						) : (
							<button
								className={`btn btn-outline btn-sm btn-secondary`}
								onClick={() => payForAppointment(appointments.id)}
							>
								COMPLETE
							</button>
						))}
					<div
						className={`${
							appointments.status === 'PENDING'
								? 'text-warning'
								: appointments.status === 'DECLINED' ||
								  appointments.status === 'FAILED' ||
								  appointments.status === 'CANCELED'
								? 'text-error'
								: 'text-success'
						} font-bold `}
					>
						{appointments.status}
					</div>
				</div>
			</div>

			<Modal isOpen={isOpen} closeModal={closeModal}>
				<Cancellation
					sellerMode={sellerMode}
					appointmentId={appointments.id}
					closeModal={closeModal}
				></Cancellation>
			</Modal>
		</>
	);
};

export default Appointment;
