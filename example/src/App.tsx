import * as React from 'react';

import { StyleSheet, View, Text } from 'react-native';
import { createTestHybridObject } from 'react-native-nitro-modules';

const testObject = createTestHybridObject()

console.log(Object.keys(testObject))

export default function App() {


  return (
    <View style={styles.container}>
      <Text>Hello world!</Text>
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
