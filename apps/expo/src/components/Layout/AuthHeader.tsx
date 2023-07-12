import React from "react";
import { Pressable, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { AntDesign } from "@expo/vector-icons";
import { NativeStackHeaderProps } from "@react-navigation/native-stack";

import SKText from "../../components/Utils/SKText";

const AuthHeader: React.FC<NativeStackHeaderProps> = ({
  back,
  options,
  navigation,
}) => {
  return (
    <SafeAreaView className="mb-0 flex w-full flex-row items-center justify-center bg-[#F2F2F2] px-2 py-0">
      {back?.title && (
        <Pressable
          className="absolute left-0 my-auto flex-row items-center"
          onPress={() => navigation.canGoBack() && navigation.goBack()}
        >
          <AntDesign name="back" size={24} color="black" />
          <SKText>{back?.title}</SKText>
        </Pressable>
      )}

      <SKText className="text-2xl" fontWeight="semi-bold">
        {options.title}
      </SKText>
    </SafeAreaView>
  );
};

export default AuthHeader;
