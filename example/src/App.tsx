import * as React from 'react'

import { StyleSheet, View, Text } from 'react-native'
import { ImageConstructors, HybridTestObject } from 'react-native-nitro-image'
import { it } from './Testers'

async function runTests(): Promise<void> {
  it('passVariant(..)', () => HybridTestObject.passVariant(5)).equals(55)
  it('createMap()', () => HybridTestObject.createMap()).didReturn('object')
  it('flip(..)', () => HybridTestObject.flip([10, 5, 0])).equals([0, 5, 10])
  it('passTuple(..)', () =>
    HybridTestObject.passTuple([53, 'helo', false])).equals([53, 'helo', false])

  // Optional params test
  it('tryOptionalParams(..)', () =>
    HybridTestObject.tryOptionalParams(55, true)).didNotThrow()
  it('tryOptionalParams(..)', () =>
    HybridTestObject.tryOptionalParams(55, true, 'optional!')).didNotThrow()
  it('tryOptionalParams(..)', () =>
    // @ts-expect-error
    HybridTestObject.tryOptionalParams(55, true, 'optional!', false)).didThrow()
  it('tryOptionalParams(..)', () =>
    // @ts-expect-error
    HybridTestObject.tryOptionalParams(55)).didThrow()

  // Throw tests
  it('funcThatThrows()', () => HybridTestObject.funcThatThrows()).didThrow()
  it('valueThatWillThrowOnAccess', () =>
    HybridTestObject.valueThatWillThrowOnAccess).didThrow()
  it('valueThatWillThrowOnAccess', () =>
    (HybridTestObject.valueThatWillThrowOnAccess = 55)).didThrow()
  // Callbacks
  it('getValueFromJsCallback(..)', () =>
    HybridTestObject.getValueFromJsCallback(
      () => 'Hi from JS!',
      (nativestring) => {
        console.log(`Received callback from C++: "${nativestring}"`)
      }
    )).then((s) => s.didNotThrow())
}

export default function App() {
  const image = React.useMemo(() => {
    console.log('Loading image...')
    const i = ImageConstructors.loadImageFromSystemName('heart.fill')
    ImageConstructors.bounceBack(i)
    ImageConstructors.bounceBack(i)
    ImageConstructors.bounceBack(i)
    console.log('Image loaded!')
    console.log(`Image is ${i.size.width}x${i.size.height}`)
    return i
  }, [])

  React.useEffect(() => {
    image.saveToFile('some path', (path) => {
      console.log('saved to ' + path + '!')
    })
  }, [image])

  React.useEffect(() => {
    runTests()
  }, [])

  return (
    <View style={styles.container}>
      <Text>
        Image is {image.size.width.toFixed(0)}x{image.size.height.toFixed(0)}!
      </Text>
    </View>
  )
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
})
