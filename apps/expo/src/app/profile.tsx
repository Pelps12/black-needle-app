import React, { useRef } from "react";
import {
  Button,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useAuth } from "@clerk/clerk-expo";
import { FlashList } from "@shopify/flash-list";
import LottieView from "lottie-react-native";
import AnimatedLottieView from "lottie-react-native";

import Loading from "../components/Utils/Loading";
import SKTest from "../components/Utils/SKText";
import { trpc, type RouterOutputs } from "../utils/trpc";

const Profile = () => {
  const { signOut, isSignedIn } = useAuth();
  const animation = useRef<AnimatedLottieView>(null);
  const getSession = trpc.auth.getSession.useQuery();
  return (
    <View className="">
      <SKTest className="mx-3 text-4xl font-bold">Profile</SKTest>

      <Pressable
        className={`mx-auto my-2 flex flex-row  content-center items-center justify-center rounded-lg bg-[#1dbaa7] px-5 py-3  shadow-sm`}
        onPress={() => signOut().catch((err) => console.log(err))}
      >
        <SKTest className="text-xl font-semibold text-white">Sign Out</SKTest>
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  animationContainer: {
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
  },
  buttonContainer: {
    paddingTop: 20,
  },
});

export default Profile;
