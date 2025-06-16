---
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Dates (`Date`)

Dates are date and time instances that can be passed between JS and native.
Under the hood, conversions take place using milliseconds, so it's essentially a wrapper around `numbers`.

<Tabs>
  <TabItem value="ts" label="TypeScript" default>
    ```ts
    interface Image extends HybridObject {
      getCreationDate(): Date
    }
    ```
  </TabItem>
  <TabItem value="swift" label="Swift">
    ```swift
    class HybridImage: HybridImageSpec {
      func getCreationDate() -> Date
    }
    ```
  </TabItem>
  <TabItem value="kotlin" label="Kotlin">
    ```kotlin
    class HybridImage: HybridImageSpec() {
      fun getCreationDate(): Instant
    }
    ```
  </TabItem>
  <TabItem value="cpp" label="C++">
    ```cpp
    class HybridImage: public HybridImageSpec {
      std::chrono::system_clock::time_point getCreationDate();
    }
    ```
  </TabItem>
</Tabs>
