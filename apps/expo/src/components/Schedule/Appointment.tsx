import React, { useEffect, useState } from "react";
import { Alert, Pressable, Text, View } from "react-native";
import { Image } from "expo-image";
import { Link } from "expo-router";
import {
  initPaymentSheet,
  presentPaymentSheet,
} from "@stripe/stripe-react-native";

import {
  OrderStatus,
  type Category,
  type Price,
  type Appointment as PrismaAppointment,
  type Image as PrismaImage,
} from "@acme/db";

import AppointmentModal from "../../components/Seller/AppointmentModal";
import SKText from "../../components/Utils/SKText";
import { trpc } from "../../utils/trpc";
import Modal from "../Modal";
import PaymentModal from "../Payment/StripeModal";

/* import Cancellation from "./Cancellation";
import Modal from "./Modal"; */

const Appointment = ({
  refetch,
  appointments,
  sellerMode,
}: {
  refetch: any;
  appointments: PrismaAppointment & {
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
}) => {
  const appointmentMutation = trpc.appointment.updateAppointmentStatus.useMutation();

  const [isOpen, setIsOpen] = useState(false);
  const [stripeModalOpen, setStripeModalOpen] = useState(false);
  const [rescheduleModalOpen, setRescheduleModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const fetchPaymentSheetParams = trpc.payment.getPaymentSheet.useMutation();

  const chargeAppointmentStatus = async (newStatus: OrderStatus, itemId: string) => {
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
    <View className="mx-2 my-4">
      <View className="flex flex-row justify-between items-center">
        <View className="flex flex-row items-center gap-2 ">
          <Image
            source={
              `${appointments.price.category.Image[0]?.link}-/preview/-/quality/smart/-/format/auto/` ||
              "https://storage.googleapis.com/proudcity/mebanenc/uploads/2021/03/placeholder-image.png"
            }
            className="h-36 w-36 rounded-xl"
          />
          <View>
            <SKText className="text-xl font-semibold" fontWeight="semi-bold">
              {appointments.price.name.substring(0, 20)}
              {appointments.price.name.length > 20 && "..."}
            </SKText>
            <View>
              <SKText fontWeight="semi-bold">
                {appointments.appointmentDate?.toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                })}
              </SKText>
              <SKText className="font-bold text-[#1dbaa7]" fontWeight="bold">
                {appointments.appointmentDate?.toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </SKText>
            </View>
          </View>
        </View>
      </View>

      <View>
        <View className="flex  flex-row items-center justify-end gap-5">
          {sellerMode && appointments.status === "PENDING" && (
            <View className="flex flex-row items-center">
              <Pressable className=""onPress={() => chargeAppointmentStatus('APPROVED', appointments.id)}
              >
                <Image
                  source={require("../../../assets/yes.svg")}
                  className="mx-5 h-5 w-5 rounded-md object-cover"
                />
              </Pressable>
              <Pressable onPress={() => chargeAppointmentStatus('DECLINED', appointments.id)}
              >
                <Image
                  source={require("../../../assets/no.svg")}
                  className="mx-5 h-5 w-5 rounded-md object-cover"
                />
              </Pressable>
            </View>
          )}
          <View className="flex w-auto  flex-row items-center justify-center rounded-lg bg-[#d9d9d9]">
            {!sellerMode && appointments.status === "APPROVED" && (
              <Link
                className={`btn btn-outline btn-sm btn-secondary  border-r p-2`}
                href={`/schedule/payment?appointmentId=${appointments.id}`}
              >
                <Text className="font-semibold ">Pay</Text>
              </Link>
            )}

            {
              <Pressable
                className={`btn btn-outline btn-sm btn-secondary  p-2`}
                onPress={() => setRescheduleModalOpen(true)}
              >
                <SKText className="font-semibold " fontWeight="semi-bold">
                  Reschedule
                </SKText>
              </Pressable>
            }

            {appointments.status === "DOWNPAID" &&
              (appointments.appointmentDate &&
              appointments.appointmentDate > new Date() ? (
                <Pressable
                  className={`btn btn-outline btn-sm btn-error   p-2`}
                  onPress={() => openModal()}
                >
                  <SKText
                    className="font-semibold text-[#E26850]"
                    fontWeight="semi-bold"
                  >
                    Cancel
                  </SKText>
                </Pressable>
              ) : (
                <Pressable
                  className={`btn btn-outline btn-sm btn-secondary  bg-[#72a2f9] p-2`}
                  /* onPress={() => payForAppointment(appointments.id)} */
                >
                  <SKText className="font-semibold" fontWeight="semi-bold">
                    Complete
                  </SKText>
                </Pressable>
              ))}
          </View>
          <SKText
            className={`${
              appointments.status === "PENDING"
                ? "text-[#EBA937]"
                : appointments.status === "DECLINED" ||
                  appointments.status === "FAILED" ||
                  appointments.status === "CANCELED"
                ? "text-error"
                : "text-[#2BDA82]"
            } font-bold `}
            fontWeight="bold"
          >
            {appointments.status}
          </SKText>
        </View>
      </View>

      <Modal
        modalVisible={rescheduleModalOpen}
        setModalVisible={setRescheduleModalOpen}
        className=""
      >
        <AppointmentModal
          sellerId={appointments.sellerId}
          priceId={appointments.priceId}
          isOpen={rescheduleModalOpen}
          closeModal={() => setRescheduleModalOpen(false)}
          reschedule={true}
          appointmentId={appointments.id}
        />
      </Modal>

      <Modal
        modalVisible={stripeModalOpen}
        setModalVisible={setStripeModalOpen}
        className=""
      >
        {/* <View className="sahdow-md m-auto rounded-lg bg-[#d9d9d9] p-4"> 
          <View>
            <View>
              <Text className="text-5xl">Hello World!</Text>
              <Pressable onPress={() => setModalVisible(false)}>
                <Text>Hide Modal</Text>
              </Pressable>
            </View>
          </View>
        </View> */}
        <PaymentModal
          appointment={appointments}
          closeModal={() => setStripeModalOpen(false)}
        ></PaymentModal>
      </Modal>
    </View>
  );
};

export default Appointment;
