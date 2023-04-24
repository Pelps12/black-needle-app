import React, { useEffect, useState } from "react";
import { Alert, Pressable, Text, View } from "react-native";
import { Image } from "expo-image";
import {
  initPaymentSheet,
  presentPaymentSheet,
} from "@stripe/stripe-react-native";

import {
  type Category,
  type Price,
  type Appointment as PrismaAppointment,
  type Image as PrismaImage,
} from "@acme/db";

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
  //const appointmentMutation = trpc.appointment.updateAppointmentStatus.useMutation();

  const [isOpen, setIsOpen] = useState(false);
  const [stripeModalOpen, setStripeModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const fetchPaymentSheetParams = trpc.payment.getPaymentSheet.useMutation();

  function closeModal() {
    setIsOpen(false);
  }

  function openModal() {
    setIsOpen(true);
  }
  return (
    <View className="mx-2 my-4">
      <View className="flex flex-row justify-between">
        <View className="flex flex-row items-center gap-2">
          <Image
            source={
              `${appointments.price.category.Image[0]?.link}-/preview/-/quality/smart/-/format/auto/` ||
              "https://storage.googleapis.com/proudcity/mebanenc/uploads/2021/03/placeholder-image.png"
            }
            alt="Price Pic"
            className="h-36 w-36 rounded-xl"
          />
          <View>
            <Text className="text-xl font-semibold">
              {appointments.price.name.substring(0, 20)}
              {appointments.price.name.length > 20 && "..."}
            </Text>
            <View>
              <Text>
                {appointments.appointmentDate?.toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                })}
              </Text>
              <Text className="font-bold text-[#1dbaa7]">
                {appointments.appointmentDate?.toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </Text>
            </View>
          </View>
        </View>
      </View>

      <View>
        <View className="flex  flex-row items-center justify-end gap-5">
          {sellerMode && appointments.status === "PENDING" && (
            <>
              <Pressable /* onPress={() => chargeAppointmentStatus('APPROVED', appointments.id)} */
              >
                <Image
                  source={require("../../../assets/yes.svg")}
                  alt={"Yes"}
                  className="mx-5 h-5 w-5 rounded-md object-cover"
                />
              </Pressable>
              <Pressable /* onPress={() => chargeAppointmentStatus('DECLINED', appointments.id)} */
              >
                <Image
                  source={require("../../../assets/no.svg")}
                  alt={"Yes"}
                  className="mx-5 h-5 w-5 rounded-md object-cover"
                />
              </Pressable>
            </>
          )}
          {!sellerMode && appointments.status === "APPROVED" && (
            <Pressable
              className={`btn btn-outline btn-sm btn-secondary rounded-lg bg-[#72a2f9] p-2`}
              onPress={() => setStripeModalOpen(true)}
            >
              <Text className="font-semibold text-white">PAY</Text>
            </Pressable>
          )}

          {(appointments.status === "DOWNPAID" ||
            !appointments.price.category.seller.downPaymentPercentage) &&
            (appointments.appointmentDate &&
            appointments.appointmentDate > new Date() ? (
              <Pressable
                className={`btn btn-outline btn-sm btn-error rounded-lg bg-[#E26850] p-2`}
                onPress={() => openModal()}
              >
                <Text className="font-semibold text-white">CANCEL</Text>
              </Pressable>
            ) : (
              <Pressable
                className={`btn btn-outline btn-sm btn-secondary rounded-lg bg-[#72a2f9] p-2`}
                /* onPress={() => payForAppointment(appointments.id)} */
              >
                <Text className="font-semibold text-white">COMPLETE</Text>
              </Pressable>
            ))}
          <Text
            className={`${
              appointments.status === "PENDING"
                ? "text-[#EBA937]"
                : appointments.status === "DECLINED" ||
                  appointments.status === "FAILED" ||
                  appointments.status === "CANCELED"
                ? "text-error"
                : "text-[#2BDA82]"
            } font-bold `}
          >
            {appointments.status}
          </Text>
        </View>
      </View>

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
