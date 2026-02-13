const { getDefaultConfig, mergeConfig } = require('@react-native/metro-config')
const path = require('path')

const root = path.resolve(__dirname, '..')

/**
 * Metro configuration
 * https://facebook.github.io/metro/docs/configuration
 *
 * @type {import('@react-native/metro-config').MetroConfig}
 */
const config = {
  watchFolders: [root],

  // Block duplicate copies of react-native-nitro-modules from nested node_modules
  // to ensure the module is only loaded once (preventing "Nitro linked twice" error)
  resolver: {
    blockList: [
      // Matches packages/*/node_modules/react-native-nitro-modules (uses [\/\\] for OS-agnostic separators)
      /[\/\\]packages[\/\\][^\/\\]+[\/\\]node_modules[\/\\]react-native-nitro-modules[\/\\]/,
    ],
  },

  transformer: {
    getTransformOptions: async () => ({
      transform: {
        experimentalImportSupport: false,
        inlineRequires: true,
      },
    }),
  },
}

module.exports = mergeConfig(getDefaultConfig(__dirname), config)
