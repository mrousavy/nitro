<a href="https://margelo.com">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="../../docs/static/img/banner-react-native-nitro-modules-dark.png" />
    <source media="(prefers-color-scheme: light)" srcset="../../docs/static/img/banner-react-native-nitro-modules-light.png" />
    <img alt="Nitrogen" src="../../docs/static/img/banner-react-native-nitro-modules-light.png" />
  </picture>
</a>

<br />

**react-native-nitro-modules** is a core library that contains highly efficient statically compiled JS to C++ bindings.

It uses JSI to generate C++ templates that can bridge virtually any JS type to a C++ type with minimal overhead.

## Installation

### Inside an app

Install [react-native-nitro-modules](https://npmjs.org/react-native-nitro-modules) as a `dependency` in your react-native app:
```sh
npm i react-native-nitro-modules
cd ios && pod install
```

### Inside a nitro module library

If you are building a nitro module yourself, add [react-native-nitro-modules](https://npmjs.org/react-native-nitro-modules) as a `peerDependency` into your library's `package.json`:

```json
{
  ...
  "peerDependencies": {
    ...
    "react-native-nitro-modules": "*"
  },
}
```

Then install `react-native-nitro-modules` as a normal `dependency` in your library's `example/` app as seen above.

## Usage

**react-native-nitro-modules** can either be used with-, or without nitrogen, or mixed (some objects are automatically generated, some manually).

### With Nitrogen

When using Nitrogen, all the bindings are automatically generated. You only need to implement C++, Swift or Kotlin interfaces inside your codebase.

### Without Nitrogen

All C++ bindings are bridged to JS using "Hybrid Objects".

A Hybrid Object can have both methods and properties (get and set).
Create a C++ Hybrid Object by inheriting from `HybridObject`:

```cpp
#include <NitroModules/HybridObject.hpp>

using namespace margelo::nitro;

class MyHybridObject: public HybridObject {
public:
  explicit MyHybridObject(): HybridObject(TAG) {}

public:
  // Property (get)
  double getNumber() { return 13; }
  // Property (set)
  void setNumber(double value) { }
  // Method
  double add(double left, double right) { return left + right; }

public:
  void loadHybridMethods() override {
    // Call base method to make sure we properly inherit `toString()` and `equals()`
    HybridObject::loadHybridMethods();
    // Register all methods that need to be exposed to JS
    registerHybrids(this, [](Prototype& prototype) {
      prototype.registerHybridGetter("number", &MyHybridObject::getNumber);
      prototype.registerHybridSetter("number", &MyHybridObject::setNumber);
      prototype.registerHybridMethod("add", &MyHybridObject::add);
    });
  }

private:
  static constexpr auto TAG = "MyHybrid";
};
```

The `MyHybridObject` can then be registered in the [`HybridObjectRegistry`](./cpp/registry/HybridObjectRegistry.hpp) at app startup:

```cpp
#include <NitroModules/HybridObjectRegistry.hpp>

// Call this at app startup to register the HybridObjects
void load() {
  HybridObjectRegistry::registerHybridObjectConstructor(
    "MyHybrid",
    []() -> std::shared_ptr<HybridObject> {
      return std::make_shared<MyHybridObject>();
    }
  );
}
```

Inside your `MyHybridObject`, you can use standard C++ types which will automatically be converted to JS using Nitro's [`JSIConverter<T>`](./cpp/jsi/JSIConverter.hpp) interface.

The following C++ / JS types are supported out of the box:

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
    <td><code>[A, B, C, ...]</code></td>
    <td><code>std::tuple&lt;A, B, C, ...&gt;</code></td>
    <td><code>(A, B, C)</code> 🟡  (<a href="https://github.com/mrousavy/nitro/issues/38">#38</a>)</td>
    <td>❌</td>
  </tr>
  <tr>
    <td><code>A | B | C | ...</code></td>
    <td><code>std::variant&lt;A, B, C, ...&gt;</code></td>
    <td><code>Variant_A_B_C</code></td>
    <td><code>Variant_A_B_C</code></td>
  </tr>
  <tr>
    <td><code>Record&lt;string, T&gt;</code></td>
    <td><code>std::unordered_map&lt;std::string, T&gt;</code></td>
    <td><code>Dictionary&lt;String, T&gt;</code></td>
    <td><code>Map&lt;std::string, T&gt;</code></td>
  </tr>
  <tr>
    <td><code>T?</code></td>
    <td><code>std::optional&lt;T&gt;</code></td>
    <td><code>T?</code></td>
    <td><code>T?</code></td>
  </tr>
  <tr>
    <td><code>(T...) =&gt; void</code></td>
    <td><code>std::function&lt;void (T...)&gt;</code></td>
    <td><code>@escaping (T...) -&gt; Void</code></td>
    <td><code>(T...) -&gt; Unit</code></td>
  </tr>
  <tr>
    <td><code>(T...) =&gt; R</code></td>
    <td><code>std::function&lt;std::shared_ptr&lt;<a href="./cpp/core/Promise.hpp">Promise&lt;R&gt;</a>&gt; (T...)&gt;</code></td>
    <td><code>(T...) -&gt; <a href="./ios/core/Promise.swift">Promise&lt;T&gt;</a></code></td>
    <td><code>(T...) -&gt; <a href="./android/src/main/java/com/margelo/nitro/core/Promise.kt">Promise&lt;T&gt;</a></code></td>
  </tr>
  <tr>
    <td><code>Error</code></td>
    <td><code>std::exception_ptr</code></td>
    <td><code>Error</code></td>
    <td><code>Throwable</code></td>
  </tr>
  <tr>
    <td><code>Promise&lt;T&gt;</code></td>
    <td><code>std::shared_ptr&lt;<a href="./cpp/core/Promise.hpp">Promise&lt;T&gt;</a>&gt;</code></td>
    <td><code><a href="./ios/core/Promise.swift">Promise&lt;T&gt;</a></code></td>
    <td><code><a href="./android/src/main/java/com/margelo/nitro/core/Promise.kt">Promise&lt;T&gt;</a></code></td>
  </tr>
  <tr>
    <td><code>{ ... }</code></td>
    <td><code>std::shared_ptr&lt;<a href="./cpp/core/AnyMap.hpp">AnyMap</a>&gt;</code></td>
    <td><code><a href="./ios/core/AnyMapHolder.swift">AnyMapHolder</a></code></td>
    <td><code><a href="./android/src/main/java/com/margelo/nitro/core/AnyMap.kt">AnyMap</a></code></td>
  </tr>
  <tr>
    <td><code>ArrayBuffer</code></td>
    <td><code>std::shared_ptr&lt;<a href="./cpp/core/ArrayBuffer.hpp">ArrayBuffer</a>&gt;</code></td>
    <td><code><a href="./ios/core/ArrayBufferHolder.swift">ArrayBufferHolder</a></code></td>
    <td><code><a href="./android/src/main/java/com/margelo/nitro/core/ArrayBuffer.kt">ArrayBuffer</a></code></td>
  </tr>
  <tr>
    <td>..any <code><a href="./src/HybridObject.ts">HybridObject</a></code></td>
    <td><code>std::shared_ptr&lt;<a href="./cpp/core/HybridObject.hpp">HybridObject</a>&gt;</code></td>
    <td><code><a href="./ios/core/HybridObjectSpec.swift">HybridObjectSpec</a></code></td>
    <td><code><a href="./android/src/main/java/com/margelo/nitro/core/HybridObject.kt">HybridObject</a></code></td>
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


Since the `JSIConverter<T>` is just a template, you can extend it with any other custom types by overloading the interface.

For example, to add support for an enum, overload `JSIConverter<MyEnum>`:

```cpp
#include <NitroModules/JSIConverter.hpp>

enum class MyEnum {
  FIRST = 0,
  SECOND = 1
};

namespace margelo::nitro {
  template <>
  struct JSIConverter<MyEnum> {
    static inline MyEnum fromJSI(jsi::Runtime& runtime, const jsi::Value& arg) {
      int intValue = JSIConverter<int>::fromJSI(runtime, arg);
      return static_cast<MyEnum>(intValue);
    }
    static inline jsi::Value toJSI(jsi::Runtime& runtime, MyEnum arg) {
      int intValue = static_cast<int>(arg);
      return JSIConverter<int>::toJSI(runtime, intValue);
    }
  };
}
```

Once the `JSIConverter<T>` for `MyEnum` is defined, you can use the type `MyEnum` in C++ methods, getters and setters of `HybridObject`s.

And on the JS side, you can simply treat the returned `number` (int) as a `MyEnum`:

```js
enum MyEnum {
  FIRST = 0,
  SECOND = 1
}
const value = myHybridObject.getEnumValue() // <-- typed as `MyEnum` instead of `number`
```

Make sure to always include the header that defines the `JSIConverter<MyEnum>` overload inside the `MyHybridObject` file, as this is where the `JSIConverter<T>` overloads are accessed from.

[**Nitrogen**](../nitrogen/) can automatically generate such `JSIConverter<T>` extensions for enums, TypeScript unions, and even structs/objects - so it is generally recommended to use nitrogen.
