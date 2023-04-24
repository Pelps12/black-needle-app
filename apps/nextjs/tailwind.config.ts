import type { Config } from "tailwindcss";

import baseConfig from "@acme/tailwind-config";

export default {
  content: ["./src/**/*.tsx"],
  presets: [baseConfig],
  theme: {
    colors: {
      primary: "#1dbaa7",

      secondary: "#72a2f9",

      accent: "#293cb5",

      neutral: "#25252D",

      "base-100": "#F2F2F2",

      info: "#72AAD5",

      success: "#2BDA82",

      warning: "#EBA937",

      error: "#E26850",
    },
  },
} satisfies Config;
