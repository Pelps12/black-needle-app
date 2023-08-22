import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Alert, AppState, AppStateStatus, Platform, View } from "react-native";
import * as Notifications from "expo-notifications";
import { router, useRootNavigation, useRootNavigationState } from "expo-router";
import * as TaskManager from "expo-task-manager";

import { getNotificationNumber } from "../utils/misc";
import { trpc } from "../utils/trpc";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: true,
  }),
});

const NotificationContext = createContext<number>(0);

export const useNotificationContext = () => {
  return useContext(NotificationContext);
};

const NotificationsProvider = ({
  children,
  appIsReady,
}: {
  children: React.ReactNode;
  appIsReady: boolean;
}) => {
  const mutation = trpc.user.errorLog.useMutation();
  const initialNotifications = trpc.chat.getNotifications.useQuery(undefined, {
    refetchOnWindowFocus: true,
  });
  const rootNavigationStateKey = useRootNavigationState().key;
  const [notification, setNotification] =
    useState<Notifications.Notification>();
  const [roomNotificationList, setRoomNotificationList] = useState<string[]>(
    [],
  );
  const notificationCount = useMemo(() => {
    return getNotificationNumber(
      initialNotifications.data?.map((val) => val.id),
      roomNotificationList,
    );
  }, [initialNotifications.data, roomNotificationList]);
  const [isNavigationReady, setNavigationReady] = useState(false);
  const rootNav = useRootNavigation();

  //Notifications.setBadgeCountAsync(initialNotifications.data?.length ?? 0);

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
    console.log(initialNotifications.data);
  }, [initialNotifications.data]);

  const [appState, setAppState] = useState(AppState.currentState);
  const utils = trpc.useContext();

  useEffect(() => {
    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      if (appState.match(/inactive|background/) && nextAppState === "active") {
        console.log("App is back in the foreground");
      } else if (nextAppState === "inactive") {
        console.log("App is going inactive");
      } else if (nextAppState === "background") {
        utils.chat.getNotifications.invalidate();
        Notifications.getPresentedNotificationsAsync().then((notifications) =>
          setRoomNotificationList(
            notifications
              .filter((not) => {
                typeof not.request.content.data.roomId === "string";
              })
              .map((val) => val.request.content.data.roomId),
          ),
        );
      }

      setAppState(nextAppState);
    };

    const sub = AppState.addEventListener("change", handleAppStateChange);

    return () => {
      sub.remove();
    };
  }, [appState]);

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

      //Update notification list and invalidate existing messages list
      const inappSubscription = Notifications.addNotificationReceivedListener(
        (notification) => {
          utils.chat.getRecentRooms.invalidate();
          setRoomNotificationList((notifications) => [
            ...notifications,
            notification.request.content.data.roomId,
          ]);
        },
      );

      return () => {
        isMounted = false;
        subscription.remove();
        inappSubscription.remove();
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

  return (
    <NotificationContext.Provider value={notificationCount}>
      {children}
    </NotificationContext.Provider>
  );
};

export default NotificationsProvider;
