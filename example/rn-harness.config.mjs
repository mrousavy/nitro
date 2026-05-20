import {
  androidPlatform,
  androidEmulator,
} from '@react-native-harness/platform-android'
import {
  applePlatform,
  appleSimulator,
} from '@react-native-harness/platform-apple'

const isCI = process.env.CI === 'true'

function numberFromEnv(name, fallback) {
  const value = process.env[name]
  if (value == null) return fallback

  const number = Number(value)
  if (!Number.isInteger(number) || number < 1) {
    throw new Error(`${name} must be a positive integer, got "${value}"`)
  }

  return number
}

const config = {
  entryPoint: './index.js',
  appRegistryComponentName: 'NitroExample',

  runners: [
    androidPlatform({
      name: 'android',
      device: androidEmulator(process.env.AVD_NAME ?? 'Pixel_8_API_35', {
        apiLevel: numberFromEnv('DEVICE_API_LEVEL', 35),
        profile: process.env.DEVICE_PROFILE ?? 'pixel_8',
        diskSize: process.env.AVD_DISK_SIZE ?? '1G',
        heapSize: process.env.AVD_HEAP_SIZE ?? '1G',
        snapshot: {
          enabled: isCI,
        },
      }),
      bundleId: 'com.margelo.nitroexample',
    }),
    applePlatform({
      name: 'ios',
      device: appleSimulator(
        process.env.DEVICE_MODEL ?? 'iPhone 17 Pro',
        process.env.IOS_VERSION ?? '26.2'
      ),
      bundleId: 'com.mrousavy.nitro.example',
    }),
  ],
  defaultRunner: 'android',
  platformReadyTimeout: isCI ? 420000 : 300000,
  bridgeTimeout: isCI ? 180000 : 60000,
  bundleStartTimeout: isCI ? 120000 : 60000,
  unstable__enableMetroCache: true,
}

export default config
