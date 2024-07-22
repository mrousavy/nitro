import * as React from 'react';

import { StyleSheet, View, Text } from 'react-native';
import { ImageConstructors } from 'react-native-nitro-image'


export default function App() {
  const image = React.useMemo(() => {
    console.log('Loading image...')
    const i = ImageConstructors.loadImageFromSystemName('heart.fill')
    ImageConstructors.bounceBack(i)
    console.log('Image loaded!')
    console.log(`Image is ${i.size.width}x${i.size.height}`)
    return i
  }, [])

  React.useEffect(() => {
    image.saveToFile('some path', (path) => {
      console.log('saved to ' + path + '!')
    })
  }, [])

  return (
    <View style={styles.container}>
      <Text>Image is {image.size.width.toFixed(0)}x{image.size.height.toFixed(0)}!</Text>
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
