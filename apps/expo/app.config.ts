import type { ExpoConfig } from "@expo/config";

const CLERK_PUBLISHABLE_KEY =
  "pk_test_ZW5vcm1vdXMtc2F3ZmlzaC05MS5jbGVyay5hY2NvdW50cy5kZXYk";

const PUBLIC_URL = "http://localhost:3000";
const STRIPE_PUBLISHABLE_KEY =
  "pk_test_51M482WChaXTQFF1r63Ekbj7Gl8pcRDNLhGNLrLdshWxGOWyDtsmucwUgVUcOYcNm6e9GAcrOI4M8kDwb4qdovjcb006Gu3lgyh";

const defineConfig = (): ExpoConfig => ({
  name: "expo",
  slug: "expo",
  scheme: "expo",
  version: "1.0.0",
  orientation: "portrait",
  icon: "./assets/sakpa_icon.png",
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
    bundleIdentifier: "your.bundle.identifier",
  },
  android: {
    adaptiveIcon: {
      foregroundImage: "./assets/icon.png",
      backgroundColor: "#1F104A",
    },
  },
  extra: {
    eas: {
      projectId: "bcef5ffc-e91d-49a5-9287-7f60dba8a190",
    },
    CLERK_PUBLISHABLE_KEY,
    PUBLIC_URL,
    STRIPE_PUBLISHABLE_KEY,
  },
  plugins: ["./expo-plugins/with-modify-gradle.js"],
});

export default defineConfig;
