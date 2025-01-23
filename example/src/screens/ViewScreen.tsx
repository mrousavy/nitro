import * as React from 'react'

import { StyleSheet, View, Text, Button, Platform } from 'react-native'
import { NitroModules } from 'react-native-nitro-modules'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useColors } from '../useColors'
import { TestView } from 'react-native-nitro-image'

export function ViewScreen() {
  const safeArea = useSafeAreaInsets()
  const colors = useColors()
  const [prop, setProp] = React.useState(false)

  React.useEffect(() => {
    const i = setInterval(() => setProp((p) => !p), 300)
    return () => clearInterval(i)
  }, [])

  return (
    <View style={[styles.container, { paddingTop: safeArea.top }]}>
      <Text style={styles.header}>View</Text>
      <View style={styles.topControls}>
        <View style={styles.flex} />
        <Text style={styles.buildTypeText}>{NitroModules.buildType}</Text>
      </View>

      <View style={styles.resultContainer}>
        <View
          style={[styles.viewContainer, { borderColor: colors.foreground }]}
        >
          <TestView style={styles.view} someProp={prop} />
        </View>
      </View>

      <View style={[styles.bottomView, { backgroundColor: colors.background }]}>
        <Text>Re-render</Text>
        <View style={styles.flex} />
        <Button title="Run" onPress={console.log} />
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
  viewContainer: {
    width: '80%',
    aspectRatio: 1,
    borderWidth: 2,
    borderRadius: 5,
    shadowColor: 'black',
    shadowOffset: { width: 1, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 5,
  },
  view: {
    borderRadius: 5,
    overflow: 'hidden',
    flex: 1,
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
