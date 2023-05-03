import React from "react";
import { Pressable, StyleSheet, Text } from "react-native";
import { Image } from "expo-image";

const AppleButton = ({ onPress }: { onPress: () => Promise<void> }) => {
  return (
    <Pressable
      className={`mx-auto my-2 flex w-72  flex-row content-center items-center justify-center rounded-md bg-black py-3 text-black shadow-sm`}
      onPress={onPress}
    >
      <Image
        source={require("../../../assets/OAuth/Apple_logo_white.svg")}
        alt="A"
        contentFit="scale-down"
        className=" h-8 w-8"
      />
      <Text className="ml-2 text-xl font-semibold text-white">
        Sign in with Apple
      </Text>
    </Pressable>
  );
};

export default AppleButton;
