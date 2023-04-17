import React from "react";
import { Text, View } from "react-native";
import { Image } from "expo-image";
import { useUser } from "@clerk/clerk-react";

const Header = () => {
  const { user } = useUser();

  return (
    <View className="mb-0 flex w-full flex-row items-center justify-between bg-[#F2F2F2] px-2 pb-0 pt-10">
      <View className="no-animation flex flex-row items-end p-0 text-xl font-bold uppercase">
        <Image
          source="https://ucarecdn.com/b34e095d-7262-4a4f-96e1-632538bf82b0/"
          className="h-12 w-24"
          alt="Logo"
        />
      </View>

      <View className="flex-row items-center gap-3">
        <Image
          className="h-8 w-8 rounded-full"
          source={require("../../assets/shopping_cart.svg")}
          alt=":)"
        />
        <Image
          className="h-8 w-8 rounded-full"
          source={require("../../assets/notif_bell.svg")}
          alt=":)"
        />

        <Image
          className="h-10 w-10 rounded-full"
          source={user?.profileImageUrl}
          alt=":)"
        />
      </View>
    </View>
  );
};

export default Header;
