import React, { useEffect, useRef, useState } from "react";
import { Alert, Platform, View } from "react-native";
import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import {
  router,
  useNavigation,
  useRootNavigation,
  useRootNavigationState,
} from "expo-router";
import { useAuth } from "@clerk/clerk-expo";

import { trpc } from "../utils/trpc";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

function useNotificationObserver({
  appIsReady,
  mutation,
}: {
  appIsReady: boolean;
  mutation: any;
}) {
  React.useEffect(() => {
    try {
      let isMounted = true;

      function redirect(notification: Notifications.Notification) {
        if (appIsReady) {
          try {
            if (notification.request.content.data.type === "schedule") {
              router.push({
                pathname: "/schedule",
              });
            } else {
              router.push({
                pathname: "chat/[id]",
                params: {
                  id: notification.request.content.data.senderId,
                },
              });
            }
          } catch (err: any) {
            Alert.alert("Error", err.message);
          }
        }
      }

      Notifications.getLastNotificationResponseAsync().then((response) => {
        if (!isMounted || !response?.notification) {
          return;
        }
        redirect(response?.notification);
      });

      const subscription =
        Notifications.addNotificationResponseReceivedListener((response) => {
          redirect(response.notification);
        });

      return () => {
        isMounted = false;
        subscription.remove();
      };
    } catch (err: any) {
      mutation.mutate({
        message: err.message,
      });
    }
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

const NotificationsProvider = ({
  children,
  appIsReady,
}: {
  children: React.ReactNode;
  appIsReady: boolean;
}) => {
  const mutation = trpc.user.errorLog.useMutation();
  const rootNavigationStateKey = useRootNavigationState().key;
  const [notification, setNotification] =
    useState<Notifications.Notification>();
  const [isNavigationReady, setNavigationReady] = useState(false);
  const rootNav = useRootNavigation();
  const appIsReady2 = !!rootNavigationStateKey;

  useEffect(() => {
    const unsubscribe = rootNav?.addListener("state", (event) => {
      // console.log("INFO: rootNavigation?.addListener('state')", event);
      setNavigationReady(true);
    });
    return function cleanup() {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [rootNav]);

  useEffect(() => {
    try {
      let isMounted = true;

      function redirect(notification: Notifications.Notification) {
        setNotification(notification);
      }

      Notifications.getLastNotificationResponseAsync().then((response) => {
        if (!isMounted || !response?.notification) {
          return;
        }
        redirect(response?.notification);
      });

      const subscription =
        Notifications.addNotificationResponseReceivedListener((response) => {
          redirect(response.notification);
        });

      return () => {
        isMounted = false;
        subscription.remove();
      };
    } catch (err: any) {
      mutation.mutate({
        message: err.message,
      });
    }
  }, []);

  useEffect(() => {
    if (notification && isNavigationReady) {
      try {
        if (notification.request.content.data.type === "schedule") {
          router.push({
            pathname: "/schedule",
          });
          setNotification(undefined);
        } else {
          router.push({
            pathname: "chat/[id]",
            params: {
              id: notification.request.content.data.senderId,
            },
          });
          setNotification(undefined);
        }
      } catch (err: any) {
        Alert.alert("Error", err.message);
      }
    }
  }, [notification, isNavigationReady]);

  return <>{children}</>;
};

export default NotificationsProvider;
