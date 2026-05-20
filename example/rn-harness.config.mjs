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
  if (value == null || value.trim() === '') return fallback

  const number = Number(value)
  if (!Number.isInteger(number) || number < 1) {
    throw new Error(`${name} must be a positive integer, got "${value}"`)
  }

  return number
}

function stringFromEnv(name, fallback) {
  const value = process.env[name]
  if (value == null || value.trim() === '') return fallback
  return value
}

const config = {
  entryPoint: './index.js',
  appRegistryComponentName: 'NitroExample',

  runners: [
    androidPlatform({
      name: 'android',
      device: androidEmulator(stringFromEnv('AVD_NAME', 'Pixel_7_API_35'), {
        apiLevel: numberFromEnv('DEVICE_API_LEVEL', 35),
        profile: stringFromEnv('DEVICE_PROFILE', 'pixel_7'),
        diskSize: stringFromEnv('AVD_DISK_SIZE', '1G'),
        heapSize: stringFromEnv('AVD_HEAP_SIZE', '1G'),
        snapshot: {
          enabled: isCI,
        },
      }),
      bundleId: 'com.margelo.nitroexample',
    }),
    applePlatform({
      name: 'ios',
      device: appleSimulator(
        stringFromEnv('DEVICE_MODEL', 'iPhone 17 Pro'),
        stringFromEnv('IOS_VERSION', '26.2')
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
