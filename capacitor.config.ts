// capacitor.config.ts
import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "app.dhyanam",
  appName: "Dhyanam",
  webDir: "dist",
  android: {
    buildOptions: {
      releaseType: "APK",
      keystorePath: "app/debug-keys/debug.jks",
      keystorePassword: "dhyanam1234",
      keystoreAlias: "dhyanam-debug",
      keystoreAliasPassword: "dhyanam1234",
      signingType: "apksigner",
    },
  },
};

export default config;
