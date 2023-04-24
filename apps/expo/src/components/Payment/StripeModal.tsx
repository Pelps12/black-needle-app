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

import { trpc } from "../../utils/trpc";

const PaymentModal = ({
  appointment,
  closeModal,
}: {
  appointment: PrismaAppointment & {
    price: Price & {
      category: Category & {
        Image: PrismaImage[];
        seller: {
          downPaymentPercentage: number | null;
        };
      };
    };
  };
  closeModal: () => void;
}) => {
  const getPaymentIntentSecret = trpc.payment.getPaymentSheet.useMutation();
  const [isApplePaySupported, setIsApplePaySupported] = useState(false);
  const { confirmPayment, loading } = useConfirmPayment();

  const handlePayPress = async () => {
    const { client_secret } = await getPaymentIntentSecret.mutateAsync({
      appointmentId: appointment.id,
    });

    const { error, paymentIntent } = await confirmPayment(client_secret, {
      paymentMethodType: "Card",
    });

    if (error) {
      Alert.alert(`Error code: ${error.code}`, error.message);
    } else if (paymentIntent) {
      Alert.alert("Success", "Payment Successful");
    }
  };

  useEffect(() => {
    (async function () {
      setIsApplePaySupported(await isPlatformPaySupported());
    })();
  }, [isPlatformPaySupported]);
  return (
    <SafeAreaView
      className={`mx-6 my-auto flex h-auto rounded-lg bg-[#fafafa]  `}
    >
      <View className="flex flex-row items-center gap-3 p-2">
        <Image
          source={appointment.price.category.Image[0]?.link ?? ""}
          alt="Picture"
          className="h-32 w-32 rounded-lg"
        />
        <View>
          <Text className="text-2xl font-semibold">
            {appointment.price.name.substring(0, 20)}
            {appointment.price.name.length > 20 && "..."}
          </Text>
          <View className="flex flex-row items-center gap-2">
            <Text className="text-lg">
              {appointment.appointmentDate?.toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
              })}
            </Text>
            <Text className="font-bold text-[#1dbaa7]">
              {appointment.appointmentDate?.toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </Text>
          </View>
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
    </SafeAreaView>
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
