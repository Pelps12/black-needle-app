import React, { useEffect, useState } from "react";
import {
  Button,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { Image } from "expo-image";
import { Link, Stack } from "expo-router";
import { useOAuth, useSignIn } from "@clerk/clerk-expo";
import { NavigationContainer, useNavigation } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import AppleButton from "../components/OAuth/AppleButton";
import GoogleButton from "../components/OAuth/GoogleButton";
import SKText from "../components/Utils/SKText";
import SKTextInput from "../components/Utils/SKTextInput";
import { useWarmUpBrowser } from "../hooks/useWarmUpBrowser";

const Forgotpassword = () => {
  const [isVisible, setIsVisible] = useState(true);
  const [goToNext, setGoToNext] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState<string>();
  const [code, setCode] = useState("");
  const [successfulCreation, setSuccessfulCreation] = useState(false);
  const [complete, setComplete] = useState(false);
  const [secondFactor, setSecondFactor] = useState(false);
  const { isLoaded, signIn, setActive } = useSignIn();
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
    }, 60000);

    return () => {
      clearTimeout(timer);
    };
  }, []);
  const create = async () => {
    try {
      await signIn?.create({
        strategy: "reset_password_email_code",
        identifier: email,
      });
      setSuccessfulCreation(true);
    } catch (err) {
      console.error("error", err.errors[0].longMessage);
      setErrorMessage(err.errors[0].longMessage);
    }
  };

  const reset = async () => {
    try {
      const result = await signIn?.attemptFirstFactor({
        strategy: "reset_password_email_code",
        code,
        password,
      });
      if (result?.status === "needs_second_factor") {
        setSecondFactor(true);
      } else if (result?.status === "complete") {
        setActive({ session: result.createdSessionId });
        setComplete(true);
      } else {
        console.log(result);
      }
    } catch (err) {
      console.error("error", err.errors[0].longMessage);
      setErrorMessage(err.errors[0].longMessage);
    }
  };

  return (
    <View className="flex h-4/5 items-center justify-center ">
      <View className="p-6">
        <Image
          source={require("../../assets/sakpa_small.png")}
          className="h-40 w-40"
        />
      </View>
      <View className="mx-3">
        <View style={{ flexDirection: "column" }}>
          {!successfulCreation && !complete && (
            <>
              {errorMessage && (
                <Text className="rounded bg-red-500 p-2 text-center text-white">
                  {errorMessage}
                </Text>
              )}
              <Text>Enter Email</Text>
              <TextInput
                className=" my-1 block  h-16 w-72 rounded-xl border-2 border-[#d9d9d9] bg-gray-100 p-4 text-lg outline-none focus:text-gray-700"
                placeholder="e.g john@doe.com"
                value={email}
                onChangeText={setEmail}
              />
              <Pressable
                className={`mx-auto my-2 flex w-72  flex-row content-center items-center justify-center rounded-xl bg-[#1dbaa7] py-4 text-black shadow-sm`}
                onPress={create}
              >
                <Text
                  className="ml-2  text-lg font-semibold text-white"
                  fontWeight="semi-bold"
                >
                  Send
                </Text>
              </Pressable>
            </>
          )}

          {successfulCreation && !complete && (
            <>
              {errorMessage && (
                <View className=" flex-row justify-center rounded bg-red-500 p-2">
                  <Text className=" text-center text-white">
                    {errorMessage}
                  </Text>
                  <Pressable
                    onPress={() => {
                      setGoToNext(!goToNext);
                      setErrorMessage("");
                    }}
                  >
                    <Text className="text-center text-[#4971c0]">
                      {" "}
                      Re-enter{" "}
                    </Text>
                  </Pressable>
                </View>
              )}
              {goToNext && (
                <>
                  <Text>New password</Text>
                  <TextInput
                    className=" my-1 block  h-16 w-72 rounded-xl border-2 border-[#d9d9d9] bg-gray-100 p-4 text-lg outline-none focus:text-gray-700"
                    secureTextEntry
                    value={password}
                    onChangeText={setPassword}
                  />
                  <Pressable
                    className={`mx-auto my-2 flex w-72  flex-row content-center items-center justify-center rounded-xl bg-[#1dbaa7] py-4 text-black shadow-sm`}
                    onPress={reset}
                  >
                    <Text
                      className="ml-2  text-lg font-semibold text-white"
                      fontWeight="semi-bold"
                    >
                      Reset
                    </Text>
                  </Pressable>
                </>
              )}

              {!goToNext && (
                <>
                  <Text>Enter Code</Text>
                  <TextInput
                    className=" my-1 block  h-16 w-72 rounded-xl border-2 border-[#d9d9d9] bg-gray-100 p-4 text-lg outline-none focus:text-gray-700"
                    value={code}
                    placeholder="Code..."
                    onChangeText={setCode}
                  />
                  <Pressable
                    className={`mx-auto my-2 flex w-72  flex-row content-center items-center justify-center rounded-xl bg-[#1dbaa7] py-4 text-black shadow-sm`}
                    onPress={() => setGoToNext(true)}
                  >
                    <Text
                      className="ml-2  text-lg font-semibold text-white"
                      fontWeight="semi-bold"
                    >
                      Next
                    </Text>
                  </Pressable>
                </>
              )}
            </>
          )}

          {complete && <Text>You successfully changed your password</Text>}
          {secondFactor && (
            <Text>2FA is required, this UI does not handle that</Text>
          )}
        </View>
      </View>
    </View>
  );
};

export default Forgotpassword;
