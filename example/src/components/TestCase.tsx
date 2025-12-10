import { Button, StyleSheet, Text, View } from 'react-native'
import { TestRunner } from '../getTests'
import { useColors } from '../useColors'

export interface TestState {
  runner: TestRunner
  state: '📱 Click to run' | '⏳ Running' | '❌ Failed' | '✅ Passed'
  extraMessage: string
}

interface TestCaseProps {
  test: TestState
  onRunPressed: () => void
  isOdd: boolean
}

export function TestCase({
  test,
  onRunPressed,
  isOdd,
}: TestCaseProps): React.ReactElement {
  const colors = useColors()
  return (
    <View
      style={[
        styles.testCase,
        { backgroundColor: isOdd ? colors.oddBackground : colors.background },
      ]}
    >
      <View style={styles.testBox}>
        <Text style={[styles.testName, { color: colors.text }]}>{test.runner.name}</Text>
        <View style={styles.smallVSpacer} />
        <Text style={[styles.testStatus, { color: colors.textSecondary }]} numberOfLines={6}>
          {test.state} ({test.extraMessage})
        </Text>
      </View>
      <View style={styles.flex} />
      <Button title="Run" onPress={onRunPressed} />
    </View>
  )
}

const styles = StyleSheet.create({
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
  flex: { flex: 1 },
})
