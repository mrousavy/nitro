import { createCppTestHybridObject, createSwiftTestHybridObject, TestHybridObject } from 'react-native-nitro-modules';

const FIBONACCI_N = 33
const FIBONACCI_COUNT = 5

async function runHybridObjectTests(testObject: TestHybridObject): Promise<void> {
  try {
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
      console.log(`calculate fibonacci(${FIBONACCI_N}) ${FIBONACCI_COUNT}x sync/serially took ${(end - start).toFixed(2)}ms (result: ${sum})`)
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
      console.log(`calculate fibonacci(${FIBONACCI_N}) ${FIBONACCI_COUNT}x async/parallel took ${(end - start).toFixed(2)}ms (result: ${sum})`)
    }
    {
      const start = performance.now()
      for (let i = 0; i < 100; i++) {
        testObject.syncVoidFunc()
      }
      const end = performance.now()
      console.log(`Calling sync func 100 times took ${(end - start).toFixed(2)}ms`)
    }
    {
      const start = performance.now()
      for (let i = 0; i < 100; i++) {
        await testObject.asyncVoidFunc()
      }
      const end = performance.now()
      console.log(`Calling async func 100 times took ${(end - start).toFixed(2)}ms`)
    }

    // Create another TestHybridObject
    const newTest = testObject.createNewHybridObject()
    console.log('create new hybrid object:', newTest != testObject)

    // Error throwing
    try {
      testObject.throwError()
      console.error(`throw error didn't throw!!`)
    } catch (e: any) {
      console.log(`throw error: ${e.message}`)
    }

    console.log('---------- Finished TestHybridObject Test!')
  } catch (e) {
    console.error('---------- Failed TestHybridObject Test!', e)
  }
}

// Tests the C++ object
export async function runCppHybridObjectTests(): Promise<void> {
  try {
    const cppTestObject = createCppTestHybridObject()
    await runHybridObjectTests(cppTestObject)
  } catch (e) {
    console.error(`Failed to create C++ TestHybridObject!`, e)
  }
}

// Tests the Swift object
export async function runSwiftHybridObjectTests(): Promise<void> {
  try {
    const swiftTestObject = createSwiftTestHybridObject()
    await runHybridObjectTests(swiftTestObject)
  } catch (e) {
    console.error(`Failed to create Swift TestHybridObject!`, e)
  }
}

