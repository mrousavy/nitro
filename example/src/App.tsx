import * as React from 'react';

import { StyleSheet, View, Text } from 'react-native';
import { ImageConstructors } from 'react-native-nitro-image'


export default function App() {
  React.useEffect(() => {
    console.log('Loading image...')
    let image = ImageConstructors.loadImageFromSystemName('heart.fill')
    console.log('Image loaded!')
    console.log(`Image is ${image.size.width}x${image.size.height}`)


    for (let i = 0; i < 10; i++) {
      console.log('bouncing back...')
      const another = ImageConstructors.bounceBack(image)
      console.log('bounced back!', another.name)
    }


    const start = performance.now()
    for (let i = 0; i < 10_000; i++) {
      image = ImageConstructors.bounceBack(image)
    }
    const end = performance.now()
    console.log(`Passed HybridObject Image to native and back 10.000 times in ${(end - start).toFixed(2)}ms! :)`)
  }, [])
  // React.useEffect(() => {
  //   const timeout = setTimeout(async () => {
  //     await runCppHybridObjectTests()
  //     await runSwiftHybridObjectTests()
  //   }, 1000)
  //   return () => {
  //     clearTimeout(timeout)
  //   }
  // }, [])

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
