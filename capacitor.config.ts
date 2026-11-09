import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.unityClinics.app",
  appName: "unity clinics",
  webDir: "./apps/mob-app/.output/public",
  ios: {
    scheme: "unityClinics",
  },
  plugins: {
    PushNotifications: {
      presentationOptions: ["badge", "sound", "alert"],
    },
  },
};

export default config;
