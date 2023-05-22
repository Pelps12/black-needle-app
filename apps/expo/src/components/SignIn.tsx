import React from "react";
import {
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { Image } from "expo-image";
import { useOAuth } from "@clerk/clerk-expo";

import { useWarmUpBrowser } from "../hooks/useWarmUpBrowser";
import AppleButton from "./OAuth/AppleButton";
import SKText from "./Utils/SKText";
import SKTextInput from "./Utils/SKTextInput";

export const SignInSignUpScreen = () => {
  return (
    <SafeAreaView className="bg-[#f2f2f2]">
      <View className="h-full w-full p-4">
        <SignInWithOAuth />
      </View>
    </SafeAreaView>
  );
};

const SignInWithOAuth = () => {
  useWarmUpBrowser();

  const { startOAuthFlow } = useOAuth({ strategy: "oauth_google" });
  const { startOAuthFlow: appleFlow } = useOAuth({ strategy: "oauth_apple" });

  const handleSignInWithGooglePress = React.useCallback(async () => {
    try {
      const { createdSessionId, setActive } = await startOAuthFlow();
      if (createdSessionId && setActive) {
        setActive({ session: createdSessionId });
      } else {
        // Modify this code to use signIn or signUp to set this missing requirements you set in your dashboard.
        throw new Error(
          "There are unmet requirements, modifiy this else to handle them",
        );
      }
    } catch (err) {
      console.log(JSON.stringify(err, null, 2));
      console.log("error signing in", err);
    }
  }, [startOAuthFlow]);

  const handleSignInWithApplePress = React.useCallback(async () => {
    try {
      const { createdSessionId, setActive } = await appleFlow();
      if (createdSessionId && setActive) {
        setActive({ session: createdSessionId });
      } else {
        // Modify this code to use signIn or signUp to set this missing requirements you set in your dashboard.
        throw new Error(
          "There are unmet requirements, modifiy this else to handle them",
        );
      }
    } catch (err) {
      console.log(JSON.stringify(err, null, 2));
      console.log("error signing in", err);
    }
  }, [appleFlow]);

  return (
    <View className="flex h-full items-center justify-center ">
      <View className="p-6">
        <Image
          source={require("../../assets/sakpa_small.png")}
          className="h-40 w-40"
        />
      </View>
      <View className="mx-3">
        <SKTextInput
          placeholder="Email Address"
          spellCheck={false}
          className=" my-auto block  h-16 w-72 rounded-xl border-2 border-[#d9d9d9] bg-gray-100 p-4 text-xl outline-none focus:text-gray-700"
        />
        <Pressable
          className={`mx-auto my-2 flex w-72  flex-row content-center items-center justify-center rounded-xl bg-[#1dbaa7] py-4 text-black shadow-sm`}
          onPress={handleSignInWithGooglePress}
        >
          <SKText
            className="ml-2  text-lg font-semibold text-white"
            fontWeight="semi-bold"
          >
            CONTINUE
          </SKText>
        </Pressable>

        <Divider />
      </View>

      <View>
        <AppleButton onPress={handleSignInWithApplePress}></AppleButton>
      </View>

      <Pressable
        className={`mx-auto my-2 flex w-72  flex-row content-center items-center justify-center rounded-md bg-[#d9d9d9] py-3 text-black shadow-sm`}
        onPress={handleSignInWithGooglePress}
      >
        <Image
          source={require("../../assets/OAuth/google_2.svg")}
          contentFit="scale-down"
          className=" h-8 w-8"
        />
        <SKText className="ml-2 text-xl " fontWeight="normal">
          {" "}
          Sign in with Google
        </SKText>
      </Pressable>
    </View>
  );
};

const Divider = () => {
  return <View style={styles.divider} />;
};

const styles = StyleSheet.create({
  button: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 4,
    elevation: 3,
    backgroundColor: "#1dbaa7",
  },
  text: {
    fontSize: 16,
    lineHeight: 21,
    fontWeight: "bold",
    letterSpacing: 0.25,
    color: "white",
  },
  divider: {
    borderBottomColor: "#000",
    borderBottomWidth: StyleSheet.hairlineWidth,
    marginVertical: 10,
  },
});
