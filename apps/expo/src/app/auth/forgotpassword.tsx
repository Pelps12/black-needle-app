import React, { useEffect, useState } from "react";
import { Pressable, Text, TextInput, View } from "react-native";
import { Image } from "expo-image";
import { Stack } from "expo-router";
import { useSignIn } from "@clerk/clerk-expo";

import SKText from "../../components/Utils/SKText";
import SKTextInput from "../../components/Utils/SKTextInput";

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
    } catch (err: any) {
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
      } else if (setActive && result?.status === "complete") {
        setActive({ session: result.createdSessionId });
        setComplete(true);
      } else {
        console.log(result);
      }
    } catch (err: any) {
      console.error("error", err.errors[0].longMessage);
      setErrorMessage(err.errors[0].longMessage);
    }
  };

  return (
    <View className="flex h-4/5 items-center justify-center ">
      <Stack.Screen options={{ title: "Forgot Password" }} />
      <View className="p-6">
        <Image
          source={require("../../../assets/sakpa_small.png")}
          className="h-40 w-40"
        />
      </View>
      <View className="mx-3">
        <View style={{ flexDirection: "column" }}>
          {!successfulCreation && !complete && (
            <>
              {errorMessage && (
                <SKText className="rounded bg-red-500 p-2 text-center text-white">
                  {errorMessage}
                </SKText>
              )}
              <SKText>Enter Email</SKText>
              <SKTextInput
                className=" my-1 block  h-16 w-72 rounded-xl border-2 border-[#d9d9d9] bg-gray-100 p-4 text-lg outline-none focus:text-gray-700"
                placeholder="e.g john@doe.com"
                value={email}
                onChangeText={setEmail}
              />
              <Pressable
                className={`mx-auto my-2 flex w-72  flex-row content-center items-center justify-center rounded-xl bg-[#1dbaa7] py-4 text-black shadow-sm`}
                onPress={create}
              >
                <SKText
                  className="ml-2  text-lg font-semibold text-white"
                  fontWeight="semi-bold"
                >
                  Send
                </SKText>
              </Pressable>
            </>
          )}

          {successfulCreation && !complete && (
            <>
              {errorMessage && (
                <View className=" flex-row justify-center rounded bg-red-500 p-2">
                  <SKText className=" text-center text-white">
                    {errorMessage}
                  </SKText>
                  <Pressable
                    onPress={() => {
                      setGoToNext(!goToNext);
                      setErrorMessage("");
                    }}
                  >
                    <SKText className="text-center text-[#4971c0]">
                      {" "}
                      Re-enter{" "}
                    </SKText>
                  </Pressable>
                </View>
              )}
              {goToNext && (
                <>
                  <SKText>New password</SKText>
                  <SKTextInput
                    className=" my-1 block  h-16 w-72 rounded-xl border-2 border-[#d9d9d9] bg-gray-100 p-4 text-lg outline-none focus:text-gray-700"
                    secureTextEntry
                    value={password}
                    onChangeText={setPassword}
                  />
                  <Pressable
                    className={`mx-auto my-2 flex w-72  flex-row content-center items-center justify-center rounded-xl bg-[#1dbaa7] py-4 text-black shadow-sm`}
                    onPress={reset}
                  >
                    <SKText
                      className="ml-2  text-lg font-semibold text-white"
                      fontWeight="semi-bold"
                    >
                      Reset
                    </SKText>
                  </Pressable>
                </>
              )}

              {!goToNext && (
                <>
                  <SKText>Enter Code</SKText>
                  <SKTextInput
                    className=" my-1 block  h-16 w-72 rounded-xl border-2 border-[#d9d9d9] bg-gray-100 p-4 text-lg outline-none focus:text-gray-700"
                    value={code}
                    placeholder="Code..."
                    onChangeText={setCode}
                  />
                  <Pressable
                    className={`mx-auto my-2 flex w-72  flex-row content-center items-center justify-center rounded-xl bg-[#1dbaa7] py-4 text-black shadow-sm`}
                    onPress={() => setGoToNext(true)}
                  >
                    <SKText
                      className="ml-2  text-lg font-semibold text-white"
                      fontWeight="semi-bold"
                    >
                      Next
                    </SKText>
                  </Pressable>
                </>
              )}
            </>
          )}

          {complete && <SKText>You successfully changed your password</SKText>}
          {secondFactor && (
            <SKText>2FA is required, this UI does not handle that</SKText>
          )}
        </View>
      </View>
    </View>
  );
};

export default Forgotpassword;
