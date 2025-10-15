#!/bin/bash

set -e

CPP_DIRS=(
  # react-native-nitro-modules
  "packages/react-native-nitro-modules/android/src/main/cpp"
  "packages/react-native-nitro-modules/cpp"
  "packages/react-native-nitro-modules/ios"
  # react-native-nitro-test
  "packages/react-native-nitro-test/android/src/main/cpp"
  "packages/react-native-nitro-test/cpp"
  "packages/react-native-nitro-test/ios"
  # react-native-nitro-test-external
  "packages/react-native-nitro-test-external/android/src/main/cpp"
  "packages/react-native-nitro-test-external/ios"
)

if which clang-format >/dev/null; then
  DIRS=$(printf "%s " "${CPP_DIRS[@]}")
  find $DIRS -type f \( -name "*.h" -o -name "*.hpp" -o -name "*.cpp" -o -name "*.m" -o -name "*.mm" -o -name "*.c" \) -print0 | while read -d $'\0' file; do
    clang-format -style=file:./config/.clang-format -i "$file"
  done
  echo "C++ Format done!"
else
  echo "error: clang-format not installed, install with 'brew install clang-format' (or manually from https://clang.llvm.org/docs/ClangFormat.html)"
  exit 1
fi
