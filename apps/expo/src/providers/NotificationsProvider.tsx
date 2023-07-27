import React, { useEffect, useRef, useState } from "react";
import { Platform, View } from "react-native";
import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import { router, useRootNavigation } from "expo-router";
import { useAuth } from "@clerk/clerk-expo";

import { trpc } from "../utils/trpc";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

function useNotificationObserver() {
  React.useEffect(() => {
    let isMounted = true;

    function redirect(notification: Notifications.Notification) {
      if(notification.request.content.data.type === "schedule"){
        router.push({
          pathname: "/schedule"
        });
      }else{
        router.push({
          pathname: "chat/[id]",
          params: {
            id: notification.request.content.data.senderId,
          },
        });
      }
    }

    Notifications.getLastNotificationResponseAsync()
      .then(response => {
        if (!isMounted || !response?.notification) {
          return;
        }
        redirect(response?.notification);
      });

    const subscription = Notifications.addNotificationResponseReceivedListener(response => {
      redirect(response.notification);
    });

    return () => {
      isMounted = false;
      subscription.remove();
    };
  }, []);
}

/* async function registerForPushNotificationsAsync() {
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
} */

const NotificationsProvider = ({ children, appIsReady }: { children: React.ReactNode; appIsReady: boolean }) => {
  
  useNotificationObserver();
  return <>{children}</>;
};

export default NotificationsProvider;
