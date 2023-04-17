import React from "react";
import { Button, Text, TextInput, TouchableOpacity, View } from "react-native";
import { useAuth } from "@clerk/clerk-expo";
import { FlashList } from "@shopify/flash-list";

import { trpc, type RouterOutputs } from "../utils/trpc";

const Profile = () => {
  const { signOut } = useAuth();
  return (
    <View className="rounded-lg border-2 border-gray-500 p-4">
      <Button
        title="Sign Out"
        onPress={() => {
          signOut().catch((err) => console.log(err));
        }}
      />
    </View>
  );
};

export default Profile;
