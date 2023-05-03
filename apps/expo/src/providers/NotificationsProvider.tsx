import React, { useEffect, useRef, useState } from "react";
import { Platform, View } from "react-native";
import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import { useRouter } from "expo-router";
import { useAuth } from "@clerk/clerk-expo";

import { trpc } from "../utils/trpc";

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

const NotificationsProvider = ({ children }: { children: React.ReactNode }) => {
  const [expoPushToken, setExpoPushToken] = useState<string | undefined>("");
  const [notification, setNotification] = useState<
    Notifications.Notification | boolean
  >(false);
  const tokenMutation = trpc.user.setExpoToken.useMutation();
  const notificationListener = useRef<any>();
  const responseListener = useRef<any>();
  const router = useRouter();
  useEffect(() => {
    console.log("I AM HER IN JERICO");
    registerForPushNotificationsAsync().then((token) => {
      token &&
        tokenMutation.mutate({
          expoToken: token,
        });
      setExpoPushToken(token);
    });

    notificationListener.current =
      Notifications.addNotificationReceivedListener((notification) => {
        console.log(notification);
        setNotification(notification);
      });

    responseListener.current =
      Notifications.addNotificationResponseReceivedListener((response) => {
        console.log(response);
        router.push({
          pathname: "chat/[id]",
          params: {
            id: response.notification.request.content.data["senderId"],
          },
        });
        console.log(response.notification.request.content.data["senderId"]);
      });

    return () => {
      Notifications.removeNotificationSubscription(
        notificationListener.current,
      );
      Notifications.removeNotificationSubscription(responseListener.current);
    };
  }, []);
  return <>{children}</>;
};

export default NotificationsProvider;
