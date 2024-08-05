import * as React from 'react'

import { StyleSheet, View, Text, ScrollView, Button } from 'react-native'
import { ImageConstructors } from 'react-native-nitro-image'
import { getTests, type TestRunner } from '../getTests'
import { SafeAreaView } from 'react-native-safe-area-context'

const allTests = getTests()

type State = '📱 Click to run' | '⏳ Running' | '❌ Failed' | '✅ Passed'

function TestCase({ test }: { test: TestRunner }): React.ReactElement {
  const [state, setState] = React.useState<State>('📱 Click to run')
  const [extraMessage, setExtraMessage] = React.useState('')

  const onPress = React.useCallback(() => {
    setState('⏳ Running')
    requestAnimationFrame(async () => {
      const result = await test.run()
      switch (result.status) {
        case 'successful':
          setState('✅ Passed')
          setExtraMessage(`Result: ${result.result}`)
          break
        case 'failed':
          setState('❌ Failed')
          setExtraMessage(`Error: ${result.message}`)
          break
      }
    })
  }, [test])

  return (
    <View style={styles.testCase}>
      <View style={styles.testBox}>
        <Text style={styles.testName}>{test.name}</Text>
        <View style={{ height: 5 }} />
        <Text style={styles.testStatus} numberOfLines={4}>
          {state} ({extraMessage})
        </Text>
      </View>
      <View style={{ flex: 1 }} />
      <Button title="Run" onPress={onPress} />
    </View>
  )
}

export function HybridObjectTestsScreen() {
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

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.header}>HybridObject Tests</Text>
      <ScrollView style={{ flex: 1 }}>
        {allTests.map((t, i) => (
          <TestCase key={`test-${i}`} test={t} />
        ))}
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  header: {
    fontSize: 26,
    fontWeight: 'bold',
    paddingBottom: 15,
  },
  container: {
    flex: 1,
    paddingHorizontal: 15,
    paddingVertical: 10,
  },
  box: {
    width: 60,
    height: 60,
    marginVertical: 20,
  },
  testCase: {
    width: '100%',
    borderBottomWidth: StyleSheet.hairlineWidth,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  testBox: {
    flexShrink: 1,
    flexDirection: 'column',
  },
  testName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  testStatus: {
    fontSize: 14,
    flex: 1,
  },
})
