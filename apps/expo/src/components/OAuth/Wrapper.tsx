import React from "react";
import { Platform, View } from "react-native";
import Constants from "expo-constants";
import * as Device from "expo-device";
import { createURL } from "expo-linking";
import * as Notifications from "expo-notifications";
import { useRouter } from "expo-router";
import { useOAuth } from "@clerk/clerk-expo";

import { trpc } from "../../utils/trpc";
import AppleButton from "./AppleButton";
import GoogleButton from "./GoogleButton";

async function registerForPushNotificationsAsync() {
  let token: Notifications.ExpoPushToken | undefined;
  if (Device.isDevice) {
    const { status: existingStatus } =
      await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== "granted") {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    if (finalStatus !== "granted") {
      alert("Failed to get push token for push notification!");
      return;
    }
    token = await Notifications.getExpoPushTokenAsync({
      projectId: Constants.expoConfig?.extra?.eas.projectId,
    });
    console.log(token);
  } else {
    token = undefined;
  }

  if (Platform.OS === "android") {
    Notifications.setNotificationChannelAsync("default", {
      name: "default",
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: "#FF231F7C",
    });
  }

  return token;
}

const OAuthWrapper = ({ mode }: { mode: "signin" | "signup" }) => {
  const router = useRouter();
  const tokenMutation = trpc.user.setExpoToken.useMutation();
  const { startOAuthFlow } = useOAuth({
    strategy: "oauth_google",
  });
  const { startOAuthFlow: appleFlow } = useOAuth({ strategy: "oauth_apple" });

  const handleSignInWithGooglePress = React.useCallback(async () => {
    try {
      const { createdSessionId, setActive } = await startOAuthFlow({
        redirectUrl: `${createURL("oauth-callback")}`,
      });
      if (createdSessionId && setActive) {
        setActive({ session: createdSessionId });
        router.replace("/home");
        const token = await registerForPushNotificationsAsync();
        if (token) {
          tokenMutation.mutate({
            expoToken: token.data,
          });
        }
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
        router.replace("/home");
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
    <>
      <View>
        <AppleButton onPress={handleSignInWithApplePress} mode="signin" />
      </View>
      <View>
        <GoogleButton onPress={handleSignInWithGooglePress} mode="signin" />
      </View>
    </>
  );
};
export default OAuthWrapper;
