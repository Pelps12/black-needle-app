import React, { useContext } from "react";
import { Pressable, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Image } from "expo-image";
import { Link } from "expo-router";
import { useUser } from "@clerk/clerk-expo";
import { AntDesign, Ionicons } from "@expo/vector-icons";
import { BottomTabHeaderProps } from "@react-navigation/bottom-tabs";
import { NativeStackHeaderProps } from "@react-navigation/native-stack";

import type {} from "react";
import { useNotificationContext } from "../providers/NotificationsProvider";
import SKText from "./Utils/SKText";

const Header: React.FC<NativeStackHeaderProps | BottomTabHeaderProps> = (
  props,
) => {
  const { user, isLoaded, isSignedIn } = useUser();
  const notificationCount = useNotificationContext();

  return (
    <SafeAreaView className="relative mb-0 flex w-full flex-row items-end justify-between bg-[#F2F2F2] px-2 py-0">
      <View className="flex flex-row items-end gap-0  text-xl font-bold uppercase">
        <View className="flex flex-row items-center">
          {props?.back?.title && (
            <Pressable
              className="items-center"
              onPress={() =>
                props?.navigation.canGoBack() && props?.navigation.goBack()
              }
            >
              <Ionicons name="arrow-back" size={24} color="black" />
            </Pressable>
          )}
          <Image
            source={require("../../assets/sakpa_small.png")}
            className="h-9 w-9"
            contentFit="contain"
          />
        </View>

        <SKText className="text-2xl" fontWeight="medium">
          akpa
        </SKText>

        {props?.options.title && (
          <View className="">
            <SKText className="mx-auto my-auto text-sm" fontWeight="semi-bold">
              {` (${props?.options.title})`}
            </SKText>
          </View>
        )}
      </View>

      <View className="flex-row items-center gap-3">
        {/* <Image
          className="h-8 w-8 rounded-full"
          source={require("../../assets/shopping_cart.svg")}
          alt=":)"
        /> */}
        {isLoaded && isSignedIn && (
          <>
            <Link href="/chat">
              <View className="relative p-1">
                {notificationCount !== 0 && (
                  <View className="absolute right-0 top-0 z-30 h-4 w-4 rounded-full bg-[#1dbaa7] ">
                    <Text className="text-center">{notificationCount}</Text>
                  </View>
                )}
                <Ionicons name="ios-chatbox-outline" size={24} color="black" />
              </View>
            </Link>

            <Link href="/home/profile">
              <Image
                className="h-10 w-10 rounded-full"
                source={user?.profileImageUrl}
              />
            </Link>
          </>
        )}

        {isLoaded && !isSignedIn && (
          <Link className="my-auto" href={`/auth/signin`}>
            <View
              className={` rounded-lg  bg-[#1dbaa7] px-3 py-1  text-black `}
            >
              <SKText className=" text-md text-center font-semibold text-white">
                SIGN IN
              </SKText>
            </View>
          </Link>
        )}
      </View>
    </SafeAreaView>
  );
};

export default Header;
