import React, { useEffect, useState } from "react";
import {
  Alert,
  FlatList,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Image } from "expo-image";
import { useLocalSearchParams } from "expo-router";
import {
  CardField,
  PlatformPay,
  PlatformPayButton,
  isPlatformPaySupported,
  useConfirmPayment,
} from "@stripe/stripe-react-native";

import {
  type Category,
  type Price,
  type Appointment as PrismaAppointment,
  type Image as PrismaImage,
} from "@acme/db";

import SKTest from "../../components/Utils/SKText";
import SKText from "../../components/Utils/SKText";
import { trpc } from "../../utils/trpc";

const PaymentModal = () => {
  const getPaymentIntentSecret = trpc.payment.getPaymentSheet.useMutation();
  const { appointmentId } = useLocalSearchParams();
  const utils = trpc.useContext();
  const appointments = utils.appointment.getAppointments.getData({
    sellerMode: false,
  });
  const newAppointment = appointments?.find(
    (appointment) => appointment.id === appointmentId,
  );
  const [isApplePaySupported, setIsApplePaySupported] = useState(false);
  const { confirmPayment, loading } = useConfirmPayment();

  //NOT IDEAL PLEASE FIX THIS
  const totalAmount = newAppointment
    ? (newAppointment?.price.category.seller.downPaymentPercentage
        ? newAppointment?.price.category.seller.downPaymentPercentage *
          newAppointment?.price.amount *
          100
        : newAppointment?.price.amount * 100) +
      (newAppointment?.price.amount < 9
        ? 135
        : Math.ceil(newAppointment?.price.amount * 7))
    : 0;

  const handlePayPress = async () => {
    newAppointment &&
      getPaymentIntentSecret.mutate(
        {
          appointmentId: newAppointment.id,
        },
        {
          onSuccess: async ({ client_secret }) => {
            const { error, paymentIntent } = await confirmPayment(
              client_secret,
              {
                paymentMethodType: "Card",
              },
            );

            if (error) {
              Alert.alert(`Error code: ${error.code}`, error.message);
            } else if (paymentIntent) {
              Alert.alert("Success", "Payment Successful");
            }
          },
        },
      );
  };

  useEffect(() => {
    (async function () {
      setIsApplePaySupported(await isPlatformPaySupported());
    })();
  }, [isPlatformPaySupported]);
  return (
    <View className={`mx-6 my-auto flex justify-between rounded-lg   `}>
      <SKTest fontWeight="semi-bold" className="mx-4 text-4xl font-bold">
        Payment
      </SKTest>
      <View className="flex flex-row items-center gap-3 p-2">
        <Image
          source={newAppointment?.price.category.Image[0]?.link ?? ""}
          className="h-32 w-32 rounded-lg"
        />
        <View>
          <Text className="text-2xl font-semibold">
            {newAppointment?.price.name.substring(0, 20)}
            {(newAppointment?.price.name.length ?? 0) > 20 && "..."}
          </Text>
          <View className="flex flex-row items-center gap-2">
            <Text className="text-lg">
              {newAppointment?.appointmentDate?.toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
              })}
            </Text>
            <Text className="font-bold text-[#1dbaa7]">
              {newAppointment?.appointmentDate?.toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </Text>
          </View>
          <Text className="text-xl font-extrabold">
            ${(totalAmount / 100).toFixed(2)}
          </Text>
        </View>
      </View>
      <CardField
        style={styles.cardField}
        cardStyle={{
          borderColor: "#25252d",
          borderWidth: 1,
          borderRadius: 8,
          textColor: "#25252D",
        }}
      ></CardField>

      <Pressable
        className="mx-auto mb-5 w-24 rounded-xl bg-[#5433FF] p-2"
        onPress={handlePayPress}
      >
        <Text className="mx-auto text-2xl font-semibold text-white">PAY</Text>
      </Pressable>

      <PlatformPayButton
        onPress={() => console.log("HI")}
        type={PlatformPay.ButtonType.Book}
        appearance={PlatformPay.ButtonStyle.Black}
        borderRadius={4}
        style={{
          width: "60%",
          height: 50,
          marginLeft: "auto",
          marginRight: "auto",
          borderRadius: 10,
          marginBottom: 10,
        }}
      />
      <View className="mx-auto flex-row items-center">
        <SKText>Powered by</SKText>
        <Image
          source={require("../../../assets/stripe.svg")}
          className="h-24 w-24"
          contentFit="contain"
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  cardField: {
    width: "95%",
    height: 50,
    color: "black",
    marginVertical: 30,
    marginLeft: "auto",
    marginRight: "auto",
  },
});

export default PaymentModal;
