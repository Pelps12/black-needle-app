import Expo, {
  ExpoPushMessage as PushMessage,
  ExpoPushToken as Token,
  Expo as exp,
} from "expo-server-sdk";

import { env } from "@acme/env-config/env";

export const expo = new exp({ accessToken: env.EXPO_ACCESS_TOKEN });

export type ExpoPushToken = Token;
export const ExpoClass = exp;
export type ExpoPushMessage = PushMessage;
