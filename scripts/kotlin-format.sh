#!/bin/bash

set -e

KOTLIN_DIRS=(
  # react-native-nitro-modules
  "packages/react-native-nitro-modules/android/src/main/java"
  # react-native-nitro-test
  "packages/react-native-nitro-test/android/src/main/java"
  # react-native-nitro-test-external
  "packages/react-native-nitro-test-external/android/src/main/java"
)

if which ktlint >/dev/null; then
  ktlint --editorconfig=./config/.editorconfig --format "${KOTLIN_DIRS[@]}"
  echo "Kotlin Format done!"
else
  echo "error: ktlint not installed, install with 'brew install ktlint' (see https://github.com/pinterest/ktlint )"
  exit 1
fi
