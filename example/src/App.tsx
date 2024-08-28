import * as React from 'react'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import { HybridObjectTestsScreen } from './screens/HybridObjectTestsScreen'

const thisshouldbreak = true

export default function App() {
  return (
    <SafeAreaProvider>
      <HybridObjectTestsScreen />
    </SafeAreaProvider>
  )
}
