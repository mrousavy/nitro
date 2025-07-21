---
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Typed sets (`Set<T>`)

A typed set is a collection of unique items of type `T` that allows you to quickly check if a collection contains a certain item.

It is useful in situation where you need to quickly check if you have 'seen' an item, or if there's a need of checking for item existence but you don't care about ordering of items.

For example if your API returns a list of banned user IDs and you need to query quickly in the codebase if user is banned, you can model it like this:

<Tabs>
  <TabItem value="ts" label="TypeScript" default>
    ```ts
    interface Database extends HybridObject {
      getBannedUserIDs(): Set<number>
    }
    ```
  </TabItem>
  <TabItem value="swift" label="Swift">
    ```swift
    class HybridDatabase: HybridDatabaseSpec {
      func getBannedUserIDs() -> Set<Double>
    }
    ```
  </TabItem>
  <TabItem value="kotlin" label="Kotlin">
    ```kotlin
    class HybridDatabase: HybridDatabaseSpec() {
      fun getBannedUserIDs(): Set<Double>
    }
    ```
  </TabItem>
  <TabItem value="cpp" label="C++">
    ```cpp
    class HybridDatabase: public HybridDatabaseSpec {
      std::unordered_set<double> getBannedUserIDs();
    }
    ```
  </TabItem>
</Tabs>

:::tip
JavaScript `Set` objects are guaranteeing iteration over their elements in insertion order. This invariant is not upheld with the current, `std::unordered_set`-based implementation.
:::
