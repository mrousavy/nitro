#!/bin/bash

echo "Releasing react-native-nitro..."

CURRENT_VERSION=$(node -e "console.log(require('./package.json').version)")

echo "Current version: $CURRENT_VERSION"

#yarn workspaces foreach -A --no-private npm publish --access public
