import * as React from 'react';

import { StyleSheet, View, Text } from 'react-native';
import { createTestHybridObject } from 'react-native-nitro-modules';

const FIBONACCI_N = 5
const FIBONACCI_COUNT = 5

async function runTests() {
  try {
    const testObject = createTestHybridObject()

    console.log('---------- Beginning TestHybridObject Test:')
    console.log('Keys:', Object.keys(testObject))
    // Getters & Setters
    console.log('get int:', testObject.int)
    console.log('set int:', testObject.int = 5)
    console.log('get string:', testObject.string)
    console.log('set string:', testObject.string = "hello world!")
    console.log('get nullable-string:', testObject.nullableString)
    console.log('set nullable-string:', testObject.nullableString = "hello world!")
    // Methods
    console.log('call method:', testObject.multipleArguments(5, false, "hey!"))
    // Functions/Lambdas
    const getter = testObject.getIntGetter()
    console.log('get getter:', getter)
    console.log('call getter:', getter())
    testObject.sayHelloCallback((name: string) => {
      console.log('call with callback:', name)
    })

    // Promises/Threading
    {
      const start = performance.now()
      let sum = 0n
      for (let i = 0; i < FIBONACCI_COUNT; i++) {
        sum += testObject.calculateFibonacci(FIBONACCI_N)
      }
      const end = performance.now()
      console.log(`calculate fibonacci(${FIBONACCI_N}) ${FIBONACCI_COUNT}x sync took ${(end - start).toFixed(2)}ms (result: ${sum})`)
    }
    {
      const start = performance.now()
      const promises: Promise<bigint>[] = []
      for (let i = 0; i < FIBONACCI_COUNT; i++) {
        const promise = testObject.calculateFibonacciAsync(FIBONACCI_N)
        promises.push(promise)
      }
      const all = await Promise.all(promises)
      const sum = all.reduce((prev, curr) => prev + curr, 0n)
      const end = performance.now()
      console.log(`calculate fibonacci(${FIBONACCI_N}) ${FIBONACCI_COUNT}x sync took ${(end - start).toFixed(2)}ms (result: ${sum})`)
    }

    // Create another TestHybridObject
    const newTest = testObject.createNewHybridObject()
    console.log('create new hybrid object:', newTest != testObject)

    console.log('---------- Finished TestHybridObject Test!')
  } catch (e) {
    console.error('---------- Failed TestHybridObject Test!', e)
  }
}

runTests()

export default function App() {


  return (
    <View style={styles.container}>
      <Text>Hello world!</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  box: {
    width: 60,
    height: 60,
    marginVertical: 20,
  },
});
