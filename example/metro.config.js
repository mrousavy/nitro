const { getDefaultConfig, mergeConfig } = require('@react-native/metro-config')
const path = require('path')
const exclusionList = require('metro-config/private/defaults/exclusionList').default
const escape = require('escape-string-regexp')

const root = path.resolve(__dirname, '..')

// Modules that should only be loaded once (from root), not duplicated
const blockedModules = ['react-native-nitro-modules']

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
    blockList: exclusionList(
      blockedModules.flatMap((m) => [
        // Block from packages/*/node_modules (nested copies)
        new RegExp(`^${escape(path.join(root, 'packages'))}/.*/node_modules/${escape(m)}\\/.*$`),
      ])
    ),
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
