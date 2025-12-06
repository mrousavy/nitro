/* eslint-disable react-native/no-inline-styles */

import * as React from 'react'

import {
  StyleSheet,
  View,
  Text,
  Button,
  Platform,
  ScrollView,
  ActivityIndicator,
} from 'react-native'
import { NitroModules } from 'react-native-nitro-modules'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useColors } from '../useColors'
import {
  HybridAnyMapBenchmark,
  type BenchmarkResult,
} from 'react-native-nitro-test/src'

interface ResultRowProps {
  result: BenchmarkResult
  isNew: boolean
}

function ResultRow({ result, isNew }: ResultRowProps) {
  const colors = useColors()

  return (
    <View
      style={[
        styles.resultRow,
        { backgroundColor: isNew ? colors.activeSegment + '20' : colors.card + '40' },
      ]}
    >
      <Text style={[styles.resultName, { color: colors.text }]}>
        {result.operationName}
      </Text>
      <View style={styles.resultStats}>
        <Text style={[styles.resultValue, { color: colors.text }]}>
          Avg: <Text style={styles.bold}>{result.averageTimeMs.toFixed(3)}ms</Text>
        </Text>
        <Text style={[styles.resultValue, { color: colors.text }]}>
          Total: <Text style={styles.bold}>{result.totalTimeMs.toFixed(2)}ms</Text>
        </Text>
        <Text style={[styles.resultValue, { color: colors.text }]}>
          Ops/s: <Text style={styles.bold}>{result.opsPerSecond.toFixed(0)}</Text>
        </Text>
      </View>
    </View>
  )
}

interface ComparisonRowProps {
  oldResult: BenchmarkResult
  newResult: BenchmarkResult
  label: string
}

function ComparisonRow({ oldResult, newResult, label }: ComparisonRowProps) {
  const colors = useColors()
  const speedup = oldResult.averageTimeMs / newResult.averageTimeMs
  const isImproved = speedup > 1

  return (
    <View style={[styles.comparisonRow, { borderColor: colors.border }]}>
      <Text style={[styles.comparisonLabel, { color: colors.text }]}>
        {label}
      </Text>
      <View style={styles.comparisonStats}>
        <Text style={[styles.comparisonValue, { color: colors.text }]}>
          OLD: {oldResult.averageTimeMs.toFixed(3)}ms
        </Text>
        <Text style={[styles.comparisonValue, { color: colors.text }]}>
          NEW: {newResult.averageTimeMs.toFixed(3)}ms
        </Text>
        <Text
          style={[
            styles.speedupText,
            { color: isImproved ? '#22c55e' : '#ef4444' },
          ]}
        >
          {isImproved ? '⚡' : '⚠️'} {speedup.toFixed(2)}x{' '}
          {isImproved ? 'faster' : 'slower'}
        </Text>
      </View>
    </View>
  )
}

export function AnyMapBenchmarkScreen() {
  const safeArea = useSafeAreaInsets()
  const colors = useColors()
  const [status, setStatus] = React.useState('📱 Ready')
  const [isRunning, setIsRunning] = React.useState(false)
  const [results, setResults] = React.useState<BenchmarkResult[]>([])
  const [entryCount, setEntryCount] = React.useState(100)
  const [iterations, setIterations] = React.useState(1000)

  const runBenchmark = async () => {
    setIsRunning(true)
    setStatus('⏳ Running benchmarks...')
    setResults([])

    try {
      // Wait a bit for UI to update
      await new Promise<void>((resolve) => setTimeout(() => resolve(), 100))

      const benchmarkResults = HybridAnyMapBenchmark.runAllBenchmarks(
        entryCount,
        iterations
      )

      setResults(benchmarkResults)
      setStatus('✅ Benchmarks completed!')
    } catch (error) {
      console.error('Benchmark error:', error)
      setStatus(`❌ Error: ${error}`)
    } finally {
      setIsRunning(false)
    }
  }

  // Pair up old and new results for comparison
  const comparisons = React.useMemo(() => {
    if (results.length < 6) return []

    return [
      {
        label: 'toMap() vs toMapFast()',
        old: results[0]!,
        new: results[1]!,
      },
      {
        label: 'Individual Access',
        old: results[2]!,
        new: results[3]!,
      },
      {
        label: 'Iteration',
        old: results[4]!,
        new: results[5]!,
      },
    ]
  }, [results])

  return (
    <View style={[styles.container, { paddingTop: safeArea.top }]}>
      <Text style={[styles.header, { color: colors.text }]}>
        AnyMap Benchmark
      </Text>
      <View style={styles.topControls}>
        <Text style={[styles.configText, { color: colors.text }]}>
          Entries: <Text style={styles.bold}>{entryCount}</Text> | Iterations:{' '}
          <Text style={styles.bold}>{iterations}</Text>
        </Text>
        <View style={styles.flex} />
        <Text style={[styles.buildTypeText, { color: colors.text }]}>
          {NitroModules.buildType}
        </Text>
      </View>

      <View style={styles.configButtons}>
        <Button title="50 entries" onPress={() => setEntryCount(50)} />
        <Button title="100 entries" onPress={() => setEntryCount(100)} />
        <Button title="500 entries" onPress={() => setEntryCount(500)} />
      </View>
      <View style={styles.configButtons}>
        <Button title="100 iters" onPress={() => setIterations(100)} />
        <Button title="1K iters" onPress={() => setIterations(1000)} />
        <Button title="10K iters" onPress={() => setIterations(10000)} />
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {isRunning && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.activeSegment} />
            <Text style={[styles.loadingText, { color: colors.text }]}>
              Running benchmarks...
            </Text>
          </View>
        )}

        {comparisons.length > 0 && (
          <View style={styles.summaryContainer}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              📊 Performance Comparison
            </Text>
            {comparisons.map((comp, index) => (
              <ComparisonRow
                key={index}
                label={comp.label}
                oldResult={comp.old}
                newResult={comp.new}
              />
            ))}
          </View>
        )}

        {results.length > 0 && (
          <View style={styles.detailsContainer}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              📋 Detailed Results
            </Text>
            {results.map((result, index) => (
              <ResultRow
                key={index}
                result={result}
                isNew={index % 2 === 1}
              />
            ))}
          </View>
        )}
      </ScrollView>

      <View style={[styles.bottomView, { backgroundColor: colors.background }]}>
        <Text style={[styles.statusText, { color: colors.text }]} numberOfLines={2}>
          {status}
        </Text>
        <View style={styles.flex} />
        <Button title="Run Benchmark" onPress={runBenchmark} disabled={isRunning} />
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
  topControls: {
    marginHorizontal: 15,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  configText: {
    fontSize: 14,
  },
  buildTypeText: {
    fontFamily: Platform.select({
      ios: 'Menlo',
      macos: 'Menlo',
      android: 'monospace',
    }),
    fontWeight: 'bold',
  },
  configButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginHorizontal: 15,
    marginBottom: 5,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 15,
    paddingBottom: 20,
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    marginTop: 15,
    fontSize: 16,
  },
  summaryContainer: {
    marginBottom: 20,
  },
  detailsContainer: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  resultRow: {
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  resultName: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 6,
  },
  resultStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  resultValue: {
    fontSize: 12,
  },
  bold: {
    fontWeight: 'bold',
  },
  comparisonRow: {
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 10,
  },
  comparisonLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  comparisonStats: {
    gap: 4,
  },
  comparisonValue: {
    fontSize: 14,
  },
  speedupText: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 4,
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
  statusText: {
    flexShrink: 1,
  },
})

