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

declare global {
  var gc: () => void
  var performance: {
    now: () => number
  }
}

interface BenchmarksResult {
  numberOfIterations: number
  cppStlExecutionTimeMs: number
  swiftExecutionTimeMs: number
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

async function waitForGc(): Promise<void> {
  gc()
  await delay(500)
}

function benchmarkSTL(obj: { stringValue: string }): number {
  // warmup
  obj.stringValue
  obj.stringValue = ''
  obj.stringValue

  // run addNumbers(...) ITERATIONS amount of times
  const start = performance.now()
  const str = 'Hello!'
  for (let i = 0; i < ITERATIONS; i++) {
    // get + concat + set
    obj.stringValue = str
  }
  const end = performance.now()
  console.log('C++:', obj.stringValue.length)
  console.log('C++:', obj.stringValue.substring(0, 100))
  return end - start
}
function benchmarkSwift(obj: { stringValueSwift: string }): number {
  // warmup
  obj.stringValueSwift
  obj.stringValueSwift = ''
  obj.stringValueSwift

  // run addNumbers(...) ITERATIONS amount of times
  const start = performance.now()
  const str = 'Hello!'
  for (let i = 0; i < ITERATIONS; i++) {
    // get + concat + set
    obj.stringValueSwift = str
  }
  const end = performance.now()
  console.log('Swift:', obj.stringValueSwift.length)
  console.log('Swift:', obj.stringValueSwift.substring(0, 100))
  return end - start
}

const ITERATIONS = 1_000_000
async function runBenchmarks(): Promise<BenchmarksResult> {
  console.log(`Running benchmarks ${ITERATIONS}x...`)
  await waitForGc()

  const cppTime = benchmarkSTL(HybridTestObjectSwiftKotlin)
  const swiftTime = benchmarkSwift(HybridTestObjectSwiftKotlin)

  console.log(
    `Benchmarks finished! std::string: ${cppTime.toFixed(2)}ms | swift::String: ${swiftTime.toFixed(2)}ms`
  )
  return {
    cppStlExecutionTimeMs: cppTime,
    swiftExecutionTimeMs: swiftTime,
    numberOfIterations: ITERATIONS,
  }
}

export function BenchmarksScreen() {
  const safeArea = useSafeAreaInsets()
  const colors = useColors()
  const dimensions = useWindowDimensions()
  const [status, setStatus] = React.useState('📱 Idle')
  const [results, setResults] = React.useState<BenchmarksResult>()
  const nitroWidth = React.useRef(new Animated.Value(0)).current
  const turboWidth = React.useRef(new Animated.Value(0)).current

  const factor = React.useMemo(() => {
    if (results == null) return 0
    const f = results.cppStlExecutionTimeMs / results.swiftExecutionTimeMs
    return Math.round(f * 10) / 10
  }, [results])

  const run = async () => {
    nitroWidth.setValue(0)
    turboWidth.setValue(0)
    setStatus(`⏳ Running Benchmarks`)
    const r = await runBenchmarks()
    setResults(r)

    const slowest = Math.max(r.swiftExecutionTimeMs, r.cppStlExecutionTimeMs)
    const maxWidth = dimensions.width * 0.65
    Animated.spring(turboWidth, {
      toValue: (r.cppStlExecutionTimeMs / slowest) * maxWidth,
      friction: 10,
      tension: 40,
      useNativeDriver: false,
    }).start()
    Animated.spring(nitroWidth, {
      toValue: (r.swiftExecutionTimeMs / slowest) * maxWidth,
      friction: 10,
      tension: 40,
      useNativeDriver: false,
    }).start()
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
              Calling <Text style={styles.bold}>setString(...)</Text>{' '}
              <Text style={styles.bold}>{ITERATIONS}</Text>x:
            </Text>
            <View style={styles.largeVSpacer} />

            <View style={styles.turboResults}>
              <Text style={styles.title}>C++ std::string</Text>
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
                  {results.cppStlExecutionTimeMs.toFixed(2)}ms
                </Text>
              </Text>
            </View>

            <View style={styles.largeVSpacer} />

            <View style={styles.nitroResults}>
              <Text style={styles.title}>swift::String</Text>
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
                  {results.swiftExecutionTimeMs.toFixed(2)}ms
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
    fontFamily: Platform.select({
      ios: 'Menlo',
      macos: 'Menlo',
      android: 'monospace',
    }),
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
