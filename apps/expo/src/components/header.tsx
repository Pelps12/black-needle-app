import React from "react";
import { Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Image } from "expo-image";
import { Link } from "expo-router";
import { useUser } from "@clerk/clerk-expo";
import { Ionicons } from "@expo/vector-icons";

import type {} from "react";
import SKText from "./Utils/SKText";

const Header = () => {
  const { user } = useUser();

  return (
    <SafeAreaView className="mb-0 flex w-full flex-row items-center justify-between bg-[#F2F2F2] px-2 py-0">
      <View className="no-animation flex flex-row items-end gap-0 p-0 text-xl font-bold uppercase">
        <Image
          source={require("../../assets/sakpa_small.png")}
          className="h-12 w-12"
          contentFit="contain"
        />
        <SKText className="text-2xl" fontWeight="medium">
          akpa
        </SKText>
      </View>

      <View className="flex-row items-center gap-3">
        {/* <Image
          className="h-8 w-8 rounded-full"
          source={require("../../assets/shopping_cart.svg")}
          alt=":)"
        /> */}
        <Link href="/chat">
          <Ionicons name="ios-chatbox-outline" size={24} color="black" />
        </Link>

        <Link href="/profile">
          <Image
            className="h-10 w-10 rounded-full"
            source={user?.profileImageUrl}
          />
        </Link>
      </View>
    </SafeAreaView>
  );
};

export default Header;
