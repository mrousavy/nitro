/* eslint-disable react-native/no-inline-styles */
/* eslint-disable no-lone-blocks */
import * as React from 'react'

import {
  StyleSheet,
  View,
  Text,
  Button,
  Platform,
  InteractionManager,
  Animated,
  useWindowDimensions,
} from 'react-native'
import { NitroModules } from 'react-native-nitro-modules'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useColors } from '../useColors'
import { HybridTestObjectCpp } from 'react-native-nitro-image'
import { ExampleTurboModule } from '../turbo-module/ExampleTurboModule'

declare global {
  var performance: {
    now: () => number
  }
}

interface BenchmarksResult {
  numberOfIterations: number
  nitroExecutionTimeMs: number
  turboExecutionTimeMs: number
  nitroResult: number
  turboResult: number
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

async function waitForGc(): Promise<void> {
  await delay(500)
  return new Promise((resolve) => {
    requestAnimationFrame(() => {
      InteractionManager.runAfterInteractions(() => {
        resolve()
      })
    })
  })
}

const ITERATIONS = 100_000
async function runBenchmarks(): Promise<BenchmarksResult> {
  console.log(`Running benchmarks ${ITERATIONS}x...`)

  await waitForGc()
  let nitroResult = 0,
    nitroStart = 0,
    nitroEnd = 0
  {
    nitroStart = performance.now()
    for (let i = 0; i < ITERATIONS; i++) {
      nitroResult = HybridTestObjectCpp.addNumbers(3, 5)
    }
    nitroEnd = performance.now()
  }

  await waitForGc()
  let turboResult = 0,
    turboStart = 0,
    turboEnd = 0
  {
    turboStart = performance.now()
    for (let i = 0; i < ITERATIONS; i++) {
      turboResult = ExampleTurboModule.addNumbers(3, 5)
    }
    turboEnd = performance.now()
  }

  console.log(
    `Benchmarks finished! Nitro: ${(nitroEnd - nitroStart).toFixed(2)}ms | Turbo: ${(turboEnd - turboStart).toFixed(2)}ms`
  )
  return {
    nitroExecutionTimeMs: nitroEnd - nitroStart,
    turboExecutionTimeMs: turboEnd - turboStart,
    numberOfIterations: ITERATIONS,
    turboResult: turboResult,
    nitroResult: nitroResult,
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

  const run = async () => {
    nitroWidth.setValue(0)
    turboWidth.setValue(0)
    setStatus(`⏳ Running Benchmarks`)
    const r = await runBenchmarks()
    setResults(r)

    const maxWidth = dimensions.width * 0.7
    const smallerScale =
      Math.min(r.nitroExecutionTimeMs, r.turboExecutionTimeMs) /
      Math.max(r.nitroExecutionTimeMs, r.turboExecutionTimeMs)
    Animated.spring(nitroWidth, {
      toValue: maxWidth,
      friction: 10,
      tension: 40,
      useNativeDriver: false,
    }).start()
    Animated.spring(turboWidth, {
      toValue: smallerScale * maxWidth,
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
                {'      '}(
                <Text style={styles.bold}>
                  {Math.round(
                    (results.turboExecutionTimeMs /
                      results.nitroExecutionTimeMs) *
                      10
                  ) / 10}
                  x
                </Text>{' '}
                faster!)
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
        <Text>{status}</Text>
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
  },
  chartsContainer: {
    alignItems: 'stretch',
    width: '70%',
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
  bottomView: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    borderTopRightRadius: 15,
    borderTopLeftRadius: 15,
    elevation: 3,
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
