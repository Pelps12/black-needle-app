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

const NotificationsProvider = ({ children, appIsReady }: { children: React.ReactNode; appIsReady: boolean }) => {
  const [expoPushToken, setExpoPushToken] = useState<string | undefined>("");
  const [notification, setNotification] = useState<
    Notifications.Notification | boolean
  >(false);
  const [notificationResponse, setNotificationResponse] = useState<Notifications.NotificationResponse | boolean>(false)
  const tokenMutation = trpc.user.setExpoToken.useMutation();
  const notificationListener = useRef<any>();
  const responseListener = useRef<any>();
  const navigation = useRootNavigation();
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
        
      });

    responseListener.current =
      Notifications.addNotificationResponseReceivedListener((response) => {
        setNotificationResponse(response);
        router.push({
          pathname: "chat/[id]",
          params: {
            id: response.notification.request.content.data.senderId,
          },
        });
      });

    return () => {
      Notifications.removeNotificationSubscription(
        notificationListener.current,
      );
      Notifications.removeNotificationSubscription(responseListener.current);
    };
  }, []);

  useEffect(() => {
   
    
    if(navigation?.isReady && typeof notificationResponse !== "boolean"){
      setTimeout(() => {
        if(notificationResponse.notification.request.content.data.type === "schedule"){
          router.push({
            pathname: "/schedule"
          });
        }else{
          router.push({
            pathname: "chat/[id]",
            params: {
              id: notificationResponse.notification.request.content.data.senderId,
            },
          });
        }
      }, 2000)
      
      
    }
  }, [notificationResponse, navigation?.isReady])
  return <>{children}</>;
};

export default NotificationsProvider;
