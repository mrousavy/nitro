#!/bin/bash

set -e

SWIFT_DIRS=(
  # react-native-nitro-modules
  "packages/react-native-nitro-modules/ios"
  # react-native-nitro-test
  "packages/react-native-nitro-test/ios"
  # react-native-nitro-test-external
  "packages/react-native-nitro-test-external/ios"
)

if which swift >/dev/null; then
  DIRS=$(printf "%s " "${SWIFT_DIRS[@]}")
  find $DIRS -type f \( -name "*.swift" \) -print0 | while read -d $'\0' file; do
    swift format --in-place "$file"
  done
  echo "Swift Format done!"
else
  echo "error: swift not installed, install the toolchain with Xcode."
  exit 1
fi
