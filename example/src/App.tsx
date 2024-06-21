import * as React from 'react';

import { StyleSheet, View, Text } from 'react-native';
import { NitroModules } from 'react-native-nitro-modules';

const testObject = NitroModules.createTestHybridObject()

export default function App() {
  return (
    <View style={styles.container}>
      <Text>Result: {testObject}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  box: {
    width: 60,
    height: 60,
    marginVertical: 20,
  },
});
