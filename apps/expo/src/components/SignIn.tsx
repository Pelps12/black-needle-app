import React, { useState } from "react";
import {
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { Image } from "expo-image";
import { useOAuth, useSignIn } from "@clerk/clerk-expo";

import { useWarmUpBrowser } from "../hooks/useWarmUpBrowser";
import AppleButton from "./OAuth/AppleButton";
import GoogleButton from "./OAuth/GoogleButton";
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
  const [email, setEmail] = useState<string>();
  const [password, setPassword] = useState<string>();
  const { startOAuthFlow } = useOAuth({ strategy: "oauth_google" });
  const { startOAuthFlow: appleFlow } = useOAuth({ strategy: "oauth_apple" });
  const { signIn, setActive: setEmailFlowActive } = useSignIn();

  const handleEmailLogin = async () => {
    if (email && password) {
      const result = await signIn?.create({
        identifier: email,
        password,
      });
      if (result?.status === "complete" && setEmailFlowActive) {
        setEmailFlowActive({ session: result.createdSessionId });
      }
    }
  };

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
          value={email}
          onChangeText={(e) => setEmail(e)}
          className=" my-1 block  h-16 w-72 rounded-xl border-2 border-[#d9d9d9] bg-gray-100 p-4 text-lg outline-none focus:text-gray-700"
        />
        <SKTextInput
          placeholder="Password"
          spellCheck={false}
          value={password}
          secureTextEntry={true}
          onChangeText={(e) => setPassword(e)}
          textContentType="password"
          className=" my-1 block  h-16 w-72 rounded-xl border-2 border-[#d9d9d9] bg-gray-100 p-4 text-lg outline-none focus:text-gray-700"
        />
        <Pressable
          className={`mx-auto my-2 flex w-72  flex-row content-center items-center justify-center rounded-xl bg-[#1dbaa7] py-4 text-black shadow-sm`}
          onPress={handleEmailLogin}
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
        <AppleButton onPress={handleSignInWithApplePress} />
      </View>

      <View>
        <GoogleButton onPress={handleSignInWithGooglePress} />
      </View>
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
