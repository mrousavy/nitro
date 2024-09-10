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

## Performance

Nitro is all about performance. In some benchmarks, Nitro has proven to be **~15x faster** than Turbo Modules, and **~55x faster** than Expo Modules. 

<table>
  <tr>
    <th></th>
    <th>ExpoModules</th>
    <th>TurboModules</th>
    <th>NitroModules</th>
  </tr>
  <tr>
    <td>100.000x <code>addNumbers(...)</code></td>
    <td>404.95ms</td>
    <td>108.84ms</td>
    <td><b>7.25ms</b></td>
  </tr>
  <tr>
    <td>100.000x <code>addStrings(...)</code></td>
    <td>420.69ms</td>
    <td>169.84ms</td>
    <td><b>30.71ms</b></td>
  </tr>
</table>

### Lightweight layer

While Nitro is built ontop of JSI, the layer is very lightweight and efficient.
Many things like type-checking is compile-time only, and built with C++ templates or `constexpr` which introduces zero runtime overhead.

### Direct Swift &lt;&gt; C++ interop

Unlike Turbo- or Expo-Modules, Nitro-Modules does not use Objective-C at all.
Nitro is built using the new [Swift &lt;&gt; C++ interop](https://www.swift.org/documentation/cxx-interop/), which is close to zero-overhead.

### Uses `jsi::NativeState`

Hybrid Objects in Nitro are built ontop of `jsi::NativeState`, which is more efficient than `jsi::HostObject`. Such objects have proper native prototypes, and their native memory size is known, which allows the garbage collector to properly clean up unused objects.

## Type Safety

Nitro Modules are **type-safe** and **null-safe**. By using Nitro's code-generator, [nitrogen](nitrogen), TypeScript specs are the single source of truth as generated native interfaces have to exactly represent the declared types.
If a function declares a `number`, you can only implement it on the native side as a `Double`, otherwise the app will not compile.

<div className="side-by-side-container">
<div className="side-by-side-block">

```ts title="Math.nitro.ts"
interface Math extends HybridObject {
  add(a: number, b: number): number
}
```

</div>
<div className="side-by-side-block">

```swift title="HybridMath.swift"
class HybridMath : HybridMathSpec {
  func add(a: Double, b: Double) -> String {
// code-error
//  Compile-error: Expected Double! ^
    return a + b
  }
}
```

</div>
</div>

### Null-safety

There is no way for a Nitro Module to return a type that is not expected in TypeScript, which also guarantees null-safety.

```ts
interface Math extends HybridObject {
  getValue(): number
  getValueOrNull(): number | undefined
}
```

## Modern Languages

Nitro is a modern framework, built ontop of modern languages like Swift and Kotlin.
It has first-class support for modern language features.

### Swift

Nitro bridges to Swift directly using the new highly efficient [Swift &lt;&gt; C++ interop](https://www.swift.org/documentation/cxx-interop/).

* **Protocols**: Every Hybrid Object's generated specification is a Swift protocol.
* **Properties**: A getter (and setter) property can be implemented using Swift properties.
* **Async**/**Await**: Asynchronous functions can use Swift's new async/await syntax using the `Promise.async` API.
* **No Objective-C**: Instead of bridging through Objective-C interfaces, Nitro bridges to Swift directly from C++.

### Kotlin

Nitro bridges to Kotlin directly using [fbjni](https://github.com/facebookincubator/fbjni).

* **Interfaces**: Every Hybrid Object's generated specification is a Kotlin interface.
* **Properties**: A getter (and setter) property can be implemented using Kotlin properties.
* **Coroutines**: Asynchronous functions can use Kotlin's coroutine syntax using the `Promise.async` API.
* **No Java**: Instead of requiring Java classes, Nitro bridges to Kotlin directly.
