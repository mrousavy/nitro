import { StyleSheet, Text } from 'react-native'
import { callback } from 'react-native-nitro-modules'
import { ViewWithChildren } from 'react-native-nitro-test'
import { useColors } from '../useColors'

export const NitroInfoCard = () => {
  const colors = useColors()
  return (
    <ViewWithChildren
      style={[styles.viewWithChildren, { backgroundColor: colors.background }]}
      hybridRef={callback((ref) => {
        console.log(`NitroInfoCardRef initialized!`)
        ref.someMethod()
      })}
      someCallback={callback(() =>
        console.log(`NitroInfoCard Callback called!`)
      )}
      colorScheme="dark"
      onTouchEnd={() => {
        console.log(`Touched NitroInfoCard!`)
      }}
    >
      <Text style={[styles.viewWithChildrenText, { color: colors.foreground }]}>
        What is Nitro?
      </Text>
      <Text
        style={[styles.viewWithChildrenSubtext, { color: colors.foreground }]}
      >
        Nitro is a framework for building powerful and fast native modules for
        JS. Put simply, a JS object can be implemented in C++, Swift or Kotlin
        instead of JS by using Nitro.
      </Text>
    </ViewWithChildren>
  )
}

const styles = StyleSheet.create({
  viewWithChildren: {
    margin: 15,
    shadowColor: 'black',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 15,
    borderRadius: 5,
  },
  viewWithChildrenText: {
    fontSize: 18,
    fontWeight: 'bold',
    alignSelf: 'flex-start',
  },
  viewWithChildrenSubtext: {
    fontSize: 14,
    alignSelf: 'flex-start',
    marginTop: 10,
  },
})
