#!/bin/bash

echo "Copying headers tp 'android/build/headers' for Android prefab..."

# Create the target directory if it doesn't exist
mkdir -p android/build/headers/nitromodules/NitroModules/

# Copy header files from cpp directory
find ./android/src/main/cpp -name "*.hpp" -type f -exec cp {} android/build/headers/nitromodules/NitroModules/ \;

# Copy header files from root cpp directory
find ./cpp -name "*.hpp" -type f -exec cp {} android/build/headers/nitromodules/NitroModules/ \;
