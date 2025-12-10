import * as React from 'react'

import {
  StyleSheet,
  View,
  Text,
  Button,
  Platform,
  TextInput,
  FlatList,
} from 'react-native'
import {
  HybridTestObjectCpp,
  HybridTestObjectSwiftKotlin,
  HybridChild,
  HybridBase,
} from 'react-native-nitro-test'
import { getTests, type TestRunner } from '../getTests'
import { logPrototypeChain } from '../logPrototypeChain'
import SegmentedControl from '@react-native-segmented-control/segmented-control'
import { NitroModules } from 'react-native-nitro-modules'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useColors } from '../useColors'
import { TestCase, TestState } from '../components/TestCase'
import { KeyboardDismissBackground } from '../components/KeyboardDismissBackground'

logPrototypeChain(HybridChild)
console.log(HybridBase.baseValue)
console.log(HybridChild.baseValue)
console.log(HybridChild.childValue)

logPrototypeChain(HybridTestObjectCpp)

const PLATFORM_LANGUAGE =
  Platform.select({
    android: 'Kotlin',
    ios: 'Swift',
    macos: 'Swift',
  }) ?? '???'

type TestFilter = 'all' | 'passed' | 'failed' | 'pending'

const FILTER_OPTIONS: TestFilter[] = ['all', 'passed', 'failed', 'pending']

