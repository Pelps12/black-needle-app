import React from "react";
import { Pressable, StyleSheet, Text } from "react-native";
import { Image } from "expo-image";

import SKText from "../../components/Utils/SKText";

const GoogleButton = ({ onPress }: { onPress: () => Promise<void> }) => {
  return (
    <Pressable
      className={`mx-auto my-2 flex w-72  flex-row content-center items-center justify-center rounded-md bg-[#d9d9d9] py-3 text-black shadow-sm`}
      onPress={onPress}
    >
      <Image
        source={require("../../../assets/OAuth/google_2.svg")}
        contentFit="scale-down"
        className=" h-8 w-8"
      />
      <SKText className="ml-2 text-xl " fontWeight="medium">
        {" "}
        Sign in with Google
      </SKText>
    </Pressable>
  );
};

export default GoogleButton;
