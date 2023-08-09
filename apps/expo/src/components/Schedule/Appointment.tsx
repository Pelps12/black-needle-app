import React, { useEffect, useState } from "react";
import { Alert, Pressable, Text, View } from "react-native";
import { Image } from "expo-image";
import { Link } from "expo-router";
import {
  initPaymentSheet,
  presentPaymentSheet,
} from "@stripe/stripe-react-native";
import { inferRouterOutputs } from "@trpc/server";

import { AppRouter } from "@acme/api";
import {
  AppointmentHistory,
  OrderStatus,
  type Category,
  type Price,
  type Appointment as PrismaAppointment,
  type Image as PrismaImage,
} from "@acme/db";

import AppointmentModal from "../../components/Seller/AppointmentModal";
import SKText from "../../components/Utils/SKText";
import statusHelper from "../../utils/statusfsm";
import { trpc } from "../../utils/trpc";
import { ArrayElement } from "../../utils/types";
import Modal from "../Modal";
import PaymentModal from "../Payment/StripeModal";

/* import Cancellation from "./Cancellation";
import Modal from "./Modal"; */

type RouterOutput = inferRouterOutputs<AppRouter>;
type AppointmentType = RouterOutput["appointment"]["getAppointments"];
const Appointment = ({
  refetch,
  appointments,
  sellerMode,
}: {
  refetch: any;
  appointments: ArrayElement<AppointmentType>;
  sellerMode: boolean;
}) => {
  const appointmentMutation =
    trpc.appointment.updateAppointmentStatus.useMutation();

  const [isOpen, setIsOpen] = useState(false);
  const [stripeModalOpen, setStripeModalOpen] = useState(false);
  const [rescheduleModalOpen, setRescheduleModalOpen] = useState(false);

  const chargeAppointmentStatus = async (
    newStatus: "APPROVED" | "DECLINED" | "COMPLETED",
    itemId: string,
  ) => {
    await appointmentMutation.mutateAsync({
      newStatus,
      itemId,
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
      <View className="flex flex-row items-center justify-between">
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
          {statusHelper(appointments, sellerMode).map((value) => {
            switch (value) {
              case "APPROVE":
                return (
                  <Pressable
                    className=""
                    onPress={() =>
                      chargeAppointmentStatus("APPROVED", appointments.id)
                    }
                    disabled={appointmentMutation.isLoading}
                    key={value}
                  >
                    <Image
                      source={require("../../../assets/yes.svg")}
                      className="mx-5 h-5 w-5 rounded-md object-cover"
                    />
                  </Pressable>
                );
              case "DECLINE":
                return (
                  <Pressable
                    onPress={() =>
                      chargeAppointmentStatus("DECLINED", appointments.id)
                    }
                    disabled={appointmentMutation.isLoading}
                    key={value}
                  >
                    <Image
                      source={require("../../../assets/no.svg")}
                      className="mx-5 h-5 w-5 rounded-md object-cover"
                    />
                  </Pressable>
                );
              case "RESCHEDULE":
                return (
                  <Pressable
                    className={`btn btn-outline btn-sm btn-secondary  p-2`}
                    onPress={() => setRescheduleModalOpen(true)}
                    key={value}
                  >
                    <SKText className="font-semibold " fontWeight="semi-bold">
                      Reschedule
                    </SKText>
                  </Pressable>
                );

              case "DOWNPAY":
                return (
                  <Link
                    className={`btn btn-outline btn-sm btn-secondary  border-r p-2`}
                    href={`/schedule/payment?appointmentId=${appointments.id}`}
                    key={value}
                  >
                    <Text className="font-semibold ">Pay</Text>
                  </Link>
                );
              case "PAY":
                return (
                  <Link
                    className={`btn btn-outline btn-sm btn-secondary  border-r p-2`}
                    href={`/schedule/payment?appointmentId=${appointments.id}`}
                    key={value}
                  >
                    <Text className="font-semibold ">Pay</Text>
                  </Link>
                );
              case "CANCEL":
                return (
                  <Pressable
                    className={`btn btn-outline btn-sm btn-error   p-2`}
                    onPress={() => openModal()}
                    key={value}
                  >
                    <SKText
                      className="font-semibold text-[#E26850]"
                      fontWeight="semi-bold"
                    >
                      Cancel
                    </SKText>
                  </Pressable>
                );
              case "COMPLETE":
                return (
                  <Pressable
                    className={`btn btn-outline btn-sm btn-error   p-2`}
                    onPress={() =>
                      chargeAppointmentStatus("COMPLETED", appointments.id)
                    }
                    disabled={appointmentMutation.isLoading}
                    key={value}
                  >
                    <SKText
                      className="font-semibold text-[#2BDA82]"
                      fontWeight="semi-bold"
                    >
                      Complete
                    </SKText>
                  </Pressable>
                );
              default:
                return null;
            }
          })}

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
