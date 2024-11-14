/* eslint-disable react/no-unstable-nested-components */
import * as React from 'react'
import { HybridObjectTestsScreen } from './screens/HybridObjectTestsScreen'
import { NavigationContainer } from '@react-navigation/native'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import { useColors } from './useColors'
import { Image } from 'react-native'
import { BenchmarksScreen } from './screens/BenchmarksScreen'

const dna = require('./img/dna.png')
const rocket = require('./img/rocket.png')

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
            tabBarIcon: ({ size, focused }) => (
              <Image
                source={dna}
                tintColor={focused ? undefined : 'grey'}
                style={{ width: size * 1.2, height: size * 1.2 }}
              />
            ),
          }}
        />
        <Tabs.Screen
          name="Benchmarks"
          component={BenchmarksScreen}
          options={{
            tabBarLabel: 'Benchmarks',
            tabBarIcon: ({ size, focused }) => (
              <Image
                source={rocket}
                tintColor={focused ? undefined : 'grey'}
                style={{ width: size * 1.4, height: size * 1.4 }}
              />
            ),
          }}
        />
      </Tabs.Navigator>
    </NavigationContainer>
  )
}
