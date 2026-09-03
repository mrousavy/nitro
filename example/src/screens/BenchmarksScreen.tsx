import * as React from 'react'
import {
  Button,
  FlatList,
  Platform,
  StyleSheet,
  Text,
  View,
} from 'react-native'
import { NitroModules } from 'react-native-nitro-modules'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import {
  createBenchmarkSuite,
  runBenchmarkDefinitions,
  type BenchmarkMetric,
} from '../benchmarks'
import { useColors } from '../useColors'

export function BenchmarksScreen() {
  const safeArea = useSafeAreaInsets()
  const colors = useColors()
  const [running, setRunning] = React.useState(false)
  const [error, setError] = React.useState<string>()
  const [metrics, setMetrics] = React.useState<BenchmarkMetric[]>([])

  const run = async () => {
    setRunning(true)
    setError(undefined)
    try {
      const result = await runBenchmarkDefinitions(createBenchmarkSuite(), {
        targetBatchDurationMs: 30,
        warmupCount: 1,
        sampleCount: 3,
        reverse: false,
      })
      setMetrics(result)
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : String(cause))
    } finally {
      setRunning(false)
    }
  }

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: colors.background, paddingTop: safeArea.top },
      ]}
    >
      <View style={styles.header}>
        <View style={styles.flex}>
          <Text style={[styles.title, { color: colors.text }]}>Benchmarks</Text>
          <Text style={[styles.subtitle, { color: colors.text }]}>
            Quick local sample · CI uses Release, warmups, and 20 samples
          </Text>
        </View>
        <Text style={[styles.buildType, { color: colors.text }]}>
          {NitroModules.buildType}
        </Text>
      </View>

      {error != null && <Text style={styles.error}>{error}</Text>}
      <FlatList
        data={metrics}
        keyExtractor={(metric) => metric.id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <Text style={[styles.empty, { color: colors.text }]}>
            Run the suite to compare the real JavaScript, TurboModule, C++, and
            Swift/Kotlin bindings in this app.
          </Text>
        }
        renderItem={({ item }) => (
          <View style={[styles.row, { borderBottomColor: colors.card }]}>
            <Text style={[styles.metricName, { color: colors.text }]}>
              {item.id}
            </Text>
            <Text style={[styles.metricValue, { color: colors.text }]}>
              {item.medianNsPerOp.toFixed(1)} ns/op
            </Text>
          </View>
        )}
      />

      <View style={[styles.footer, { paddingBottom: safeArea.bottom + 12 }]}>
        <Text style={[styles.status, { color: colors.text }]}>
          {running ? 'Running…' : `${metrics.length} results`}
        </Text>
        <Button title="Run" disabled={running} onPress={run} />
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  flex: { flex: 1 },
  title: { fontSize: 26, fontWeight: '700' },
  subtitle: { fontSize: 12, marginTop: 4, opacity: 0.65 },
  buildType: {
    fontFamily: Platform.select({
      android: 'monospace',
      ios: 'Menlo',
      macos: 'Menlo',
    }),
    fontWeight: '700',
    marginLeft: 12,
  },
  list: { paddingHorizontal: 16, paddingBottom: 80 },
  empty: { fontSize: 16, lineHeight: 24, marginTop: 48, opacity: 0.75 },
  row: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    paddingVertical: 12,
  },
  metricName: { fontSize: 13 },
  metricValue: { fontSize: 15, fontWeight: '700', marginTop: 4 },
  error: { color: '#dc2626', paddingHorizontal: 16, paddingVertical: 8 },
  footer: {
    alignItems: 'center',
    bottom: 0,
    flexDirection: 'row',
    left: 0,
    paddingHorizontal: 16,
    paddingTop: 12,
    position: 'absolute',
    right: 0,
  },
  status: { flex: 1 },
})
