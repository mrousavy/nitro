---
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Custom Structs (`interface`)

Any custom `interface` or `type` that does **not** extend `HybridObject` will be represented as a fully type-safe `struct` in C++/Swift/Kotlin. Simply define the type in your `.nitro.ts` spec:

<div className="side-by-side-container">
<div className="side-by-side-block">

```ts title="Nitro.nitro.ts"
interface Person {
  name: string
  age: number
}

interface Nitro extends HybridObject {
  getAuthor(): Person
}
```

</div>
<div className="side-by-side-block">

```swift title="HybridNitro.swift"
class HybridNitro: HybridNitroSpec {
  func getAuthor() -> Person {
    return Person(name: "Marc", age: 24)
  }
}



```

</div>
</div>

Nitro enforces full type-safety to avoid passing or returning wrong types.
Both `name` and `age` are always part of `Person`, they are never a different type than a `string`/`number`, and never null or undefined.

This makes the TypeScript definition the **single source of truth**, allowing you to rely on types! 🤩

## Structs are eagerly converted

Since structs are just flat value types, each key/value is eagerly converted from a JS value to a native value (and vice-versa) when passing them between JS and native.

This is fine for small structs and benefits from low allocation cost, but contains an overhead when your structs growing larger.
Use [Hybrid Objects](hybrid-objects) to implement a way to lazily convert each key/value instead.
