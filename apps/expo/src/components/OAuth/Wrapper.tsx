import React from "react";
import { View } from "react-native";
import { createURL } from "expo-linking";
import { useRouter } from "expo-router";
import { useOAuth } from "@clerk/clerk-expo";

import AppleButton from "./AppleButton";
import GoogleButton from "./GoogleButton";

const OAuthWrapper = ({ mode }: { mode: "signin" | "signup" }) => {
  const router = useRouter();
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
        router.push("/");
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
        router.push("/");
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