export function HybridObjectTestsScreen() {
  const safeArea = useSafeAreaInsets()
  const colors = useColors()
  const [selectedIndex, setSelectedIndex] = React.useState(0)
  const [searchQuery, setSearchQuery] = React.useState('')
  const [statusFilter, setStatusFilter] = React.useState<TestFilter>('all')
  const selectedObject = [HybridTestObjectCpp, HybridTestObjectSwiftKotlin][
    selectedIndex
  ]
  console.log(`Showing Tests for HybridObject "${selectedObject?.name}"`)
  const allTests = React.useMemo(
    () => getTests(selectedObject ?? HybridTestObjectCpp),
    [selectedObject]
  )
  const [unfilteredTests, setTests] = React.useState<TestState[]>(() =>
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

  const selectedFilterIndex = FILTER_OPTIONS.indexOf(statusFilter)

  const searchFilteredTests = React.useMemo(() => {
    // as a base we take all unfiltered tests
    const tests = unfilteredTests

    const query = searchQuery.trim().toLowerCase()
    if (query === '') {
      // no search query
      return tests
    }
    return tests.filter((t) => t.runner.name.toLowerCase().includes(query))
  }, [searchQuery, unfilteredTests])

  const statusFilteredTests = React.useMemo(() => {
    // as a base, we take all tests filtered by our search query
    const tests = searchFilteredTests

    if (statusFilter === 'all') {
      return tests
    }

    return tests.filter((t) => {
      switch (statusFilter) {
        case 'passed':
          return t.state === '✅ Passed'
        case 'failed':
          return t.state === '❌ Failed'
        case 'pending':
          return t.state === '📱 Click to run'
        default:
          return true
      }
    })
  }, [searchFilteredTests, statusFilter])

  const testCounts = React.useMemo(() => {
    const passed = searchFilteredTests.filter(
      (t) => t.state === '✅ Passed'
    ).length
    const failed = searchFilteredTests.filter(
      (t) => t.state === '❌ Failed'
    ).length
    const pending = searchFilteredTests.filter(
      (t) => t.state === '📱 Click to run'
    ).length
    const running = searchFilteredTests.filter(
      (t) => t.state === '⏳ Running'
    ).length

    return {
      passed,
      failed,
      pending,
      running,
      total: searchFilteredTests.length,
    }
  }, [searchFilteredTests])

  const filterLabels = React.useMemo(() => {
    return [
      `All (${testCounts.total})`,
      `✅ ${testCounts.passed}`,
      `❌ ${testCounts.failed}`,
      `📱 ${testCounts.pending}`,
    ]
  }, [testCounts])

  const status = React.useMemo(() => {
    if (testCounts.running > 0) {
      return `⏳ Running ${testCounts.running}/${testCounts.total} tests...`
    }
    if (testCounts.passed > 0 || testCounts.failed > 0) {
      if (testCounts.passed > 0 && testCounts.failed > 0) {
        return `✅ Passed ${testCounts.passed}/${testCounts.total} tests, ❌ failed ${testCounts.failed}/${testCounts.total} tests.`
      } else if (testCounts.passed > 0) {
        return `✅ Passed ${testCounts.passed}/${testCounts.total} tests.`
      } else if (testCounts.failed > 0) {
        return `❌ Failed ${testCounts.failed}/${testCounts.total} tests.`
      }
    }
    return `📱 Idle`
  }, [testCounts])

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
    searchFilteredTests.forEach((t) => runTest(t))
    requestAnimationFrame(() => {
      gc()
    })
  }

  return (
    <View style={[styles.container, { paddingTop: safeArea.top }]}>
      <KeyboardDismissBackground />

      <Text style={[styles.header, { color: colors.text }]}>
        HybridObject Tests
      </Text>
      <View style={styles.topControls}>
        <SegmentedControl
          style={styles.segmentedControl}
          values={['C++', PLATFORM_LANGUAGE]}
          selectedIndex={selectedIndex}
          onChange={({ nativeEvent: { selectedSegmentIndex } }) => {
            setSelectedIndex(selectedSegmentIndex)
          }}
        />
        <View style={styles.flex} />
        <Text style={[styles.buildTypeText, { color: colors.text }]}>
          {NitroModules.buildType}
        </Text>
      </View>

      <View style={styles.searchContainer}>
        <TextInput
          style={[
            styles.searchInput,
            { color: colors.text, borderColor: colors.border },
          ]}
          placeholder="Search tests..."
          placeholderTextColor={colors.textSecondary}
          value={searchQuery}
          onChangeText={setSearchQuery}
          autoCapitalize="none"
          autoCorrect={false}
          clearButtonMode="while-editing"
        />
        {searchQuery.length > 0 && (
          <Text
            style={[styles.searchResultsText, { color: colors.textSecondary }]}
          >
            Showing {searchFilteredTests.length} of {unfilteredTests.length}{' '}
            tests
          </Text>
        )}
      </View>

      <View style={styles.filterContainer}>
        <SegmentedControl
          style={styles.filterSegmentedControl}
          values={filterLabels}
          selectedIndex={selectedFilterIndex}
          onChange={({ nativeEvent: { selectedSegmentIndex } }) => {
            setStatusFilter(FILTER_OPTIONS[selectedSegmentIndex]!)
          }}
        />
      </View>

      <FlatList
        data={statusFilteredTests}
        keyExtractor={(test) => test.runner.name}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={{ color: colors.textSecondary }}>
              Nothing selected.
            </Text>
          </View>
        }
        renderItem={({ item: test, index }) => (
          <TestCase
            test={test}
            onRunPressed={() => runTest(test)}
            isOdd={index % 2 === 0}
          />
        )}
      />

      <View style={[styles.bottomView, { backgroundColor: colors.background }]}>
        <Text
          style={[styles.resultText, { color: colors.text }]}
          numberOfLines={2}
        >
          {status}
        </Text>
        <View style={styles.flex} />
        <Button title="Run all tests" onPress={runAllTests} />
      </View>
    </View>
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
  },
  emptyContainer: {
    flex: 1,
    paddingTop: 150,
    justifyContent: 'center',
    alignItems: 'center',
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
  searchContainer: {
    marginHorizontal: 15,
    marginBottom: 10,
  },
  searchInput: {
    height: 40,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 16,
  },
  searchResultsText: {
    fontSize: 12,
    marginTop: 4,
    opacity: 0.7,
  },
  filterContainer: {
    marginHorizontal: 15,
    marginBottom: 10,
  },
  filterSegmentedControl: {
    height: 32,
  },
  resultText: {
    flexShrink: 1,
  },
  flex: { flex: 1 },
  bottomView: {
    borderTopRightRadius: 15,
    borderTopLeftRadius: 15,
    elevation: 15,
    shadowColor: 'black',
    shadowOffset: {
      width: 0,
      height: 5,
    },
    shadowRadius: 7,
    shadowOpacity: 0.4,

    paddingHorizontal: 15,
    paddingVertical: 9,
    alignItems: 'center',
    flexDirection: 'row',
  },
})
