import React from "react";
import { Pressable, StyleSheet, Text } from "react-native";
import { Image } from "expo-image";

const AppleButton = ({ onPress }: { onPress: () => Promise<void> }) => {
  return (
    <Pressable
      className={`my-2 flex flex-row content-center items-center justify-center  rounded-md bg-[#d9d9d9]  py-5 text-black shadow-sm`}
      onPress={onPress}
    >
      <Image
        source={require("../../../assets/OAuth/Apple_logo_white.svg")}
        alt="G"
        className="mr-2 h-12 w-12"
      />
      <Text className="ml-2 text-2xl font-semibold"> Sign in with Apple</Text>
    </Pressable>
  );
};

export default AppleButton;
