import * as React from 'react'

import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  Button,
  Platform,
} from 'react-native'
import {
  HybridTestObjectCpp,
  HybridTestObjectSwiftKotlin,
  HybridChild,
  HybridBase,
} from 'react-native-nitro-image'
import { getTests, type TestRunner } from '../getTests'
import { SafeAreaView } from 'react-native-safe-area-context'
import { logPrototypeChain } from '../logPrototypeChain'
import SegmentedControl from '@react-native-segmented-control/segmented-control'
import { NitroModules } from 'react-native-nitro-modules'

logPrototypeChain(HybridChild)
console.log(HybridBase.baseValue)
console.log(HybridChild.baseValue)
console.log(HybridChild.childValue)

logPrototypeChain(HybridTestObjectCpp)

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
  const [selectedIndex, setSelectedIndex] = React.useState(0)
  const selectedObject = [HybridTestObjectCpp, HybridTestObjectSwiftKotlin][
    selectedIndex
  ]
  console.log(`Showing Tests for HybridObject "${selectedObject?.name}"`)
  const allTests = React.useMemo(
    () => getTests(selectedObject ?? HybridTestObjectCpp),
    [selectedObject]
  )
  const [tests, setTests] = React.useState<TestState[]>(() =>
    allTests.map((t) => ({
      runner: t,
      state: '📱 Click to run',
      extraMessage: '',
    }))
  )

  React.useEffect(() => {
    setTests(
      allTests.map((t) => ({
        runner: t,
        state: '📱 Click to run',
        extraMessage: '',
      }))
    )
  }, [allTests])

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

  const updateTest = (
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
  }

  const runTest = (test: TestState) => {
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
  }

  const runAllTests = () => {
    tests.forEach((t) => runTest(t))
  }

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.header}>HybridObject Tests</Text>
      <View style={styles.topControls}>
        <SegmentedControl
          style={styles.segmentedControl}
          values={['C++', 'Swift/Kotlin']}
          selectedIndex={selectedIndex}
          onChange={({ nativeEvent: { selectedSegmentIndex } }) => {
            setSelectedIndex(selectedSegmentIndex)
          }}
        />
        <View style={styles.flex} />
        <Text style={styles.buildTypeText}>{NitroModules.buildType}</Text>
      </View>

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
  topControls: {
    marginHorizontal: 15,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  buildTypeText: {
    fontFamily: Platform.select({
      ios: 'Menlo',
      macos: 'Menlo',
      android: 'monospace',
    }),
    fontWeight: 'bold',
  },
  segmentedControl: {
    minWidth: 180,
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
