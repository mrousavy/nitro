import React from 'react'
import { Button, View } from 'react-native'
import { CustomView } from '../components/CustomView'
import { type TestObjectSwiftKotlin } from 'react-native-nitro-image'
import { NitroModules } from 'react-native-nitro-modules'

function makeObject() {
  const obj = NitroModules.createHybridObject<TestObjectSwiftKotlin>(
    'TestObjectSwiftKotlin'
  )
  obj.bigintValue = BigInt(Math.random() * 1000000000000000000 + '')
  console.log('makeObject', obj)
  return obj
}

export function CustomViewScreen() {
  const [state, setState] = React.useState(makeObject)

  return (
    <View
      style={{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'lightblue',
      }}
    >
      <CustomView
        nativeProp={state}
        style={{
          width: 200,
          height: 200,
          backgroundColor: 'red',
        }}
      />
      <Button title="Increment" onPress={() => setState(makeObject())} />
    </View>
  )
}
