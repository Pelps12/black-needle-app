import React from "react";
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Image } from "expo-image";
import { Link, Stack, useNavigation, useRouter } from "expo-router";
import { useSignUp } from "@clerk/clerk-expo";

import AppleButton from "../../components/OAuth/AppleButton";
import GoogleButton from "../../components/OAuth/GoogleButton";
import OAuthWrapper from "../../components/OAuth/Wrapper";

const SignUp = () => {
  const { isLoaded, signUp, setActive } = useSignUp();

  const [emailAddress, setEmailAddress] = React.useState("");
  const [errorMessage, setErrorMessage] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [pendingVerification, setPendingVerification] = React.useState(false);
  const [code, setCode] = React.useState("");
  const router = useRouter();

  // start the sign up process.
  const onSignUpPress = async () => {
    if (!isLoaded) {
      return;
    }

    try {
      await signUp.create({
        emailAddress,
        password,
      });

      // send the email.
      await signUp.prepareEmailAddressVerification({ strategy: "email_code" });

      // await setErrorMessage("");
      // change the UI to our pending section.
      setPendingVerification(true);
    } catch (err: any) {
      console.error(JSON.stringify(err, null, 2));
      setErrorMessage(err.errors[0].longMessage);
    }
  };

  // This verifies the user using email code that is delivered.
  const onPressVerify = async () => {
    if (!isLoaded) {
      return;
    }

    try {
      const completeSignUp = await signUp.attemptEmailAddressVerification({
        code,
      });

      await setActive({ session: completeSignUp.createdSessionId });
      router.push("/");
      setErrorMessage("");
    } catch (err: any) {
      console.error(JSON.stringify(err, null, 2));
      setErrorMessage(err.errors[0].longMessage);
    }
  };

  return (
    <View>
      <Stack.Screen options={{ title: "Sign Up" }} />
      {!pendingVerification && (
        <View className="flex h-full items-center justify-center ">
          <View className="p-6">
            <Image
              source={require("../../../assets/sakpa_small.png")}
              className="h-40 w-40"
            />
          </View>
          <View className="mx-3">
            <View>
              <TextInput
                className="my-1 block  h-16 w-72 rounded-xl border-2 border-[#d9d9d9] bg-gray-100 p-4 text-lg outline-none focus:text-gray-700"
                autoCapitalize="none"
                value={emailAddress}
                placeholder="Email..."
                onChangeText={(email) => setEmailAddress(email)}
              />
            </View>

            <View>
              <TextInput
                className="my-1 block  h-16 w-72 rounded-xl border-2 border-[#d9d9d9] bg-gray-100 p-4 text-lg outline-none focus:text-gray-700"
                value={password}
                placeholder="Password..."
                secureTextEntry={true}
                onChangeText={(password) => setPassword(password)}
              />
            </View>

            <TouchableOpacity
              className={`mx-auto my-2 flex w-72  flex-row content-center items-center justify-center rounded-xl bg-[#1dbaa7] py-4 text-black shadow-sm`}
              onPress={onSignUpPress}
            >
              <Text className="ml-2  text-lg font-semibold text-white">
                Sign up
              </Text>
            </TouchableOpacity>
            <View className="mb-24">
              <OAuthWrapper mode="signup" />
            </View>
          </View>
          {/* <Divider /> */}
          {/* <View>
            <AppleButton onPress={handleSignInWithApplePress} />
          </View>

          <View>
            <GoogleButton onPress={handleSignInWithGooglePress} />
          </View> */}
        </View>
      )}
      {pendingVerification && (
        <View className="flex h-full items-center justify-center ">
          <View className="p-6">
            <Image
              source={require("../../../assets/sakpa_small.png")}
              className="h-40 w-40"
            />
          </View>
          <View>
            {errorMessage && (
              <Text className="rounded bg-red-500 p-1 text-center text-white">
                {errorMessage}
              </Text>
            )}
          </View>
          <View className="mx-3 mb-72">
            <View>
              <TextInput
                className="my-1 block  h-16 w-72 rounded-xl border-2 border-[#d9d9d9] bg-gray-100 p-4 text-lg outline-none focus:text-gray-700"
                value={code}
                placeholder="Code..."
                onChangeText={(code) => setCode(code)}
              />
            </View>
            <TouchableOpacity
              className={`mx-auto my-2 flex w-72  flex-row content-center items-center justify-center rounded-xl bg-[#1dbaa7] py-4 text-black shadow-sm`}
              onPress={onPressVerify}
            >
              <Text>Verify Email</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
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
};

export default SignUp;
