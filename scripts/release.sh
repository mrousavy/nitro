#!/bin/bash

set -e

echo "Starting the release process..."
echo "Provided options: $@"

echo "Publishing 'react-native-nitro-modules' to NPM"
cd packages/react-native-nitro-modules
bun release $@

echo "Publishing 'nitrogen' to NPM"
cd ../nitrogen
bun release $@

echo "Creating a Git bump commit and GitHub release"
cd ../..
bun run release-it $@

echo "Successfully released Nitro!"
