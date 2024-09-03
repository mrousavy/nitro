---
---

# What is Nitro?

Nitro is a framework for building native modules in React Native.

- A **Nitro Module** is a library built with Nitro.
- A **Hybrid Object** is a native object in Nitro, implemented in either C++, Swift or Kotlin.
- **Nitrogen** is a code-generator a library author can use to generate native bindings from a custom TypeScript interface.

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

## Other frameworks

### Turbo Modules

React Native core already ships with a framework for building native modules: **Turbo Modules**.

#### Synchronous functions

<div className="side-by-side-container">
<div className="side-by-side-block">

```swift title="Nitro Module (Swift)"
class HybridMath : HybridMathSpec {
  func add(a: Double, b: Double) -> Double {
    return a + b
  }
}
```

</div>
<div className="side-by-side-block">

```objc title="Turbo Module (Objective-C)"
@implementation RTNMath
RCT_EXPORT_MODULE()

- (NSNumber*)add:(NSNumber*)a b:(NSNumber*)b {
  double added = a.doubleValue + b.doubleValue;
  return [NSNumber numberWithDouble:added];
}
@end
```

</div>
</div>

#### Asynchronous functions

<div className="side-by-side-container">
<div className="side-by-side-block">

```swift title="Nitro Module (Swift)"
class HybridMath : HybridMathSpec {
  func add(a: Double,
           b: Double) -> Promise<Double> {
    return Promise.async { a + b }
  }
}
```

</div>
<div className="side-by-side-block">

```objc title="Turbo Module (Objective-C)"
@implementation RTNMath
RCT_EXPORT_MODULE()

- (void)add:(double)a
          b:(double)b
    resolve:(RCTPromiseResolveBlock)resolve
     reject:(RCTPromiseRejectBlock)reject {
  dispatch_async(
    dispatch_get_global_queue(0, 0),
    ^{
      resolve([NSNumber numberWithDouble:a+b]);
    }
  );
}
```

</div>
</div>

### Expo Modules

Expo's recommended approach of building native modules is called "Expo Modules".

#### Synchronous Functions

<div className="side-by-side-container">
<div className="side-by-side-block">

```swift title="Nitro Module (Swift)"
class HybridMath : HybridMathSpec {
  func add(a: Double, b: Double) -> Double {
    return a + b
  }
}
```

</div>
<div className="side-by-side-block">

```swift title="Expo Module (Swift)"
public class ExpoSettingsModule: Module {
  public func definition() -> ModuleDefinition {
    Name("Math")

    Function("add") { (a: Double,
                       b: Double) -> Double in
      return a + b
    }
  }
}
```

</div>
</div>

#### Asynchronous Functions

<div className="side-by-side-container">
<div className="side-by-side-block">

```swift title="Nitro Module (Swift)"
class HybridMath : HybridMathSpec {
  func add(a: Double,
           b: Double) -> Promise<Double> {
    return Promise.async { a + b }
  }
}
```

</div>
<div className="side-by-side-block">

```swift title="Expo Module (Swift)"
public class ExpoSettingsModule: Module {
  public func definition() -> ModuleDefinition {
    Name("Math")

    AsyncFunction("add") { (a: Double,
                            b: Double) in
      return a + b
    }
  }
}
```

</div>
</div>

### Supported Types

<table>
  <tr>
    <th>JS Type</th>
    <th>Expo Modules</th>
    <th>Turbo Modules</th>
    <th>Nitro Modules</th>
  </tr>
  <tr>
    <td><code>number</code></td>
    <td>✅</td>
    <td>✅</td>
    <td>✅</td>
  </tr>
  <tr>
    <td><code>boolean</code></td>
    <td>✅</td>
    <td>✅</td>
    <td>✅</td>
  </tr>
  <tr>
    <td><code>string</code></td>
    <td>✅</td>
    <td>✅</td>
    <td>✅</td>
  </tr>
  <tr>
    <td><code>bigint</code></td>
    <td>❌</td>
    <td>❌</td>
    <td>✅</td>
  </tr>
  <tr>
    <td><code>object</code></td>
    <td>✅</td>
    <td>✅</td>
    <td>✅</td>
  </tr>
  <tr>
    <td><code>T?</code></td>
    <td>✅</td>
    <td>✅</td>
    <td>✅</td>
  </tr>
  <tr>
    <td><code>T[]</code></td>
    <td>✅</td>
    <td>✅</td>
    <td>✅</td>
  </tr>
  <tr>
    <td><code>Promise&lt;T&gt;</code></td>
    <td>✅</td>
    <td>✅</td>
    <td>✅</td>
  </tr>
  <tr>
    <td><code>(T...) =&gt; void</code></td>
    <td>✅</td>
    <td>✅</td>
    <td>✅</td>
  </tr>
  <tr>
    <td><code>(T...) =&gt; R</code></td>
    <td>❌</td>
    <td>❌</td>
    <td>✅</td>
  </tr>
  <tr>
    <td><code>[A, B, C, ...]</code></td>
    <td>❌</td>
    <td>❌</td>
    <td>✅</td>
  </tr>
  <tr>
    <td><code>A | B | C | ...</code></td>
    <td>❌</td>
    <td>❌</td>
    <td>✅</td>
  </tr>
  <tr>
    <td><code>Record&lt;string, T&gt;</code></td>
    <td>❌</td>
    <td>❌</td>
    <td>✅</td>
  </tr>
  <tr>
    <td><code>ArrayBuffer</code></td>
    <td>❌</td>
    <td>❌</td>
    <td>✅</td>
  </tr>
  <tr>
    <td>..any <code>HybridObject</code></td>
    <td>❌</td>
    <td>❌</td>
    <td>✅</td>
  </tr>
  <tr>
    <td>..any <code>interface</code></td>
    <td>❌</td>
    <td>✅</td>
    <td>✅</td>
  </tr>
  <tr>
    <td>..any <code>enum</code></td>
    <td>❌</td>
    <td>✅</td>
    <td>✅</td>
  </tr>
  <tr>
    <td>..any <code>union</code></td>
    <td>❌</td>
    <td>❌</td>
    <td>✅</td>
  </tr>
</table>

### Benchmarks

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
