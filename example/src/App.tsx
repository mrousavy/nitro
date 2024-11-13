import * as React from 'react'
import { HybridObjectTestsScreen } from './screens/HybridObjectTestsScreen'
import { NavigationContainer } from '@react-navigation/native'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import { useColors } from './useColors'
import { View } from 'react-native'

const Tabs = createBottomTabNavigator()

export default function App() {
  const colors = useColors()
  return (
    <NavigationContainer>
      <Tabs.Navigator
        screenOptions={{
          headerShown: false,
          sceneStyle: { backgroundColor: colors.background },
          tabBarStyle: { backgroundColor: colors.background },
        }}
      >
        <Tabs.Screen
          name="Tests"
          component={HybridObjectTestsScreen}
          options={{
            tabBarLabel: 'Tests',
            tabBarIcon: ({}) => (
              <View style={{ width: 40, height: 40, backgroundColor: 'red' }} />
            ),
          }}
        />
      </Tabs.Navigator>
    </NavigationContainer>
  )
}
