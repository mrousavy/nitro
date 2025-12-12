/* eslint-disable react-native/no-inline-styles */

import * as React from 'react'

import {
  StyleSheet,
  View,
  Text,
  Button,
  Platform,
  Animated,
  useWindowDimensions,
} from 'react-native'
import { NitroModules } from 'react-native-nitro-modules'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useColors } from '../useColors'
import { HybridTestObjectSwiftKotlin } from 'react-native-nitro-test'
import { ExampleTurboModule } from '../turbo-module/ExampleTurboModule'
import type { AnyMap } from 'react-native-nitro-modules'

declare global {
  var gc: () => void
  var performance: {
    now: () => number
  }
}

interface BenchmarksResult {
  numberOfIterations: number
  nitroExecutionTimeMs: number
  turboExecutionTimeMs: number
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

async function waitForGc(): Promise<void> {
  gc()
  await delay(500)
}

interface BenchmarkableObject {
  addNumbers(a: number, b: number): number
}
function benchmark(obj: BenchmarkableObject): number {
  // warmup
  obj.addNumbers(0, 3)

  // run addNumbers(...) ITERATIONS amount of times
  const start = performance.now()
  let num = 0
  for (let i = 0; i < ITERATIONS; i++) {
    num = obj.addNumbers(num, 3)
  }
  const end = performance.now()
  return end - start
}

const ITERATIONS = 100_000

// AnyMap toMap benchmark
interface AnyMapBenchmarkResult {
  mapSize: number
  iterations: number
  totalTimeMs: number
  avgTimePerCallMs: number
}

function createLargeAnyMap(size: number): AnyMap {
  const map: AnyMap = {}
  for (let i = 0; i < size; i++) {
    const key = `key_${i}`
    // Mix different types to simulate realistic data
    if (i % 5 === 0) {
      map[key] = `string_value_${i}`
    } else if (i % 5 === 1) {
      map[key] = i * 1.5
    } else if (i % 5 === 2) {
      map[key] = i % 2 === 0
    } else if (i % 5 === 3) {
      map[key] = { nested: i, value: `nested_${i}` }
    } else {
      map[key] = [i, i + 1, i + 2]
    }
  }
  return map
}

function benchmarkAnyMapToMap(
  mapSize: number,
  iterations: number
): AnyMapBenchmarkResult {
  // Create a map and pass it through the native bridge via copyAnyValues
  // This exercises toMap() on the native side
  const testMap = createLargeAnyMap(mapSize)

  // Warmup
  HybridTestObjectSwiftKotlin.copyAnyValues(testMap)

  // Benchmark
  const start = performance.now()
  for (let i = 0; i < iterations; i++) {
    // copyAnyValues internally calls toMap() then fromMap()
    HybridTestObjectSwiftKotlin.copyAnyValues(testMap)
  }
  const end = performance.now()

  const totalTimeMs = end - start
  return {
    mapSize,
    iterations,
    totalTimeMs,
    avgTimePerCallMs: totalTimeMs / iterations,
  }
}

async function runAnyMapBenchmark(): Promise<AnyMapBenchmarkResult> {
  console.log('Running AnyMap.toMap() benchmark...')

  // Test with different map sizes
  const MAP_SIZE = 1000 // 100 key-value pairs
  const ANYMAP_ITERATIONS = 10000

  await waitForGc()

  const result = benchmarkAnyMapToMap(MAP_SIZE, ANYMAP_ITERATIONS)

  console.log(
    `AnyMap.toMap() benchmark finished!\n` +
      `  Map size: ${result.mapSize} entries\n` +
      `  Iterations: ${result.iterations}\n` +
      `  Total time: ${result.totalTimeMs.toFixed(2)}ms\n` +
      `  Avg per call: ${result.avgTimePerCallMs.toFixed(4)}ms`
  )

  return result
}

async function runBenchmarks(): Promise<BenchmarksResult> {
  console.log(`Running benchmarks ${ITERATIONS}x...`)
  await waitForGc()

  const turboTime = benchmark(ExampleTurboModule)
  const nitroTime = benchmark(HybridTestObjectSwiftKotlin)

  console.log(
    `Benchmarks finished! Nitro: ${nitroTime.toFixed(2)}ms | Turbo: ${turboTime.toFixed(2)}ms`
  )
  return {
    nitroExecutionTimeMs: nitroTime,
    turboExecutionTimeMs: turboTime,
    numberOfIterations: ITERATIONS,
  }
}

export function BenchmarksScreen() {
  const safeArea = useSafeAreaInsets()
  const colors = useColors()
  const dimensions = useWindowDimensions()
  const [status, setStatus] = React.useState('📱 Idle')
  const [results, setResults] = React.useState<BenchmarksResult>()
  const [anyMapResult, setAnyMapResult] =
    React.useState<AnyMapBenchmarkResult>()
  const nitroWidth = React.useRef(new Animated.Value(0)).current
  const turboWidth = React.useRef(new Animated.Value(0)).current

  const factor = React.useMemo(() => {
    if (results == null) return 0
    const f = results.turboExecutionTimeMs / results.nitroExecutionTimeMs
    return Math.round(f * 10) / 10
  }, [results])

  const run = async () => {
    nitroWidth.setValue(0)
    turboWidth.setValue(0)
    setStatus(`⏳ Running Benchmarks`)
    const r = await runBenchmarks()
    setResults(r)

    const slowest = Math.max(r.nitroExecutionTimeMs, r.turboExecutionTimeMs)
    const maxWidth = dimensions.width * 0.65
    Animated.spring(turboWidth, {
      toValue: (r.turboExecutionTimeMs / slowest) * maxWidth,
      friction: 10,
      tension: 40,
      useNativeDriver: false,
    }).start()
    Animated.spring(nitroWidth, {
      toValue: (r.nitroExecutionTimeMs / slowest) * maxWidth,
      friction: 10,
      tension: 40,
      useNativeDriver: false,
    }).start()
    setStatus(`📱 Idle`)
  }

  const runAnyMap = async () => {
    setAnyMapResult(undefined)
    setStatus(`⏳ Running AnyMap.toMap() Benchmark`)
    const r = await runAnyMapBenchmark()
    setAnyMapResult(r)
    setStatus(`📱 Idle`)
  }

  return (
    <View style={[styles.container, { paddingTop: safeArea.top }]}>
      <Text style={styles.header}>Benchmarks</Text>
      <View style={styles.topControls}>
        <View style={styles.flex} />
        <Text style={styles.buildTypeText}>{NitroModules.buildType}</Text>
      </View>

      <View style={styles.resultContainer}>
        {results != null ? (
          <View style={styles.chartsContainer}>
            <Text style={styles.text}>
              Calling <Text style={styles.bold}>addNumbers(...)</Text>{' '}
              <Text style={styles.bold}>{ITERATIONS}</Text>x:
            </Text>
            <View style={styles.largeVSpacer} />

            <View style={styles.turboResults}>
              <Text style={styles.title}>Turbo Modules</Text>
              <View style={styles.smallVSpacer} />
              <Animated.View
                style={[
                  styles.chart,
                  {
                    backgroundColor: colors.card,
                    opacity: 0.4,
                    width: turboWidth,
                  },
                ]}
              />
              <View style={styles.smallVSpacer} />
              <Text style={styles.text}>
                Time:{' '}
                <Text style={styles.bold}>
                  {results.turboExecutionTimeMs.toFixed(2)}ms
                </Text>
              </Text>
            </View>

            <View style={styles.largeVSpacer} />

            <View style={styles.nitroResults}>
              <Text style={styles.title}>Nitro Modules</Text>
              <View style={styles.smallVSpacer} />
              <Animated.View
                style={[
                  styles.chart,
                  {
                    backgroundColor: colors.card,
                    width: nitroWidth,
                  },
                ]}
              />
              <View style={styles.smallVSpacer} />
              <Text style={styles.text}>
                Time:{' '}
                <Text style={styles.bold}>
                  {results.nitroExecutionTimeMs.toFixed(2)}ms
                </Text>
                {'      '}(<Text style={styles.bold}>{factor}x</Text>{' '}
                {factor > 1 ? 'faster' : 'slower'}!)
              </Text>
            </View>
          </View>
        ) : (
          <Text numberOfLines={5} style={styles.text}>
            Press <Text style={styles.bold}>Run</Text> to call{' '}
            <Text style={styles.bold}>addNumbers(...)</Text> {ITERATIONS} times.
          </Text>
        )}
      </View>

      <View style={[styles.bottomView, { backgroundColor: colors.background }]}>
        <Text style={styles.resultText} numberOfLines={2}>
          {status}
        </Text>
        <View style={styles.flex} />
        <Button title="Run" onPress={run} />
        <View style={{ width: 10 }} />
        <Button title="AnyMap" onPress={runAnyMap} />
      </View>

      {anyMapResult != null && (
        <View
          style={[styles.anyMapResultBox, { backgroundColor: colors.card }]}
        >
          <Text style={styles.anyMapTitle}>AnyMap.toMap() Benchmark</Text>
          <Text style={styles.anyMapText}>
            Map size: <Text style={styles.bold}>{anyMapResult.mapSize}</Text>{' '}
            entries
          </Text>
          <Text style={styles.anyMapText}>
            Iterations:{' '}
            <Text style={styles.bold}>{anyMapResult.iterations}</Text>
          </Text>
          <Text style={styles.anyMapText}>
            Total time:{' '}
            <Text style={styles.bold}>
              {anyMapResult.totalTimeMs.toFixed(2)}ms
            </Text>
          </Text>
          <Text style={styles.anyMapText}>
            Avg per call:{' '}
            <Text style={styles.bold}>
              {anyMapResult.avgTimePerCallMs.toFixed(4)}ms
            </Text>
          </Text>
        </View>
      )}
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
  scrollContent: {},
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
    paddingHorizontal: 15,
    borderBottomWidth: StyleSheet.hairlineWidth,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  testBox: {
    flexShrink: 1,
    flexDirection: 'column',
  },
  resultText: {
    flexShrink: 1,
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
  largeVSpacer: {
    height: 25,
  },
  resultContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 45,
    marginHorizontal: 30,
  },
  chartsContainer: {
    alignItems: 'stretch',
  },
  nitroResults: {},
  turboResults: {},
  title: {
    fontWeight: 'bold',
    fontSize: 25,
  },
  chart: {
    height: 20,
    borderRadius: 5,
  },
  text: {
    fontSize: 16,
  },
  bold: {
    fontWeight: 'bold',
  },
  flex: { flex: 1 },
  anyMapResultBox: {
    position: 'absolute',
    top: 100,
    left: 20,
    right: 20,
    padding: 15,
    borderRadius: 10,
  },
  anyMapTitle: {
    fontWeight: 'bold',
    fontSize: 18,
    marginBottom: 10,
  },
  anyMapText: {
    fontSize: 14,
    marginVertical: 2,
  },
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
