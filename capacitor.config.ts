import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.clashofcipher.app',
  appName: 'Clash of Cipher',
  webDir: 'dist',
  android: {
    buildOptions: {
      releaseType: 'APK',
      keystorePath: 'app/debug-keys/debug.keystore',
      keystorePassword: 'android',
      keystoreAlias: 'androiddebugkey',
      keystoreAliasPassword: 'android',
      signingType: 'apksigner'
    }
  }
};

export default config;
