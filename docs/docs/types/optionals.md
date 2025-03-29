---
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Optionals (`T?`)

Optional or nullable values can be declared either by using the questionmark operator (`?`), or by adding an `undefined` variant:

<Tabs>
  <TabItem value="ts" label="TypeScript" default>
    ```ts
    interface Math extends HybridObject {
      a?: number
      b: number | undefined
    }
    ```
  </TabItem>
  <TabItem value="swift" label="Swift">
    ```swift
    class HybridMath: HybridMathSpec {
      var a: Double?
      var b: Double?
    }
    ```
  </TabItem>
  <TabItem value="kotlin" label="Kotlin">
    ```kotlin
    class HybridMath: HybridMathSpec() {
      override var a: Double?
      override var b: Double?
    }
    ```
  </TabItem>
  <TabItem value="cpp" label="C++">
    ```cpp
    class HybridMath: public HybridMathSpec {
      std::optional<double> a;
      std::optional<double> b;
    };
    ```
  </TabItem>
</Tabs>

In Kotlin/Java, nullables have to be boxed in object types.
