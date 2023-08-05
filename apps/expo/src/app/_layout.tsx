import "react-native-gesture-handler";
import React, { useCallback, useEffect, useState } from "react";
import { View } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import Constants from "expo-constants";
import { Tabs } from "expo-router";
import * as SecureStore from "expo-secure-store";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { ClerkProvider, SignedIn, SignedOut } from "@clerk/clerk-expo";
import { SignIn } from "@clerk/clerk-react";
import {
  Poppins_400Regular,
  Poppins_500Medium,
  Poppins_600SemiBold,
  Poppins_700Bold,
  useFonts,
} from "@expo-google-fonts/dev";
import { AntDesign, FontAwesome, MaterialIcons } from "@expo/vector-icons";
import { StripeProvider } from "@stripe/stripe-react-native";

import Header from "../components/header";
import AblyProvider from "../providers/AblyProvider";
import NavigationProvider from "../providers/NavigationProvider";
import NotificationsProvider from "../providers/NotificationsProvider";
import { TRPCProvider } from "../utils/trpc";

const tokenCache = {
  getToken(key: string) {
    return SecureStore.getItemAsync(key);
  },
  saveToken(key: string, value: string) {
    return SecureStore.setItemAsync(key, value);
  },
};

SplashScreen.preventAutoHideAsync(); //Prevent the splash screen from automatically removing

// This is the main layout of the app
// It wraps your pages with the providers they need
const RootLayout = () => {
  let [fontsLoaded] = useFonts({
    Poppins_500Medium,
    Poppins_400Regular,
    Poppins_600SemiBold,
    Poppins_700Bold,
  });
  const [appIsReady, setAppIsReady] = useState(false);

  useEffect(() => {
    console.log(Constants.expoConfig?.extra?.CLERK_PUBLISHABLE_KEY);
  }, []);

  if (!fontsLoaded) {
    return <></>;
  }
  return (
    <ClerkProvider
      publishableKey={
        Constants.expoConfig?.extra?.CLERK_PUBLISHABLE_KEY as string
      }
      tokenCache={tokenCache}
    >
      <TRPCProvider>
        <SafeAreaProvider>
          <NotificationsProvider appIsReady={fontsLoaded}>
            <AblyProvider>
              <StripeProvider
                publishableKey={
                  Constants.expoConfig?.extra?.STRIPE_PUBLISHABLE_KEY as string
                }
                merchantIdentifier={
                  Constants.expoConfig?.extra?.MERCHANT_ID as string
                }
              >
                <NavigationProvider />
              </StripeProvider>
            </AblyProvider>
          </NotificationsProvider>
        </SafeAreaProvider>
      </TRPCProvider>
    </ClerkProvider>
  );
};

export default RootLayout;
