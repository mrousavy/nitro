import * as React from 'react'

import {
  StyleSheet,
  View,
  Text,
  Button,
  Platform,
  TextInput,
  KeyboardAvoidingView,
} from 'react-native'
import { NitroModules } from 'react-native-nitro-modules'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useColors } from '../useColors'
import { stringify } from '../utils'
import { KeyboardDismissBackground } from '../components/KeyboardDismissBackground'

const VIEWS_X = 15
const VIEWS_Y = 15

const PRE_CODE = `
const NitroModules = globalThis.NitroModulesProxy;
`.trim()
const DEFAULT_CODE = `
const testObject = NitroModules.createHybridObject('TestObjectCpp')

const start = performance.now()

for (let i = 0; i < 100_000; i++) {
    testObject.bounceCar({
    year: 2006,
    make: 'Mitsubishi',
    model: 'Evolution IX',
    power: 280,
    powertrain: 'gas',
    driver: {
      age: 24,
      name: 'Marc'
    },
    passengers: [
      { age: 18, name: 'Lukas' },
      { age: 23, name: 'Simon' },
    ],
    isFast: true,
    favouriteTrack: 'the road',
    performanceScores: [2, 5],
    someVariant: 'hello!',
  })
}

const end = performance.now()
const time = \`\${(end - start).toFixed(2)}ms\`

time
`.trim()

export function EvalScreen() {
  const safeArea = useSafeAreaInsets()
  const colors = useColors()
  const [result, setResult] = React.useState<any>()
  const [code, setCode] = React.useState(DEFAULT_CODE)

  const run = () => {
    try {
      console.log(`Running code: ${code}`)
      // eslint-disable-next-line no-eval
      const r = eval(PRE_CODE + '\n' + code)
      console.log(`Result:`, r)
      setResult(r)
    } catch (error) {
      console.log(`Error:`, error)
      setResult(error)
    }
  }

  return (
    <View style={[styles.container, { paddingTop: safeArea.top }]}>
      <KeyboardDismissBackground />

      <Text style={styles.header}>Eval</Text>
      <View style={styles.topControls}>
        <View style={styles.flex} />
        <Text style={styles.buildTypeText}>{NitroModules.buildType}</Text>
      </View>

      <KeyboardAvoidingView style={styles.container} behavior="padding">
        <View style={styles.codeContent}>
          <TextInput
            onChangeText={setCode}
            defaultValue={DEFAULT_CODE}
            multiline={true}
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="ascii-capable"
            textAlignVertical="top"
            style={[
              styles.textInput,
              styles.monospace,
              { backgroundColor: colors.foreground },
            ]}
          />
        </View>

        <View
          style={[styles.bottomView, { backgroundColor: colors.background }]}
        >
          <Text style={styles.resultText} numberOfLines={2}>
            Result: <Text style={styles.monospace}>{stringify(result)}</Text>
          </Text>
          <View style={styles.flex} />
          <Button title={'Run'} onPress={run} />
        </View>
      </KeyboardAvoidingView>
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
  textInput: {
    flex: 1,
    marginHorizontal: 15,
    marginVertical: 25,
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 10,
    color: 'white',
  },
  monospace: {
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  container: {
    flex: 1,
  },
  codeContent: { flexGrow: 1 },
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
  viewShadow: {
    width: '80%',
    aspectRatio: 1,
    shadowColor: 'black',
    shadowOffset: { width: 1, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 5,
    elevation: 4,
  },
  viewBorder: {
    flex: 1,
    borderWidth: 2,
    borderRadius: 5,
  },
  viewContainer: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  resultText: {
    flexShrink: 1,
  },
  view: {
    width: `${100 / VIEWS_X}%`,
    height: `${100 / VIEWS_Y}%`,
    marginLeft: -0.0001,
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
