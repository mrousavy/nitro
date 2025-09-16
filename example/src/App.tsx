/* eslint-disable react/no-unstable-nested-components */
import * as React from 'react'
import { HybridObjectTestsScreen } from './screens/HybridObjectTestsScreen'
import { NavigationContainer } from '@react-navigation/native'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import { useColors } from './useColors'
import { Image, Text, View } from 'react-native'
import { BenchmarksScreen } from './screens/BenchmarksScreen'
import { ViewScreen } from './screens/ViewScreen'
import { EvalScreen } from './screens/EvalScreen'

import { LogBox } from 'react-native'

LogBox.ignoreAllLogs()

const dna = require('./img/dna.png')
const rocket = require('./img/rocket.png')
const map = require('./img/map.png')
const terminal = require('./img/terminal.webp')

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
              <View testID="tests-screen-icon">
                <Image
                testID="tests-screen-icon"
                source={dna}
                tintColor={focused ? undefined : 'grey'}
                style={{ width: size * 1.2, height: size * 1.2 }}
              />
              </View>
            ),
          }}
        />
        <Tabs.Screen
          name="Benchmarks"
          component={BenchmarksScreen}

          options={{
            tabBarLabel: 'Benchmarks',
            tabBarIcon: ({ size, focused }) => (
              <View testID="benchmarks-screen-icon">
              <Image
                source={rocket}
                tintColor={focused ? undefined : 'grey'}
                style={{ width: size * 1.4, height: size * 1.4 }}
              />
              </View>
            ),
          }}
        />
        <Tabs.Screen
          name="View"
          component={ViewScreen}
          options={{
            tabBarLabel: 'View',
            tabBarIcon: ({ size, focused }) => (
              <View testID="view-screen-icon">
                <Image
                testID="view-screen-icon"
                source={map}
                tintColor={focused ? undefined : 'grey'}
                style={{ width: size, height: size }}
              />
              </View>
              
            ),
          }}
        />
        <Tabs.Screen
          name="Eval"
          component={EvalScreen}
          options={{
            tabBarLabel: 'Eval',
            tabBarIcon: ({ size, focused }) => (
              <View testID="eval-screen-icon">
                <Image
                  source={terminal}
                  
                  tintColor={focused ? undefined : 'grey'}
                  style={{ width: size, height: size }}
                />
              
              </View>
              
            ),
          }}
        />
      </Tabs.Navigator>
    </NavigationContainer>
  )
}
