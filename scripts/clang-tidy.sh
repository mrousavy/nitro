#!/bin/bash

set -e

CPP_DIRS=(
  # react-native-nitro-modules
  "packages/react-native-nitro-modules/cpp"
  # react-native-nitro-test
  "packages/react-native-nitro-test/cpp"
)

if which clang-tidy >/dev/null; then
  DIRS=$(printf "%s " "${CPP_DIRS[@]}")
  FILES=$(find $DIRS -type f \( -name "*.h" -o -name "*.hpp" -o -name "*.cpp" \))

  if [ -z "$FILES" ]; then
    echo "No C++ files found!"
    exit 1
  fi

  echo "Running clang-tidy on $(echo "$FILES" | wc -l | tr -d ' ') files..."

  FAILED=0
  while IFS= read -r file; do
    if ! clang-tidy --config-file=./config/.clang-tidy -p=. --quiet "$file" -- -std=c++20 -x c++ 2>/dev/null; then
      FAILED=1
    fi
  done <<< "$FILES"

  if [ $FAILED -ne 0 ]; then
    echo "clang-tidy found issues!"
    exit 1
  fi

  echo "clang-tidy done!"
else
  echo "error: clang-tidy not installed, install with 'brew install llvm' (or manually from https://clang.llvm.org/extra/clang-tidy/ )"
  exit 1
fi
