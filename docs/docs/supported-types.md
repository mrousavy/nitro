---
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Types

Nitro uses an extensible typing system to efficiently convert between JS and C++ types - **statically defined** and fully **type-safe** and **null-safe at compile-time**.

For example, a JS `number` will always be a `double` on the native side:


<div style={{ display: 'flex', justifyContent: 'space-evenly' }}>
<div style={{ flex: 1, maxWidth: '50%', marginRight: 15 }}>

```ts title="Math.nitro.ts"
interface Math extends HybridObject {
  add(a: number, b: number): number
}
```

</div>
<div style={{ flex: 1, maxWidth: '50%', marginLeft: 15 }}>

```cpp title="HybridMath.hpp"
class HybridMath : public HybridMathSpec {
  double add(double a, double b);
}
```

</div>
</div>

Nitro strictly enforces **type-safety** and **null-safety** - both at compile-time and at runtime.
This prevents accidentally passing a wrong type to `add(..)` (for example, a `string`) and performs null-checks to prevent passing and returning `null`/`undefined` values.

On the native side (C++/Swift/Kotlin), type-, and null-safety is enforced via the compiler, and via debug-only runtime checks. Your native method's arguments are guaranteed to be type-safe and null-safe, and the compiler enforces return types so you cannot return a value that isn't expected by the TypeScript specs.

On the JS side (TypeScript), type- and null-safety is enforced via TypeScript - so use it!

## Supported Types

These are all the types Nitro supports out of the box:

