import * as React from 'react';

import { StyleSheet, View, Text } from 'react-native';
import { runCppHybridObjectTests, runSwiftHybridObjectTests } from './runHybridObjectTests';


export default function App() {
  React.useEffect(() => {
    const timeout = setTimeout(async () => {
      await runCppHybridObjectTests()
      await runSwiftHybridObjectTests()
    }, 1000)
    return () => {
      clearTimeout(timeout)
    }
  }, [])

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
