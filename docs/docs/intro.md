---
---

# What is Nitro?

Nitro is a framework for building native modules in React Native.

- A **Nitro Module** is a library built with Nitro.
- A **Hybrid Object** is a native object in Nitro, implemented in either C++, Swift or Kotlin.
- [**Nitrogen**](nitrogen) is a code-generator a library author can use to generate native bindings from a custom TypeScript interface.

<div className="side-by-side-container">
<div className="side-by-side-block">

```ts title="Math.nitro.ts"
interface Math extends HybridObject {
  readonly pi: number
  add(a: number, b: number): number
}
```

</div>
<div className="side-by-side-block">

```swift title="HybridMath.swift"
class HybridMath : HybridMathSpec {
  var pi: Double {
    return Double.pi
  }

  func add(a: Double, b: Double) -> Double {
    return a + b
  }
}
```

</div>
</div>
