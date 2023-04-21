import React from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";
import Constants from "expo-constants";
import { Tabs } from "expo-router";
import * as SecureStore from "expo-secure-store";
import { StatusBar } from "expo-status-bar";
import { ClerkProvider, SignedIn, SignedOut } from "@clerk/clerk-expo";
import { FontAwesome, MaterialIcons } from "@expo/vector-icons";

import { SignInSignUpScreen } from "../components/SignIn";
import Header from "../components/header";
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

// This is the main layout of the app
// It wraps your pages with the providers they need
const RootLayout = () => {
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

                <Tabs.Screen
                  name="chat/index"
                  options={{
                    href: null,
                    title: "Chat",
                    tabBarIcon: ({ color }) => (
                      <MaterialIcons name="schedule" size={24} color={color} />
                    ),
                  }}
                />

                <Tabs.Screen
                  name="chat/[id]"
                  options={{
                    href: null,
                    title: "ChatBox",
                    tabBarIcon: ({ color }) => (
                      <MaterialIcons name="schedule" size={24} color={color} />
                    ),
                  }}
                />
              </Tabs>

              <StatusBar />
            </NotificationsProvider>
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
