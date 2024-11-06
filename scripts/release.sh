cd packages/react-native-nitro-modules
bun release $@

cd ../nitrogen
bun release $@

cd ../..
bun run release-it $@