<table>
  <tr>
    <th>JS Type</th>
    <th>C++ Type</th>
    <th>Swift Type</th>
    <th>Kotlin Type</th>
  </tr>

  <tr>
    <td><code>number</code></td>
    <td><code>double</code> / <code>int</code> / <code>float</code></td>
    <td><code>Double</code></td>
    <td><code>Double</code></td>
  </tr>
  <tr>
    <td><code>boolean</code></td>
    <td><code>bool</code></td>
    <td><code>Bool</code></td>
    <td><code>Boolean</code></td>
  </tr>
  <tr>
    <td><code>string</code></td>
    <td><code>std::string</code></td>
    <td><code>String</code></td>
    <td><code>String</code></td>
  </tr>
  <tr>
    <td><code>bigint</code></td>
    <td><code>int64_t</code> / <code>uint64_t</code></td>
    <td><code>Int64</code></td>
    <td><code>Long</code></td>
  </tr>
  <tr>
    <td><code>T[]</code></td>
    <td><code>std::vector&lt;T&gt;</code></td>
    <td><code>[T]</code></td>
    <td><code>Array&lt;T&gt;</code> / <code>PrimitiveArray</code></td>
  </tr>
  <tr>
    <td><code>T?</code></td>
    <td><code>std::optional&lt;T&gt;</code></td>
    <td><code>T?</code></td>
    <td><code>T?</code></td>
  </tr>
  <tr>
    <td><code>[A, B, ...]</code></td>
    <td><code>std::tuple&lt;A, B, ...&gt;</code></td>
    <td><code>(A, B)</code> 🟡  (<a href="https://github.com/mrousavy/nitro/issues/38">#38</a>)</td>
    <td>❌</td>
  </tr>
  <tr>
    <td><code>A | B | ...</code></td>
    <td><code>std::variant&lt;A, B, ...&gt;</code></td>
    <td><code>Variant_A_B</code> 🟡  (<a href="https://github.com/mrousavy/nitro/issues/39">#39</a>)</td>
    <td>❌</td>
  </tr>
  <tr>
    <td><code>Promise&lt;T&gt;</code></td>
    <td><code>std::future&lt;T&gt;</code></td>
    <td><code><a href="https://github.com/mrousavy/nitro/blob/main/packages/react-native-nitro-modules/ios/core/Promise.swift">Promise&lt;T&gt;</a></code></td>
    <td><code><a href="https://github.com/mrousavy/nitro/blob/main/packages/react-native-nitro-modules/android/src/main/java/com/margelo/nitro/core/Promise.kt">Promise&lt;T&gt;</a></code></td>
  </tr>
  <tr>
    <td><code>(T...) =&gt; void</code></td>
    <td><code>std::function&lt;void (T...)&gt;</code></td>
    <td><code>@escaping (T...) -&gt; Void</code></td>
    <td><code>(T...) -&gt; Unit</code></td>
  </tr>
  <tr>
    <td><code>(T...) =&gt; R</code></td>
    <td><code>std::function&lt;std::future&lt;R&gt; (T...)&gt;</code></td>
    <td>❌</td>
    <td>❌</td>
  </tr>
  <tr>
    <td><code>Record&lt;string, T&gt;</code></td>
    <td><code>std::unordered_map&lt;std::string, T&gt;</code></td>
    <td><code>Dictionary&lt;String, T&gt;</code></td>
    <td><code>Map&lt;String, T&gt;</code></td>
  </tr>
  <tr>
    <td><code>object</code></td>
    <td><code>std::shared_ptr&lt;<a href="https://github.com/mrousavy/nitro/blob/main/packages/react-native-nitro-modules/cpp/core/AnyMap.hpp">AnyMap</a>&gt;</code></td>
    <td><code><a href="https://github.com/mrousavy/nitro/blob/main/packages/react-native-nitro-modules/ios/core/AnyMapHolder.swift">AnyMapHolder</a></code> 🟡  (<a href="https://github.com/mrousavy/nitro/issues/57">#57</a>)</td>
    <td><code><a href="https://github.com/mrousavy/nitro/blob/main/packages/react-native-nitro-modules/android/src/main/java/com/margelo/nitro/core/AnyMap.kt">AnyMap</a></code></td>
  </tr>
  <tr>
    <td><code>ArrayBuffer</code></td>
    <td><code>std::shared_ptr&lt;<a href="https://github.com/mrousavy/nitro/blob/main/packages/react-native-nitro-modules/cpp/core/ArrayBuffer.hpp">ArrayBuffer</a>&gt;</code></td>
    <td><code><a href="https://github.com/mrousavy/nitro/blob/main/packages/react-native-nitro-modules/ios/core/ArrayBufferHolder.swift">ArrayBufferHolder</a></code></td>
    <td><code><a href="https://github.com/mrousavy/nitro/blob/main/packages/react-native-nitro-modules/android/src/main/java/com/margelo/nitro/core/ArrayBuffer.kt">ArrayBuffer</a></code></td>
  </tr>
  <tr>
    <td>..any <code><a href="https://github.com/mrousavy/nitro/blob/main/packages/react-native-nitro-modules/src/HybridObject.ts">HybridObject</a></code></td>
    <td><code>std::shared_ptr&lt;<a href="https://github.com/mrousavy/nitro/blob/main/packages/react-native-nitro-modules/cpp/core/HybridObject.hpp">HybridObject</a>&gt;</code></td>
    <td><code><a href="https://github.com/mrousavy/nitro/blob/main/packages/react-native-nitro-modules/ios/core/HybridObjectSpec.swift">HybridObjectSpec</a></code></td>
    <td><code><a href="https://github.com/mrousavy/nitro/blob/main/packages/react-native-nitro-modules/android/core/HybridObject.kt">HybridObject</a></code></td>
  </tr>
  <tr>
    <td>..any <code>interface</code></td>
    <td><code>T</code></td>
    <td><code>T</code></td>
    <td><code>T</code></td>
  </tr>
  <tr>
    <td>..any <code>enum</code></td>
    <td><code>T</code></td>
    <td><code>T</code></td>
    <td><code>T</code></td>
  </tr>
  <tr>
    <td>..any <code>union</code></td>
    <td><code>T</code></td>
    <td><code>T</code></td>
    <td><code>T</code></td>
  </tr>
</table>

### Primitives (`number`, `boolean`, `bigint`)

Primitive datatypes like `number`, `boolean` or `bigint` can use platform-native datatypes directly.
For example, a JS `number` is always a 64-bit `double` in C++, a `Double` in Swift, and a `Double` in Kotlin.

Primitives are very efficient and can be passed with little to no overhead, especially between C++ and Swift, and C++ and Kotlin.

### Arrays (`T[]`)

Arrays of items are represented with the most common, and most efficient array datastructures in native languages, such as `std::vector<T>` or `Array<T>`.

#### Kotlin `PrimitiveArray`

As a performance improvement, the JNI (C++ -> Kotlin interface) provides **Primitive Array** datatypes which can avoid boxing primitives into `Object`s, and provides bulk copy methods.
This makes all array operations **a lot faster**, and Nitrogen is smart enough to ✨**automagically**✨ use Primitive Arrays whenever possible.
This will replace the following arrays:

- `Array<Double>` -> [`DoubleArray`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/-double-array/)
- `Array<Boolean>` -> [`BooleanArray`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/-boolean-array/)
- `Array<Long>` -> [`LongArray`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/-long-array/)

### Optionals (`T?`)

Optional or nullable values can be declared using either the questionmark operator (`?`), or by adding an `undefined` variant:

<Tabs>
  <TabItem value="ts" label="TypeScript" default>
    ```ts
    interface Math extends HybridObject {
      a?: number
      b: number | undefined
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
</Tabs>

### Tuples (`[A, B, ...]`)

A Tuple is a fixed-length set of items of the given types. Example:

```ts
type Point = [number, number]
interface Math extends HybridObject {
  distance(a: Point, b: Point): number
}
```

Tuples can also have different types per value:

```ts
type Good = [number, string, Person]
type Bad = (number | string | Person)[]
interface Test extends HybridObject {
  good(values: Good): void
  bad(values: Bad): void
}
```

The tuple "`Good`" in the example above is better and more efficient than "`Bad`" because it's length is known at compile-time,
each parameter is type-safe (`Good[0] = number`, `Bad[0] = number | string | Person`), and it doesn't use variants.

### Variants (`A | B | ...`)

A Variant is a type of either one of the values defined in it's declaration. Example:

```ts
interface Math extends HybridObject {
  distance(value: number | Point): number
}
```

:::tip
While variants are still very efficient, they need runtime-checks for type conversions,
which comes with a tiny overhead compared to all other statically defined types. If possible, **avoid variants**.
:::

### Promises (`Promise<T>`)

A function can be made asynchronous by returning a `Promise` to JS.
This allows your native code to perform heavy-, long-running tasks in parallel, while the JS thread can continue rendering and performing other business logic.

<Tabs>
  <TabItem value="ts" label="TypeScript" default>
    In TypeScript, a `Promise<T>` is represented using the built-in `Promise<T>` type:

    ```ts
    interface Math extends HybridObject {
      fibonacci(n: number): Promise<number>
    }

    const math = // ...
    await math.fibonacci(13)
    ```
  </TabItem>
  <TabItem value="cpp" label="C++">
    In C++, a `Promise<T>` is represented as an `std::future<T>`. For example, with [`std::async`](https://en.cppreference.com/w/cpp/thread/async):

    ```cpp
    std::future<double> fibonacci(double n) {
      return std::async(std::launch::async, [=]() -> double {
        // This runs on a separate Thread!
        return calculateFibonacciSequence(n);
      });
    }
    ```
  </TabItem>
  <TabItem value="swift" label="Swift">
    In Swift, a `Promise<T>` can be created via Nitro's [`Promise<T>`](https://github.com/mrousavy/nitro/blob/main/packages/react-native-nitro-modules/ios/core/Promise.swift) type - for example, to use Swift's new async/await syntax:

    ```swift
    func fibonacci(n: Double) -> Promise<Double> {
      return Promise.async {
        // This runs on a separate Thread, and can use `await` syntax!
        return try await calculateFibonacciSequence(n)
      }
    }
    ```
  </TabItem>
  <TabItem value="kotlin" label="Kotlin">
    In Kotlin, a `Promise<T>` can be created via Nitro's [`Promise<T>`](https://github.com/mrousavy/nitro/blob/main/packages/react-native-nitro-modules/android/src/main/java/com/margelo/nitro/core/Promise.kt) type - for example, to use Kotlin's coroutine syntax:

    ```kotlin
    fun fibonacci(n: Double): Promise<Double> {
      return Promise.async {
        // This runs on a separate Thread, and can use suspending coroutine functions!
        return calculateFibonacciSequence(n)
      }
    }
    ```
  </TabItem>
</Tabs>

Additionally, Nitro statically enforces that **Promises can never go stale**, preventing you from accidentally "forgetting" to resolve or reject a Promise:

```swift title="HybridMath.swift"
func saveToFile(image: HybridImage) -> Promise<Void> {
  guard let data = image.data else { return }
  // code-error
                                     ^ // Error: Cannot return void!
  return Promise.async {
    data.writeToFile("file://tmp/img.png")
  }
}
```

### Callbacks (`(...) => T`)

Callbacks are functions created in one language and passed to another to provide a way to "call back" later.

Nitro has a clever reference counting system to allow users to use callbacks/functions from JS safely, and without any limitations.
Each callback can be held as a strong reference on the native side, and safely be called as often as needed.
Once the callback is no longer used, it will be safely deleted from memory.

<Tabs>
  <TabItem value="ts" label="TypeScript" default>
    In TypeScript, a callback is representing as an anonymous function:

    ```ts
    type Orientation = "portrait" | "landscape"
    interface DeviceInfo extends HybridObject {
      listenToOrientation(onChanged: (o: Orientation) => void): void
    }

    const deviceInfo = // ...
    deviceInfo.listenToOrientation((o) => {
      console.log(`Orientation changed to ${o}!`)
    })
    ```
  </TabItem>
  <TabItem value="cpp" label="C++">
    In C++, a callback is represented as a function:

    ```cpp
    void listenToOrientation(std::function<void(Orientation)> onChanged) {
      this->listeners.push_back(onChanged);
    }

    void onRotate() {
      for (const auto& listener: this->listeners) {
        listener(newOrientation);
      }
    }
    ```
  </TabItem>
  <TabItem value="swift" label="Swift">
    In Swift, a callback is represented as a closure:

    ```swift
    func listenToOrientation(onChanged: (Orientation) -> Void) {
      self.listeners.append(onChanged)
    }

    func onRotate() {
      for listener in self.listeners {
        listener(newOrientation)
      }
    }
    ```
  </TabItem>
  <TabItem value="kotlin" label="Kotlin">
    In Kotlin, a callback is represented as a lambda:

    ```kotlin
    fun listenToOrientation(onChanged: (Orientation) -> Unit) {
      this.listeners.add(onChanged)
    }

    fun onRotate() {
      for (listener in this.listeners) {
        listener(newOrientation)
      }
    }
    ```
  </TabItem>
</Tabs>

Since callbacks can be safely kept in memory for longer and called multiple times, Nitro does not have a special type for an "event".
It is simply a function you store in memory and call later. ✨

#### Callbacks that return a value (`(...) => T`)

Since JS callbacks could theoretically be called from any native Thread,
Nitro safely wraps the result types of callbacks that return a value in **Promises which need to be awaited**.

<div style={{ display: 'flex', justifyContent: 'space-evenly' }}>
<div style={{ flex: 1, maxWidth: '50%', marginRight: 15 }}>

```ts title="Math.nitro.ts"
interface Math extends HybridObject {
  some(getValue: () => number): void
}



```

</div>
<div style={{ flex: 1, maxWidth: '50%', marginLeft: 15 }}>

```swift title="HybridMath.swift"
func some(getValue: () -> Promise<Double>) {
  Task {
    let promise = getValue()
    let valueFromJs = promise.await()
  }
}
```

</div>
</div>

#### How was it before Nitro?

Conventionally (in legacy React Native Native Modules), a native method could only have a maximum of two callbacks, one "success" and one "failure" callback.
Once one of these callbacks is called, both will be destroyed and can no longer be called later.
This is why React Native introduced "Events" as a way to call into JS more than just once.
This also meant that an asynchronous function could not have any callbacks, since a Promise's resolve and reject functions are already two callbacks.
For example, this was **not possible**:

```ts
interface Camera {
  startRecording(onStatusUpdate: () => void,
                 onRecordingFailed: () => void,
                 onRecordingFinished: () => void): Promise<void>
}
```

Thanks to Nitro's clever function system, functions can be safely held in memory and called as many times as you like, just like in a normal JS class.
This makes "Events" obsolete, and allows using as many callbacks per native method as required.

### Typed maps (`Record<string, T>`)

A typed map is an object where each value is of the given type `T`.

For example, if your API returns a map of users with their ages, you _could_ use a `Record<string, number>`:

<Tabs>
  <TabItem value="ts" label="TypeScript" default>
    ```ts
    interface Database extends HybridObject {
      getAllUsers(): Record<string, number>
    }
    ```
  </TabItem>
  <TabItem value="cpp" label="C++">
    ```cpp
    class HybridDatabase: public HybridDatabaseSpec {
      std::unordered_map<std::string, double> getAllUsers();
    }
    ```
  </TabItem>
  <TabItem value="swift" label="Swift">
    ```swift
    class HybridDatabase: HybridDatabaseSpec {
      func getAllUsers() -> Dictionary<String, Double>
    }
    ```
  </TabItem>
  <TabItem value="kotlin" label="Kotlin">
    ```kotlin
    class HybridDatabase: HybridDatabaseSpec() {
      fun getAllUsers(): Map<String, Double>
    }
    ```
  </TabItem>
</Tabs>

:::tip
While typed maps are very efficient, Nitro cannot sufficiently optimize the object as keys are not known in advance.
If possible, **avoid typed maps** and use [arrays](#arrays-t) for unknown number of items, or [strongly typed objects](#custom-types-any-t) for known number of items instead.
:::

### Untyped maps (`AnyMap`)

An untyped map represents a JSON-like structure with a value that can either be a `number`, a `string`, a `boolean`, a `bigint`, a `null`, an array or an object.

<Tabs>
  <TabItem value="ts" label="TypeScript" default>
    ```ts
    interface Fetch extends HybridObject {
      get(url: string): AnyMap
    }
    ```
  </TabItem>
  <TabItem value="cpp" label="C++">
    ```cpp
    class HybridFetch: public HybridFetchSpec {
      std::shared_ptr<AnyMap> get(const std::string& url);
    }
    ```
  </TabItem>
  <TabItem value="swift" label="Swift">
    ```swift
    class HybridFetch: HybridFetchSpec {
      func get(url: String) -> AnyMapHolder
    }
    ```
  </TabItem>
  <TabItem value="kotlin" label="Kotlin">
    ```kotlin
    class HybridFetch: HybridFetchSpec() {
      fun get(url: String): AnyMap
    }
    ```
  </TabItem>
</Tabs>

:::tip
While untyped maps are implemented efficiently, Nitro cannot sufficiently optimize the object as keys and value-types are not known in advance.
If possible, **avoid untyped maps** and use [strongly typed objects](#custom-types-any-t) instead.
:::

### Data ArrayBuffers (`ArrayBuffer`)

Array Buffers allow highly efficient access to the same data from both JS and native.
Passing an `ArrayBuffer` from native to JS and back does not involve any copies, and is therefore the fastest way of passing around data in Nitro.

It is important to understand the ownership, and threading concerns around such shared memory access.

#### Ownership

- An `ArrayBuffer` that was created on the native side is **owning**, which means you can safely access it's data as long as the `ArrayBuffer` reference is alive.
It can be safely held strong for longer, e.g. as a class property/member, and accessed from different Threads.

  ```swift
  func doSomething() -> ArrayBufferHolder {
    let buffer = ArrayBufferHolder.allocate(1024 * 10)
    let data = buffer.data   // <-- ✅ safe to do because we own it!
    self.buffer = buffer     // <-- ✅ safe to do to use it later!
    DispatchQueue.global().async {
      let data = buffer.data // <-- ✅ also safe because we own it!
    }
    return buffer
  }
  ```

- An `ArrayBuffer` that was received as a parameter from JS cannot be safely kept strong as the JS VM can delete it at any point, hence it is **non-owning**.
It's data can only be safely accessed before the synchronous function returned, as this will stay within the JS bounds.

  ```swift
  func doSomething(buffer: ArrayBufferHolder) {
    let data = buffer.data   // <-- ✅ safe to do because we're still sync
    DispatchQueue.global().async {
      // code-error
      let data = buffer.data // <-- ❌ NOT safe
    }
  }
  ```
  If you need a non-owning buffer's data for longer, **copy it first**:
  ```swift
  func doSomething(buffer: ArrayBufferHolder) {
    let copy = ArrayBufferHolder.copy(of: buffer)
    DispatchQueue.global().async {
      let data = copy.data // <-- ✅ safe now because we have a owning copy
    }
  }
  ```

#### Threading

An `ArrayBuffer` can be accessed from both JS and native, and even from multiple Threads at once, but they are **not thread-safe**.
To prevent race conditions or garbage-data from being read, make sure to not read from- and write to- the `ArrayBuffer` at the same time.

### Other Hybrid Objects (`HybridObject`)

Since Nitro Modules are object-oriented, a `HybridObject` itself is a first-class citizen.
This means you can pass around instances of native `HybridObject`s between JS and native, allowing for safe interface-level abstractions:

<div style={{ display: 'flex', justifyContent: 'space-evenly' }}>
<div style={{ flex: 1, maxWidth: '50%', marginRight: 15 }}>

```ts title="Camera.nitro.ts"
interface Image extends HybridObject {
  readonly width: number
  readonly height: number
}

interface Camera extends HybridObject {
  takePhoto(): Image
}
```

</div>
<div style={{ flex: 1, maxWidth: '50%', marginLeft: 15 }}>

```swift title="HybridCamera.swift"
class HybridImage: HybridImageSpec {
  var width: Double { get }
  var height: Double { get }
}

class HybridCamera: HybridCameraSpec {
  func takePhoto() -> HybridImageSpec
}
```

</div>
</div>

#### Interface-level abstraction

Since Hybrid Objects are declared as interfaces, `Image` could have different implementations...

```swift
class HybridUIImage: HybridImageSpec {
  // ...
  var uiImage: UIImage
}
class HybridCGImage: HybridImageSpec {
  // ...
  var cgImage: CGImage
}
class HybridBufferImage: HybridImageSpec {
  // ...
  var gpuBuffer: CMSampleBuffer
}
```

...but still be used exactly the same in other places, as it is all a `HybridImageSpec`.
Even if they use different implementations under the hood, they all share a common interface with properties like `width`, `height` and more:

<div style={{ display: 'flex', justifyContent: 'space-evenly' }}>
<div style={{ flex: 1, maxWidth: '45%', marginRight: 15 }}>

```ts title="Cropper.nitro.ts"
interface Cropper extends HybridObject {
  crop(image: Image,
       size: Size): Image
}




```

</div>
<div style={{ flex: 1, maxWidth: '55%', marginLeft: 15 }}>

```swift title="Cropper.swift"
class HybridCropper: HybridCropperSpec {
  func crop(image: HybridImageSpec,
            size: Size) -> HybridImageSpec {
    let data = image.data
    let croppedData = myCustomCropFunction(data, size)
    return HybridCGImage(data: croppedData)
  }
}
```

</div>
</div>

### Custom Types (...any `T`)

<Tabs groupId="nitrogen-or-not">
  <TabItem value="nitrogen" label="With Nitrogen ✨" default>


    Nitrogen can ✨**automagically**✨ generate custom types and their respective bindings for any types used in your specs.

    #### Custom interfaces (structs)

    Any custom `interface` or `type` will be represented as a fully type-safe `struct` in C++/Swift/Kotlin. Simply define the type in your `.nitro.ts` spec:

    <div style={{ display: 'flex', justifyContent: 'space-evenly' }}>
    <div style={{ flex: 1, maxWidth: '45%', marginRight: 15 }}>

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
    <div style={{ flex: 1, maxWidth: '55%', marginLeft: 15 }}>

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
    Both `value` and `remainder` are always part of `Result`, they are never a different type than a `number`, and never null or undefined.

    This makes the TypeScript definition the **single source of truth**, allowing you to rely on types! 🤩

    #### Enums (TypeScript enum)

    A [TypeScript enum](https://www.typescriptlang.org/docs/handbook/enums.html) is essentially just an object where each key has an incrementing integer value,
    so Nitrogen will just generate a C++ enum natively, and bridges to JS using simple integers:

    ```ts
    enum Gender {
      MALE,
      FEMALE
    }
    interface Person extends HybridObject {
      getGender(): Gender
    }
    ```

    This is efficient because `MALE` is the number `0`, `FEMALE` is the number `1`, and all other values are invalid.

    #### Enums (TypeScript union)

    A [TypeScript union](https://www.typescriptlang.org/docs/handbook/unions-and-intersections.html#intersection-types) is essentially just a string, which is only "typed" via TypeScript.

    ```ts
    type Gender = 'male' | 'female'
    interface Person extends HybridObject {
      getGender(): Gender
    }
    ```

    Nitrogen statically generates hashes for the strings `"male"` and `"female"` at compile-time, allowing for very efficient conversions between JS `string`s and native `enum`s.


  </TabItem>
  <TabItem value="manually" label="Manually">

    #### Overloading a simple type

    The `JSIConverter<T>` is a template which can be extended with any custom type.

    For example, if you want to use `float` directly you can tell Nitro how to convert a `jsi::Value` to `float` by implementing `JSIConverter<float>`:

    ```cpp title="JSIConverter+Float.hpp"
    template <>
    struct JSIConverter<float> final {
      static inline float fromJSI(jsi::Runtime&, const jsi::Value& arg) {
        return static_cast<float>(arg.asNumber());
      }
      static inline jsi::Value toJSI(jsi::Runtime&, float arg) {
        return jsi::Value(arg);
      }
      static inline bool canConvert(jsi::Runtime&, const jsi::Value& value) {
        return value.isNumber();
      }
    };
    ```

    Then just use it in your methods:

    ```cpp title="HybridMath.hpp"
    class HybridMath : public HybridObject {
    public:
      float add(float a, float b) {
        return a + b;
      }

      void loadHybridMethods() {
        HybridObject::loadHybridMethods();
        registerHybrids(this, [](Prototype& prototype) {
          prototype.registerHybridMethod("add", &HybridMath::add);
        });
      }
    }
    ```

    :::info
    Make sure the compiler knows about `JSIConverter<float>` at the time when `HybridMath` is declared, so import your `JSIConverter+Float.hpp` in your Hybrid Object's header file as well!
    :::

    #### Complex types (e.g. `struct`)

    The same goes for any complex type, like a custom typed `struct`:

    ```cpp title="JSIConverter+Person.hpp"
    struct Person {
      std::string name;
      double age;
    };

    template <>
    struct JSIConverter<Person> {
      static Person fromJSI(jsi::Runtime& runtime, const jsi::Value& arg) {
        jsi::Object obj = arg.asObject(runtime);
        return Person(
          JSIConverter<std::string>::fromJSI(runtime, obj.getProperty(runtime, "name")),
          JSIConverter<double>::fromJSI(runtime, obj.getProperty(runtime, "age"))
        );
      }
      static jsi::Value toJSI(jsi::Runtime& runtime, const Person& arg) {
        jsi::Object obj(runtime);
        obj.setProperty(runtime, "name", JSIConverter<std::string>::toJSI(runtime, arg.name));
        obj.setProperty(runtime, "age", JSIConverter<double>::toJSI(runtime, arg.age));
        return obj;
      }
      static bool canConvert(jsi::Runtime& runtime, const jsi::Value& value) {
        if (!value.isObject())
          return false;
        jsi::Object obj = value.getObject(runtime);
        if (!JSIConverter<std::string>::canConvert(runtime, obj.getProperty(runtime, "name")))
          return false;
        if (!JSIConverter<double>::canConvert(runtime, obj.getProperty(runtime, "age")))
          return false;
        return true;
      }
    };
    ```

    ..which can now safely be called with any JS value.
    If the given JS value is not an object of exactly the shape of `Person` (that is, a `name: string` and an `age: number` values), Nitro will throw an error.

  </TabItem>
</Tabs>
