#!/bin/bash

set -e

KOTLIN_DIRS=(
  "packages/**/android/src/main/java"
)

if which ktlint >/dev/null; then
  ktlint --editorconfig=./config/.editorconfig --format "${KOTLIN_DIRS[@]}"
  echo "Kotlin Format done!"
else
  echo "error: ktlint not installed, install with 'brew install ktlint' (see https://github.com/pinterest/ktlint )"
  exit 1
fi
