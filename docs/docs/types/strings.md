---
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Strings (`string`)

A `string` handles like a [primitive](primitives), but technically isn't one.
In C++, a `string` is represented using a UTF-8 `std::string`.

<Tabs>
  <TabItem value="ts" label="TypeScript" default>
    ```ts
    interface MyHybrid extends HybridObject {
      concat(a: string, b: string): string
    }
    ```
  </TabItem>
  <TabItem value="swift" label="Swift">
    ```swift
    class MyHybrid: MyHybridSpec {
      func concat(a: String, b: String) -> String
    }
    ```
  </TabItem>
  <TabItem value="kotlin" label="Kotlin">
    ```kotlin
    class MyHybrid: MyHybridSpec() {
      fun concat(a: String, b: String): String
    }
    ```
  </TabItem>
  <TabItem value="cpp" label="C++">
    ```cpp
    class MyHybrid : public MyHybridSpec {
      std::string concat(const std::string& a, const std::string& b);
    }
    ```
  </TabItem>
</Tabs>
