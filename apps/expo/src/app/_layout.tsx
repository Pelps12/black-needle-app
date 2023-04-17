import React, { useEffect, useRef, useState } from "react";
import { Platform } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import Constants from "expo-constants";
import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import { Tabs } from "expo-router";
import * as SecureStore from "expo-secure-store";
import { StatusBar } from "expo-status-bar";
import { ClerkProvider, SignedIn, SignedOut } from "@clerk/clerk-expo";
import { FontAwesome, MaterialIcons } from "@expo/vector-icons";

import { SignInSignUpScreen } from "../components/SignIn";
import Header from "../components/header";
import { TRPCProvider } from "../utils/trpc";

const tokenCache = {
  getToken(key: string) {
    return SecureStore.getItemAsync(key);
  },
  saveToken(key: string, value: string) {
    return SecureStore.setItemAsync(key, value);
  },
};

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

async function registerForPushNotificationsAsync() {
  let token;
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
    token = (await Notifications.getExpoPushTokenAsync()).data;
    console.log(token);
  } else {
    alert("Must use physical device for Push Notifications");
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

// This is the main layout of the app
// It wraps your pages with the providers they need
const RootLayout = () => {
  /* const [expoPushToken, setExpoPushToken] = useState<string | undefined>("");
  const [notification, setNotification] = useState<
    Notifications.Notification | boolean
  >(false);
  const tokenMutation = trpc.user.setExpoToken.useMutation();
  const notificationListener = useRef<any>();
  const responseListener = useRef<any>();
  useEffect(() => {
    registerForPushNotificationsAsync().then((token) => {
      token &&
        tokenMutation.mutate({
          expoToken: token,
        });
      setExpoPushToken(token);
    });

    notificationListener.current =
      Notifications.addNotificationReceivedListener((notification) => {
        setNotification(notification);
      });

    responseListener.current =
      Notifications.addNotificationResponseReceivedListener((response) => {
        console.log(response);
      });

    return () => {
      Notifications.removeNotificationSubscription(
        notificationListener.current,
      );
      Notifications.removeNotificationSubscription(responseListener.current);
    };
  }, []); */
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
            {/*
          The Stack component displays the current page.
          It also allows you to configure your screens 
        */}
            {/*  <Stack
          screenOptions={{
            headerStyle: {
              backgroundColor: "#F2F2F2",
            },

            header: () => <Header />,
            headerShadowVisible: false,
          }}
        /> */}
            <Tabs
              screenOptions={{
                headerStyle: {
                  backgroundColor: "#F2F2F2",
                },

                header: () => <Header />,
                headerShadowVisible: false,
                tabBarStyle: {
                  backgroundColor: "#D9D9D9",
                  borderRadius: 15,
                  height: 90,
                  paddingTop: 10,
                },
                tabBarActiveTintColor: "#72a2f9",
              }}
              initialRouteName="index"
            >
              <Tabs.Screen
                name="index"
                options={{
                  title: "Home",
                  tabBarIcon: ({ color }) => (
                    <FontAwesome name="home" size={24} color={color} />
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
                name="post/[id]"
                options={{
                  href: null,
                  title: "Schedule",
                  tabBarIcon: ({ color }) => (
                    <MaterialIcons name="schedule" size={24} color={color} />
                  ),
                }}
              />

              <Tabs.Screen
                name="schedule"
                options={{
                  title: "Schedule",
                  tabBarIcon: ({ color }) => (
                    <MaterialIcons name="schedule" size={24} color={color} />
                  ),
                }}
              />

              <Tabs.Screen
                name="profile"
                options={{
                  title: "Profile",
                  tabBarIcon: ({ color }) => (
                    <FontAwesome name="user" size={24} color={color} />
                  ),
                }}
              />
            </Tabs>

            <StatusBar />
          </SafeAreaProvider>
        </TRPCProvider>
      </SignedIn>

      <SignedOut>
        <SignInSignUpScreen />
      </SignedOut>
    </ClerkProvider>
  );
};

export default RootLayout;
