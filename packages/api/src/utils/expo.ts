import Expo from "expo-server-sdk";

import { env } from "@acme/env-config/env";

export const expo = new Expo({ accessToken: env.EXPO_ACCESS_TOKEN });
