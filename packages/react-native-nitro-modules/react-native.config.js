// https://github.com/react-native-community/cli/blob/main/docs/dependencies.md

module.exports = {
  spm: {
    name: 'NitroModules',
    // Vends Xcode's generated Swift C++-interop headers (<Module>-Swift.h)
    // to all self-managed packages via a stable `.spm-derived-headers`
    // symlink — see the plugin for details.
    autolinkingPlugin: './scripts/rn-spm-autolinking-plugin.cjs',
  },
  dependency: {
    platforms: {
      /**
       * @type {import('@react-native-community/cli-types').IOSDependencyParams}
       */
      ios: {},
      /**
       * @type {import('@react-native-community/cli-types').AndroidDependencyParams}
       */
      android: {},
    },
  },
}
