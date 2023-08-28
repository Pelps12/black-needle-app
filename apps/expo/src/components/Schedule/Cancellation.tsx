import React, { Fragment, useState } from "react";
import { Pressable, TextInput } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { AntDesign } from "@expo/vector-icons";

import SKText from "../../components/Utils/SKText";
import SKTextInput from "../../components/Utils/SKTextInput";
import { trpc } from "../../utils/trpc";

const CancellationModal = ({
  appointmentId,
  closeModal,
}: {
  appointmentId: string;
  closeModal: () => void;
}) => {
  const refundMutation = trpc.appointment.refundPayment.useMutation();
  const [reason, setReason] = useState<string | undefined>(undefined);
  const refundFlow = () => {
    refundMutation.mutate(
      {
        appointmentId: appointmentId,
        reason: reason,
      },
      {
        onSuccess: () => {
          closeModal();
        },
      },
    );
  };
  return (
    <>
      <SafeAreaView className="z-0 mx-6 my-auto flex h-auto  rounded-lg bg-[#fafafa] p-4">
        <SKTextInput
          className="textarea m-3  mx-auto w-80 rounded-lg border-2 border-slate-500 p-4"
          placeholder="Reason"
          onChangeText={(e) => setReason(e)}
          multiline={true}
          numberOfLines={4}
        />
        <Pressable
          className="btn-lg btn-error mx-auto w-48 rounded-lg bg-[#E26850] p-4 font-bold"
          onPress={() => refundFlow()}
        >
          {refundMutation.isLoading && (
            <AntDesign name="loading1" size={24} color="black" />
          )}
          <SKText className="text-center text-white" fontWeight="semi-bold">
            CANCEL APPOINTMENT
          </SKText>
        </Pressable>
      </SafeAreaView>
    </>
  );
};

export default CancellationModal;
