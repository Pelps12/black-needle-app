import React, { useEffect, useState } from "react";
import { View } from "react-native";
import { Slot, SplashScreen, Tabs } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useAuth, useUser } from "@clerk/clerk-expo";
import { AntDesign, MaterialIcons } from "@expo/vector-icons";

import Header from "../components/header";

const NavigationProvider = ({ fontsLoaded }: { fontsLoaded: boolean }) => {
  const { isSignedIn, isLoaded } = useUser();

  useEffect(() => {
    if (fontsLoaded && isLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, isLoaded]);
  return (
    <>
      <Tabs
        sceneContainerStyle={{
          backgroundColor: "#f2f2f2",
        }}
        screenOptions={{
          headerStyle: {
            backgroundColor: "#F2F2F2",
          },
          tabBarBackground: () => <View className="bg-[#F2f2f2]" />,
          header: () => <Header />,
          headerShadowVisible: false,

          tabBarStyle: {
            backgroundColor: "#d9d9d9",
            height: 80,
          },
          tabBarIconStyle: {
            marginTop: 10,
            color: "#000",
            padding: 0,
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
              <MaterialIcons name="attach-money" size={24} color={color} />
            ),
          }}
        />

        <Tabs.Screen
          name="schedule/index"
          options={{
            title: "Schedule",
            tabBarLabelStyle: {
              display: "none",
            },
            tabBarIcon: ({ color }) => (
              <AntDesign name="clockcircleo" size={24} color={color} />
            ),
            href: isSignedIn ? "/schedule" : null,
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
            href: isSignedIn ? "/profile" : null,
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
            tabBarStyle: {
              display: "none",
            },
            tabBarIcon: ({ color }) => (
              <MaterialIcons name="schedule" size={24} color={color} />
            ),
          }}
        />

        <Tabs.Screen
          name="auth"
          options={{
            title: "Login",
            headerShown: false,
            tabBarLabelStyle: {
              display: "none",
            },
            href: isSignedIn ? null : "/auth",
            tabBarIcon: ({ color }) => (
              <AntDesign name="login" size={24} color={color} />
            ),
          }}
        />

        <Tabs.Screen
          name="schedule/payment"
          options={{
            href: null,
          }}
        />
        <Tabs.Screen
          name="seller/register"
          options={{
            href: null,
          }}
        />
      </Tabs>

      <StatusBar />
    </>
  );
};

export default NavigationProvider;
