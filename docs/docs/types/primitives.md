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
    interface Math extends HybridObject<{ … }> {
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

A `bigint` is actually a variable-size type.

In Nitro, you have to explicitly choose `Int64` or `UInt64` as types, which map to `bigint` in JS.

If you need larger numbers than `UInt64`, you need to either implement a Big Integer library yourself, or bridge `bigint` values using `string`s.
