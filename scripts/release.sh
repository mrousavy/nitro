#!/bin/bash

set -e

echo "Starting the release process..."
echo "Provided options: $@"

echo "Flipping NITRO_ENABLE_LOGS to false..."
sed -i "s/#define NITRO_ENABLE_LOGS 1/#define NITRO_ENABLE_LOGS 0/g" packages/react-native-nitro-modules/cpp/NitroLogger.hpp

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
