import { Dialog, Transition } from '@headlessui/react';
import { trpc } from '@utils/trpc';
import React, { Fragment, useState } from 'react';

const Cancellation = ({
	sellerMode,
	appointmentId,
	closeModal
}: {
	sellerMode: boolean;
	appointmentId: string;
	closeModal: () => void;
}) => {
	const refundMutation = trpc.appointment.refundPayment.useMutation();
	const [reason, setReason] = useState<string | undefined>(undefined);
	const refundFlow = () => {
		refundMutation.mutate(
			{
				canceler: sellerMode ? 'SELLER' : 'BUYER',
				appointmentId: appointmentId,
				reason: reason
			},
			{
				onSuccess: () => {
					closeModal();
				}
			}
		);
	};
	return (
		<>
			<Transition.Child
				as={Fragment}
				enter="ease-out duration-300"
				enterFrom="opacity-0 scale-95"
				enterTo="opacity-100 scale-100"
				leave="ease-in duration-200"
				leaveFrom="opacity-100 scale-100"
				leaveTo="opacity-0 scale-95"
			>
				<Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
					<Dialog.Title as="h2" className="text-xl font-medium leading-6 text-gray-900">
						Confirm Cancellation
					</Dialog.Title>

					<Dialog.Description>
						{sellerMode
							? 'The down payment goes back to the buyer'
							: 'You forfeit for down payment'}
					</Dialog.Description>
					<textarea
						className="textarea w-full"
						placeholder="Reason"
						onChange={(e) => setReason(e.target.value)}
					/>
					<button className="btn-lg btn-error rounded-lg font-bold" onClick={() => refundFlow()}>
						{refundMutation.isLoading && (
							<svg
								className=" h-5 w-5 animate-spin text-white"
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
						CANCEL APPOINTMENT
					</button>
				</Dialog.Panel>
			</Transition.Child>
		</>
	);
};

export default Cancellation;
