import React, { useEffect, useMemo, useState } from "react";
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
import { router, useLocalSearchParams } from "expo-router";
import {
  CardField,
  PlatformPay,
  PlatformPayButton,
  confirmPlatformPayPayment,
  initPaymentSheet,
  isPlatformPaySupported,
  presentPaymentSheet,
  updatePlatformPaySheet,
  useConfirmPayment,
} from "@stripe/stripe-react-native";

import {
  SellerAvailability,
  type Category,
  type Price,
  type Appointment as PrismaAppointment,
  type Image as PrismaImage,
} from "@acme/db";

import SKText from "../../components/Utils/SKText";
import { RouterOutputs, trpc } from "../../utils/trpc";
import { ArrayElement } from "../../utils/types";

const PaymentModal = ({ closeModal }: { closeModal: () => void }) => {
  const { appointmentId } = useLocalSearchParams();
  const appointment = trpc
    .useContext()
    .appointment.getAppointments.getData({
      sellerMode: false,
    })
    ?.find((appointment) => appointment.id === appointmentId);

  return (
    appointment && (
      <PaymentModalHidden appointment={appointment} closeModal={closeModal} />
    )
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

const PaymentModalHidden = ({
  appointment,
  closeModal,
}: {
  appointment: ArrayElement<RouterOutputs["appointment"]["getAppointments"]>;
  closeModal: () => void;
}) => {
  const getPaymentIntentSecret = trpc.payment.getPaymentSheet.useMutation();

  const [isApplePaySupported, setIsApplePaySupported] = useState(false);
  const { confirmPayment, loading: stripeLoading } = useConfirmPayment();
  const [state, setState] = useState<string | undefined>("Not started");
  const [loading, setLoading] = useState(false);
  let newTotalAmount = useMemo(() => {
    console.log(appointment.history);
    if (appointment.history.find((history) => history.status === "DOWNPAID")) {
      return (
        appointment.price.amount *
        (1 - (appointment.seller?.downPaymentPercentage ?? 1)) *
        100
      );
    } else {
      console.log(
        appointment.price.amount < 9
          ? 135
          : Math.ceil(appointment.price.amount * 7),
      );
      return (
        appointment.price.amount *
          (appointment.seller?.downPaymentPercentage ?? 0) *
          100 +
        (appointment.price.amount < 9
          ? 135
          : Math.ceil(appointment.price.amount * 7))
      );
    }
  }, [appointment]);

  const handlePayPress = async () => {
    getPaymentIntentSecret.mutate(
      {
        appointmentId: appointment.id,
      },
      {
        onSuccess: async ({ client_secret }) => {
          const { error, paymentIntent } = await confirmPayment(client_secret, {
            paymentMethodType: "Card",
          });

          if (error) {
            Alert.alert(`Error code: ${error.code}`, error.message);
          } else if (paymentIntent) {
            Alert.alert("Success", "Payment Successful");
            router.push("/schedule");
          }
        },
      },
    );
  };

  const handleApplePayPress = async () => {
    setState("A");
    getPaymentIntentSecret.mutate(
      {
        appointmentId: appointment.id,
      },
      {
        onSuccess: async ({ client_secret, price }) => {
          setState("B");
          try {
            const { error, paymentIntent } = await confirmPlatformPayPayment(
              client_secret,
              {
                applePay: {
                  cartItems: [
                    {
                      label: appointment.price.name,
                      amount: (price / 100).toFixed(2),
                      paymentType: PlatformPay.PaymentType.Immediate,
                    },
                  ],
                  merchantCountryCode: "US",
                  currencyCode: "US",
                },
              },
            );
            setState("C");
            if (error) {
              Alert.alert(`Error code: ${error.code}`, error.message);
            } else if (paymentIntent) {
              Alert.alert("Success", "Payment Successful");
              router.push("/schedule");
            } else {
              Alert.alert("Serious issue");
            }
          } catch (err: any) {
            setState(err.message);
          }
        },
      },
    );
  };

  const initializePaymentSheet = async () => {
    const { paymentIntent, ephemeralKey, client_secret, customer } =
      await getPaymentIntentSecret.mutateAsync({
        appointmentId: appointment.id,
      });

    const { error } = await initPaymentSheet({
      merchantDisplayName: "Sakpa",
      customerId: customer,
      customerEphemeralKeySecret: ephemeralKey,
      paymentIntentClientSecret: client_secret,
      // Set `allowsDelayedPaymentMethods` to true if your business can handle payment
      //methods that complete payment after a delay, like SEPA Debit and Sofort.
      allowsDelayedPaymentMethods: false,
      applePay: {
        merchantCountryCode: "US",
      },
      appearance: {
        colors: {
          primary: "#1dbaa7",
        },
      },
    });
    if (!error) {
      setLoading(true);
    }
  };

  const openPaymentSheet = async () => {
    const { error } = await presentPaymentSheet();

    if (error) {
      Alert.alert(`Error code: ${error.code}`, error.message);
    } else {
      router.push("/schedule");
    }
  };

  useEffect(() => {
    (async function () {
      setIsApplePaySupported(await isPlatformPaySupported());
    })();
  }, [isPlatformPaySupported]);

  useEffect(() => {
    initializePaymentSheet();
  }, []);

  return (
    <SafeAreaView
      className={`mx-6 my-auto flex h-auto rounded-lg bg-[#fafafa]`}
    >
      <View className="flex flex-row items-center gap-3 p-2">
        <Image
          source={appointment.price.category.Image[0]?.link ?? ""}
          className="h-32 w-32 rounded-lg"
        />
        <View>
          <SKText className="text-2xl font-semibold" fontWeight="semi-bold">
            {appointment.price.name.substring(0, 13)}
            {appointment.price.name.length > 13 && "..."}
          </SKText>
          <View className="flex flex-row items-center gap-2">
            <SKText className="text-lg">
              {appointment.appointmentDate?.toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
              })}
            </SKText>
            <SKText className="font-bold text-[#1dbaa7]" fontWeight="semi-bold">
              {appointment.appointmentDate?.toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </SKText>
          </View>
          <SKText className="text-xl font-extrabold" fontWeight="bold">
            ${(newTotalAmount / 100).toFixed(2)}
          </SKText>
        </View>
      </View>

      <Pressable
        className="mx-auto mb-5 w-24 rounded-xl bg-[#5433FF] p-2"
        onPress={openPaymentSheet}
        disabled={getPaymentIntentSecret.isLoading || stripeLoading}
      >
        <SKText
          className="mx-auto text-2xl font-semibold text-white"
          fontWeight="semi-bold"
        >
          PAY
        </SKText>
      </Pressable>
    </SafeAreaView>
  );
};
