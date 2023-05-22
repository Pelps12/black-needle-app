import type { ExpoConfig } from "@expo/config";

const CLERK_PUBLISHABLE_KEY =
  "pk_test_ZW5vcm1vdXMtc2F3ZmlzaC05MS5jbGVyay5hY2NvdW50cy5kZXYk";

const PUBLIC_URL = "http://localhost:3000";
const NEXT_PUBLIC_UPLOADCARE_PUB_KEY = "ee6b07357ef85077ad3e";
const STRIPE_PUBLISHABLE_KEY =
  "pk_test_51M482WChaXTQFF1r63Ekbj7Gl8pcRDNLhGNLrLdshWxGOWyDtsmucwUgVUcOYcNm6e9GAcrOI4M8kDwb4qdovjcb006Gu3lgyh";
const MERCHANT_ID = "merchant.co.sakpa";

const defineConfig = (): ExpoConfig => ({
  name: "Sakpa",
  owner: "sakpa",
  slug: "sakpa",
  scheme: "sakpa",
  version: "1.0.0",
  orientation: "portrait",
  icon: "./assets/sakpa_small_(2).png",
  userInterfaceStyle: "light",
  splash: {
    image: "./assets/sakpa_icon.png",
    resizeMode: "contain",
    backgroundColor: "#f2f2f2",
  },
  updates: {
    fallbackToCacheTimeout: 0,
  },
  assetBundlePatterns: ["**/*"],
  ios: {
    supportsTablet: true,
    bundleIdentifier: "co.sakpa",
    entitlements: {
      "com.apple.developer.applesignin": ["Default"],
    },
  },
  android: {
    adaptiveIcon: {
      foregroundImage: "./assets/sakpa_small_(2).png",
    },
  },
  extra: {
    eas: {
      projectId: "bcef5ffc-e91d-49a5-9287-7f60dba8a190",
    },
    CLERK_PUBLISHABLE_KEY,
    PUBLIC_URL,
    STRIPE_PUBLISHABLE_KEY,
    MERCHANT_ID,
    NEXT_PUBLIC_UPLOADCARE_PUB_KEY,
  },
  plugins: [
    [
      "expo-image-picker",
      {
        photosPermission:
          "The app accesses your photos to let you share them with your friends.",
      },
    ],
  ],
});

export default defineConfig;
