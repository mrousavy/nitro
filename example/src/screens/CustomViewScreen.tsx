import React from 'react'
import { Button, View } from 'react-native'
import { CustomView } from '../components/CustomView'
import { HybridTestObjectCpp } from 'react-native-nitro-image'

export function CustomViewScreen() {
  const [state, setState] = React.useState(0)

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
        nativeProp={HybridTestObjectCpp}
        style={{
          width: 200,
          height: 200,
          backgroundColor: 'red',
        }}
      />
      <Button title="Increment" onPress={() => setState(state + 1)} />
    </View>
  )
}
