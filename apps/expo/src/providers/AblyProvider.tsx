import React, { createContext, useContext, useEffect, useState } from "react";
import Toast from "react-native-toast-message";
import Constants from "expo-constants";
import * as SecureStore from "expo-secure-store";
import {
  assertConfiguration,
  configureAbly,
  useChannel,
  type Realtime,
} from "@ably-labs/react-hooks";
import { useAuth } from "@clerk/clerk-expo";

import Config from "../utils/config";
import { trpc } from "../utils/trpc";

const tokenStore = {
  getToken(key: string) {
    return SecureStore.getItemAsync(key);
  },
  saveToken(key: string, value: string) {
    return SecureStore.setItemAsync(key, value);
  },
};

type AblyMessage = {
  isSender: boolean;
  data: {
    roomId: string;
    message: string;
    receipientId?: string;
  };
  extras?: {
    headers: Record<string, string | undefined>;
  };
};

const MessagesContext = createContext<{
  ablyMessages: AblyMessage[];
  setAblyMessages: React.Dispatch<React.SetStateAction<AblyMessage[]>>;
  ably?: any;
}>({
  ablyMessages: [],
  setAblyMessages: () => {},
});

export const useMessagesContext = () => {
  return useContext(MessagesContext);
};

const AblyProvider = ({ children }: { children: React.ReactNode }) => {
  const ref = React.useRef<any>();
  const URL = Config?.PUBLIC_URL as string;
  const getAblyToken = trpc.chat.getToken.useMutation();

  const [ably, setAbly] = useState<any>();
  const [ablyReady, setAblyReady] = useState(false);
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
        setAbly(ably);
      }
      setAblyReady(true);
    };
    setUpAbly();
  }, []);

  const [ablyMessages, setAblyMessages] = useState<AblyMessage[]>([]);

  return (
    <>
      {ablyReady ? (
        <MessagesContext.Provider
          value={{ ablyMessages, setAblyMessages, ably }}
        >
          <ChannelComponent>{children}</ChannelComponent>
        </MessagesContext.Provider>
      ) : (
        <MessagesContext.Provider
          value={{ ablyMessages, setAblyMessages, ably }}
        >
          {children}
        </MessagesContext.Provider>
      )}
    </>
  );
};

const ChannelComponent = ({ children }: { children: React.ReactNode }) => {
  const { userId } = useAuth();
  const { setAblyMessages } = useMessagesContext();
  useChannel(`chat:${userId}`, (message) => {
    console.log(userId, message);
    if (message.data.receipientId == userId) {
      setAblyMessages((ablyMessages) => [
        ...ablyMessages,
        {
          isSender: false,
          data: {
            roomId: message.data.roomId,
            message: message.data.message,
          },
        },
      ]);
    }
  });
  return <>{children}</>;
};

export default AblyProvider;
