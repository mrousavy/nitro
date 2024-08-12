import * as React from 'react'

import { StyleSheet, View, Text, ScrollView, Button } from 'react-native'
import {
  HybridSwiftKotlinTestObject,
  HybridTestObject,
  ImageConstructors,
} from 'react-native-nitro-image'
import { getTests, type TestRunner } from '../getTests'
import { SafeAreaView } from 'react-native-safe-area-context'
import { logPrototypeChain } from '../logPrototypeChain'

logPrototypeChain(HybridTestObject)

const swiftObject = HybridSwiftKotlinTestObject
swiftObject.stringValue = 'HOOO'
console.log(swiftObject.stringValue)

const allTests = getTests()

interface TestState {
  runner: TestRunner
  state: '📱 Click to run' | '⏳ Running' | '❌ Failed' | '✅ Passed'
  extraMessage: string
}

interface TestCaseProps {
  test: TestState
  onRunPressed: () => void
}

function TestCase({ test, onRunPressed }: TestCaseProps): React.ReactElement {
  return (
    <View style={styles.testCase}>
      <View style={styles.testBox}>
        <Text style={styles.testName}>{test.runner.name}</Text>
        <View style={styles.smallVSpacer} />
        <Text style={styles.testStatus} numberOfLines={6}>
          {test.state} ({test.extraMessage})
        </Text>
      </View>
      <View style={styles.flex} />
      <Button title="Run" onPress={onRunPressed} />
    </View>
  )
}

export function HybridObjectTestsScreen() {
  const [tests, setTests] = React.useState<TestState[]>(() =>
    allTests.map((t) => ({
      runner: t,
      state: '📱 Click to run',
      extraMessage: '',
    }))
  )
  const status = React.useMemo(() => {
    const passed = tests.filter((t) => t.state === '✅ Passed').length
    const failed = tests.filter((t) => t.state === '❌ Failed').length
    const running = tests.filter((t) => t.state === '⏳ Running').length

    if (running > 0) {
      return `⏳ Running ${running}/${tests.length} tests...`
    }
    if (passed > 0 || failed > 0) {
      if (passed > 0 && failed > 0) {
        return `✅ Passed ${passed}/${tests.length} tests, ❌ failed ${failed}/${tests.length} tests.`
      } else if (passed > 0) {
        return `✅ Passed ${passed}/${tests.length} tests.`
      } else if (failed > 0) {
        return `❌ Failed ${failed}/${tests.length} tests.`
      }
    }
    return `📱 Idle`
  }, [tests])

  const updateTest = React.useCallback(
    (
      runner: TestRunner,
      newState: TestState['state'],
      newMessage: TestState['extraMessage']
    ) => {
      setTests((t) => {
        const indexOfTest = t.findIndex((v) => v.runner === runner)
        if (indexOfTest === -1) {
          throw new Error(
            `Test ${runner} does not exist in all tests! What did you click? lol`
          )
        }
        const copy = [...t]
        copy[indexOfTest]!.state = newState
        copy[indexOfTest]!.extraMessage = newMessage
        return copy
      })
    },
    []
  )

  const runTest = React.useCallback(
    (test: TestState) => {
      updateTest(test.runner, '⏳ Running', '')
      requestAnimationFrame(async () => {
        const result = await test.runner.run()
        switch (result.status) {
          case 'successful':
            updateTest(test.runner, '✅ Passed', `Result: ${result.result}`)
            break
          case 'failed':
            updateTest(test.runner, '❌ Failed', `Error: ${result.message}`)
            break
        }
      })
    },
    [updateTest]
  )

  const runAllTests = React.useCallback(() => {
    tests.forEach((t) => runTest(t))
  }, [runTest, tests])

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
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {tests.map((t, i) => (
          <TestCase
            key={`test-${i}`}
            test={t}
            onRunPressed={() => runTest(t)}
          />
        ))}
      </ScrollView>

      <View style={styles.bottomView}>
        <Text>{status}</Text>
        <View style={styles.smallVSpacer} />
        <Button title="Run all tests" onPress={runAllTests} />
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  header: {
    fontSize: 26,
    fontWeight: 'bold',
    paddingBottom: 15,
    marginHorizontal: 15,
  },
  container: {
    flex: 1,
    paddingVertical: 10,
  },
  scrollContent: {
    paddingHorizontal: 15,
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
  smallVSpacer: {
    height: 5,
  },
  flex: { flex: 1 },
  bottomView: {
    paddingHorizontal: 15,
    paddingTop: 15,
    alignItems: 'center',
  },
})
