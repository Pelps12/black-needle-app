import "react-native-gesture-handler";
import React, { useCallback, useEffect } from "react";
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
import { NavigationContainer, useNavigation } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { StripeProvider } from "@stripe/stripe-react-native";

import { SignInSignUpScreen } from "../components/SignIn";
import Header from "../components/header";
import AblyProvider from "../providers/AblyProvider";
import NotificationsProvider from "../providers/NotificationsProvider";
import { TRPCProvider } from "../utils/trpc";
import Forgotpassword from "./forgotpassword";
import Login from "./signin";
import SignUp from "./signup";

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
const Stack = createNativeStackNavigator();
const RootLayout = () => {
  let [fontsLoaded] = useFonts({
    Poppins_500Medium,
    Poppins_400Regular,
    Poppins_600SemiBold,
    Poppins_700Bold,
  });

  useEffect(() => {
    console.log(Constants.expoConfig?.extra?.CLERK_PUBLISHABLE_KEY);
  }, []);

  const onLayoutRootView = useCallback(async () => {
    if (fontsLoaded) {
      await SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);
  return (
    <ClerkProvider
      publishableKey={
        Constants.expoConfig?.extra?.CLERK_PUBLISHABLE_KEY as string
      }
      tokenCache={tokenCache}
    >
      <SignedIn>
        <TRPCProvider>
          <SafeAreaProvider>
            <NotificationsProvider>
              <AblyProvider>
                <StripeProvider
                  publishableKey={
                    Constants.expoConfig?.extra
                      ?.STRIPE_PUBLISHABLE_KEY as string
                  }
                >
                  <Tabs
                    screenOptions={{
                      headerStyle: {
                        backgroundColor: "#F2F2F2",
                      },

                      header: () => <Header />,
                      headerShadowVisible: false,
                      tabBarStyle: {
                        backgroundColor: "#d9d9d9",
                        borderRadius: 20,
                        left: 10,
                        right: 10,
                        bottom: 10,
                        elevation: 0,
                        position: "absolute",

                        height: 90,
                        paddingTop: 10,
                      },
                      tabBarIconStyle: {
                        marginTop: 10,
                        color: "#000",
                      },
                      tabBarActiveTintColor: "#1dbaa7",
                    }}
                    initialRouteName="index"
                  >
                    <Tabs.Screen
                      name="index"
                      options={{
                        title: "Home",
                        tabBarLabelStyle: {
                          display: "none",
                        },
                        tabBarIcon: ({ color }) => (
                          <AntDesign name="home" size={24} color={color} />
                        ),
                      }}
                    />
                    <Tabs.Screen
                      name="seller/[id]"
                      options={{
                        title: "Seller",
                        href: null,
                        tabBarIcon: ({ color }) => (
                          <MaterialIcons
                            name="attach-money"
                            size={24}
                            color={color}
                          />
                        ),
                      }}
                    />

                    <Tabs.Screen
                      name="schedule"
                      options={{
                        title: "Schedule",
                        tabBarLabelStyle: {
                          display: "none",
                        },
                        tabBarIcon: ({ color }) => (
                          <AntDesign name="calendar" size={24} color={color} />
                        ),
                      }}
                    />

                    <Tabs.Screen
                      name="profile"
                      options={{
                        title: "Profile",
                        tabBarLabelStyle: {
                          display: "none",
                        },
                        tabBarIcon: ({ color }) => (
                          <AntDesign name="user" size={24} color={color} />
                        ),
                      }}
                    />

                    <Tabs.Screen
                      name="chat/index"
                      options={{
                        href: null,
                        title: "Chat",
                        tabBarIcon: ({ color }) => (
                          <MaterialIcons
                            name="schedule"
                            size={24}
                            color={color}
                          />
                        ),
                      }}
                    />

                    <Tabs.Screen
                      name="chat/[id]"
                      options={{
                        href: null,
                        title: "ChatBox",
                        tabBarStyle: {
                          display: "none",
                        },
                        tabBarIcon: ({ color }) => (
                          <MaterialIcons
                            name="schedule"
                            size={24}
                            color={color}
                          />
                        ),
                      }}
                    />

                    <Tabs.Screen
                      name="seller/register"
                      options={{
                        title: "Seller",
                        href: null,
                      }}
                    />
                    <Tabs.Screen
                      name="signup"
                      options={{
                        title: "Signup",
                        href: null,
                      }}
                    />
                    <Tabs.Screen
                      name="forgotpassword"
                      options={{
                        href: null,
                      }}
                    />
                    <Tabs.Screen
                      name="signin"
                      options={{
                        href: null,
                      }}
                    />
                  </Tabs>

                  <StatusBar />
                </StripeProvider>
              </AblyProvider>
            </NotificationsProvider>
          </SafeAreaProvider>
        </TRPCProvider>
      </SignedIn>

      <SignedOut>
        <Stack.Navigator initialRouteName="signin">
          <Stack.Screen
            name="signin"
            component={Login}
            options={{ title: "Login" }}
          />
          <Stack.Screen
            name="signup"
            component={SignUp}
            options={{ title: "Register" }}
          />
          <Stack.Screen
            name="forgotpassword"
            component={Forgotpassword}
            options={{ title: "Forgot Password" }}
          />
        </Stack.Navigator>

        {/* <SignInSignUpScreen /> */}
      </SignedOut>
    </ClerkProvider>
  );
};

export default RootLayout;
