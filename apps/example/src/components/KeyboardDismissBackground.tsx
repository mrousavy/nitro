import { Keyboard, StyleSheet, View } from 'react-native'

export function KeyboardDismissBackground() {
  return <View style={StyleSheet.absoluteFill} onTouchEnd={Keyboard.dismiss} />
}
