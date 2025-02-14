// const path = require('path');
// const pak = require('../package.json');

const { configureProjects } = require("react-native-test-app");
const { windows } = configureProjects({
  android: {
    sourceDir: "android",
  },
  ios: {
    sourceDir: "ios",
  },
  windows: {
    sourceDir: "windows",
    solutionFile: "windows/NitroExample.sln",
  },
});

module.exports = {
  dependencies: {
    // [pak.name]: {
    //   root: path.join(__dirname, '..'),
    // },
    "react-native-screens": {
      platforms: {
        // TODO: Disable on Windows because RNScreens doesn't support RNW + New Arch
        windows: null,
      },
    },
  },
  project: {
    windows
  },
}
