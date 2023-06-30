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
import { createURL } from "expo-linking";
import { Link, Stack, useNavigation, useRouter } from "expo-router";
import { useOAuth, useSignIn } from "@clerk/clerk-expo";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import AppleButton from "../components/OAuth/AppleButton";
import GoogleButton from "../components/OAuth/GoogleButton";
import SKText from "../components/Utils/SKText";
import SKTextInput from "../components/Utils/SKTextInput";
import { useWarmUpBrowser } from "../hooks/useWarmUpBrowser";

const Signin = () => {
  return (
    <SafeAreaView className="bg-[#f2f2f2]">
      <View className="h-full w-full p-4">
        <SignInWithOAuth />
      </View>
    </SafeAreaView>
  );
};

const SignInWithOAuth = () => {
  const navigation = useNavigation();
  const router = useRouter();
  useWarmUpBrowser();
  const [email, setEmail] = useState<string>();
  const [password, setPassword] = useState<string>();
  const [errorMessage, setErrorMessage] = useState<string>();
  const { startOAuthFlow } = useOAuth({
    strategy: "oauth_google",
  });
  const { startOAuthFlow: appleFlow } = useOAuth({ strategy: "oauth_apple" });
  const { signIn, setActive: setEmailFlowActive } = useSignIn();

  const handleEmailLogin = async () => {
    if (email && password) {
      try {
        const result = await signIn?.create({
          identifier: email,
          password,
        });

        if (result?.status === "complete" && setEmailFlowActive) {
          setEmailFlowActive({ session: result.createdSessionId });
        }
      } catch (err: any) {
        // Handle the error here
        console.error("An error occurred:", JSON.stringify(err));
        setErrorMessage(err.errors[0].message);
      }
    }
  };

  const handleSignInWithGooglePress = React.useCallback(async () => {
    try {
      const { createdSessionId, setActive } = await startOAuthFlow({
        redirectUrl: `${createURL("oauth-callback")}`,
      });
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
      const { createdSessionId, setActive } = await appleFlow({
        redirectUrl: `${createURL("oauth-callback")}`,
      });
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

        <Pressable onPress={() => router.push("/forgotpassword")}>
          <SKText className="text-right text-[#2563eb]">
            Forgot password?
          </SKText>
        </Pressable>

        <Divider />
        <View className="flex-row justify-center">
          <SKText className="text-center">Don't have an account? </SKText>
          <Pressable onPress={() => router.push("signup")}>
            <SKText className="text-[#2563eb]">Sign Up</SKText>
          </Pressable>
        </View>
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

export default Signin;
