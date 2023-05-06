import React, { useEffect } from "react";
import Toast from "react-native-toast-message";
import Constants from "expo-constants";
import * as SecureStore from "expo-secure-store";
import {
  assertConfiguration,
  configureAbly,
  useChannel,
} from "@ably-labs/react-hooks";

import { trpc } from "../utils/trpc";

const tokenStore = {
  getToken(key: string) {
    return SecureStore.getItemAsync(key);
  },
  saveToken(key: string, value: string) {
    return SecureStore.setItemAsync(key, value);
  },
};

const AblyProvider = ({ children }: { children: React.ReactNode }) => {
  const ref = React.useRef<any>();
  const URL = Constants.expoConfig?.extra?.PUBLIC_URL as string;
  const getAblyToken = trpc.chat.getToken.useMutation();
  useEffect(() => {
    const setUpAbly = async () => {
      const recoveryKey = await tokenStore.getToken("ably_recovery_key");
      configureAbly({
        autoConnect: true,
        ...(recoveryKey ? { recover: recoveryKey } : {}),
        echoMessages: true,
        httpMaxRetryCount: 3,
        authCallback: (data, callback) => {
          getAblyToken.mutate(undefined, {
            onSuccess: (data) => {
              callback(null, data);
            },
            onError: () => {
              callback(
                {
                  code: 40101,
                  message: "I dunno",
                  statusCode: 400,
                  name: "Ably Error",
                },
                null,
              );
            },
          });
        },
      });

      const ably = assertConfiguration();

      if (ably.connection.recoveryKey) {
        console.log(ably.connection.recoveryKey);
        await tokenStore.saveToken(
          "ably_recovery_key",
          ably.connection.recoveryKey,
        );
      }
      if (ably.connection.errorReason) {
        configureAbly({
          authUrl: `${URL}/api/ably/createTokenRequest`,
          autoConnect: true,
        });
        if (assertConfiguration().connection.recoveryKey !== null) {
          const key = assertConfiguration().connection.recoveryKey;
          key && (await tokenStore.saveToken("ably_recovery_key", key));
        }
      }
      if (ably) {
        const channel = ably.channels.get(`chat-${ably.auth.clientId}`);
        channel.presence.enter();
      }
    };
    setUpAbly();
  }, []);

  return <>{children}</>;
};

export default AblyProvider;
