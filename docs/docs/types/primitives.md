---
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Primitives (`number`, `boolean`, `bigint`)

Primitive datatypes like `number`, `boolean` or `bigint` can use platform-native datatypes directly.
For example, a JS `number` is always a 64-bit `double` in C++, a `Double` in Swift, and a `Double` in Kotlin.

<Tabs>
  <TabItem value="ts" label="TypeScript" default>
    ```ts
    interface Math extends HybridObject {
      add(a: number, b: number): number
    }
    ```
  </TabItem>
  <TabItem value="swift" label="Swift">
    ```swift
    class HybridMath: HybridMathSpec {
      func add(a: Double, b: Double) -> Double
    }
    ```
  </TabItem>
  <TabItem value="kotlin" label="Kotlin">
    ```kotlin
    class HybridMath: HybridMathSpec() {
      fun add(a: Double, b: Double): Double
    }
    ```
  </TabItem>
  <TabItem value="cpp" label="C++">
    ```cpp
    class HybridMath : public HybridMathSpec {
      double add(double a, double b);
    }
    ```
  </TabItem>
</Tabs>

Primitives are very efficient and can be passed with little to no overhead, especially between C++ and Swift, and C++ and Kotlin.

## `bigint`'s actual type

A `bigint` is actually a variable-size type. While it is bridged to a 64-bit Integer (-2<sup>63</sup> … 2<sup>63</sup>−1), it can theoretically be larger than that.

Since there is no built-in equivalent of `bigint` in C++/Swift/Kotlin, you'd need to stringify the `bigint` value on the JS side and parse it from a string to your big number library of choice on the native side again in cases where you really need big numbers.
