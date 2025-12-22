import {
  androidPlatform,
  androidEmulator,
} from "@react-native-harness/platform-android";
import {
  applePlatform,
  appleSimulator,
} from "@react-native-harness/platform-apple";

const config = {
  entryPoint: "./index.js",
  appRegistryComponentName: "NitroExample",

  runners: [
    androidPlatform({
      name: "android",
      device: androidEmulator("Pixel_8_API_35"),
      bundleId: "com.margelo.nitroexample",
    }),
    applePlatform({
      name: "ios",
      device: appleSimulator("iPhone 16 Pro", "18.6"),
      bundleId: "com.mrousavy.nitro.example",
    }),
  ],
  defaultRunner: "android",
  bridgeTimeout: 120000,

  resetEnvironmentBetweenTestFiles: true,
  unstable__skipAlreadyIncludedModules: false,
};

export default config;
