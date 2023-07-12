import React from "react";
import { Pressable, StyleSheet, Text } from "react-native";
import { Image } from "expo-image";

import SKText from "../../components/Utils/SKText";

const AppleButton = ({
  onPress,
  mode,
}: {
  onPress: () => Promise<void>;
  mode: "signin" | "signup";
}) => {
  return (
    <Pressable
      className={`mx-auto my-2 flex w-72  flex-row content-center items-center justify-center rounded-md bg-black py-3 text-black shadow-sm`}
      onPress={onPress}
    >
      <Image
        source={require("../../../assets/OAuth/Apple_logo_white.svg")}
        contentFit="scale-down"
        className=" h-8 w-8"
      />
      <SKText
        className="ml-2 text-xl font-semibold text-white"
        fontWeight="medium"
      >
        {mode === "signin" ? "Sign in" : "Sign up"} with Apple
      </SKText>
    </Pressable>
  );
};

export default AppleButton;
