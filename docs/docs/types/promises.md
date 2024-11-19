---
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Promises (`Promise<T>`)

A function can be made asynchronous by returning a `Promise` to JS.
This allows your native code to perform heavy-, long-running tasks in parallel, while the JS thread can continue rendering and performing other business logic.

<Tabs>
  <TabItem value="ts" label="TypeScript" default>
    In TypeScript, a `Promise<T>` is represented using the built-in `Promise<T>` type, which can be awaited:

    ```ts
    interface Math extends HybridObject {
      fibonacci(n: number): Promise<number>
    }

    const math = // ...
    await math.fibonacci(13)
    ```
  </TabItem>
  <TabItem value="cpp" label="C++">
    In C++, a `Promise<T>` can be created via Nitro's [`Promise<T>`](https://github.com/mrousavy/nitro/blob/main/packages/react-native-nitro-modules/cpp/core/Promise.hpp) type - for example, to use an asynchronous Thread pool:

    ```cpp
    Promise<double> fibonacci(double n) {
      return Promise::async([=]() -> double {
        // This runs on a separate Thread!
        return calculateFibonacciSequence(n);
      });
    }
    ```
  </TabItem>
  <TabItem value="swift" label="Swift">
    In Swift, a `Promise<T>` can be created via Nitro's [`Promise<T>`](https://github.com/mrousavy/nitro/blob/main/packages/react-native-nitro-modules/ios/core/Promise.swift) type - for example, to use Swift's new async/await syntax:

    ```swift
    func fibonacci(n: Double) -> Promise<Double> {
      return Promise.async {
        // This runs on a separate Thread, and can use `await` syntax!
        return try await calculateFibonacciSequence(n)
      }
    }
    ```
  </TabItem>
  <TabItem value="kotlin" label="Kotlin">
    In Kotlin, a `Promise<T>` can be created via Nitro's [`Promise<T>`](https://github.com/mrousavy/nitro/blob/main/packages/react-native-nitro-modules/android/src/main/java/com/margelo/nitro/core/Promise.kt) type - for example, to use Kotlin's coroutine syntax:

    ```kotlin
    fun fibonacci(n: Double): Promise<Double> {
      return Promise.async {
        // This runs on a separate Thread, and can use suspending coroutine functions!
        return calculateFibonacciSequence(n)
      }
    }
    ```
  </TabItem>
</Tabs>

Additionally, Nitro statically enforces that **Promises can never go stale**, preventing you from accidentally "forgetting" to resolve or reject a Promise:

```swift title="HybridMath.swift"
func saveToFile(image: HybridImage) -> Promise<Void> {
  guard let data = image.data else { return }
  // code-error
                                     ^ // Error: Cannot return void!
  return Promise.async {
    data.writeToFile("file://tmp/img.png")
  }
}
```
