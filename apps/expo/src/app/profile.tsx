import React from "react";
import {
  Button,
  Pressable,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useAuth } from "@clerk/clerk-expo";
import { FlashList } from "@shopify/flash-list";

import { trpc, type RouterOutputs } from "../utils/trpc";

const Profile = () => {
  const { signOut, isSignedIn } = useAuth();
  const getSession = trpc.auth.getSession.useQuery();
  return (
    <View className="">
      <Pressable
        className={`mx-auto my-2 flex flex-row  content-center items-center justify-center rounded-lg bg-[#1dbaa7] px-5 py-3  shadow-sm`}
        onPress={() => signOut().catch((err) => console.log(err))}
      >
        <Text className="text-xl font-semibold text-white">Sign Out</Text>
      </Pressable>
    </View>
  );
};

export default Profile;
