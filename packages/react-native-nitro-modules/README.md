<a href="https://margelo.io">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="../../docs/img/banner-react-native-nitro-modules-dark.png" />
    <source media="(prefers-color-scheme: light)" srcset="../../docs/img/banner-react-native-nitro-modules-light.png" />
    <img alt="Nitrogen" src="../../docs/img/banner-react-native-nitro-modules-light.png" />
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
    // Register all methods that need to be exposed to JS
    registerHybridGetter("number", &MyHybridObject::getNumber);
    registerHybridSetter("number", &MyHybridObject::setNumber);
    registerHybridMethod("add", &MyHybridObject::add);
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
  </tr>

  <tr>
    <td><code>number</code></td>
    <td><code>double</code> / <code>int</code> / <code>float</code></td>
  </tr>
  <tr>
    <td><code>boolean</code></td>
    <td><code>bool</code></td>
  </tr>
  <tr>
    <td><code>string</code></td>
    <td><code>std::string</code></td>
  </tr>
  <tr>
    <td><code>bigint</code></td>
    <td><code>int64_t</code> / <code>uint64_t</code></td>
  </tr>
  <tr>
    <td><code>T[]</code></td>
    <td><code>std::vector&lt;T&gt;</code></td>
  </tr>
  <tr>
    <td><code>[A, B, C, ...]</code></td>
    <td><code>std::tuple&lt;A, B, C, ...&gt;</code></td>
  </tr>
  <tr>
    <td><code>A | B | C | ...</code></td>
    <td><code>std::variant&lt;A, B, C, ...&gt;</code></td>
  </tr>
  <tr>
    <td><code>Record&lt;string, T&gt;</code></td>
    <td><code>std::unordered_map&lt;std::string, T&gt;</code></td>
  </tr>
  <tr>
    <td><code>T?</code></td>
    <td><code>std::optional&lt;T&gt;</code></td>
  </tr>
  <tr>
    <td><code>Promise&lt;T&gt;</code></td>
    <td><code>std::future&lt;T&gt;</code></td>
  </tr>
  <tr>
    <td><code>(TArgs...) =&gt; TReturn</code></td>
    <td><code>std::function&lt;std::future&lt;TReturn&gt; (TArgs...)&gt;</code></td>
  </tr>
  <tr>
    <td><code>{ ... }</code></td>
    <td><code>std::shared_ptr&lt;<a href="./cpp/core/AnyMap.hpp">AnyMap</a>&gt;</code></td>
  </tr>
  <tr>
    <td><code>ArrayBuffer</code></td>
    <td><code>std::shared_ptr&lt;<a href="./cpp/core/ArrayBuffer.hpp">ArrayBuffer</a>&gt;</code></td>
  </tr>
  <tr>
    <td><code><a href="./src/HybridObject.ts">HybridObject</a></code></td>
    <td><code>std::shared_ptr&lt;<a href="./cpp/core/HybridObject.hpp">HybridObject</a>&gt;</code></td>
  </tr>
</table>


Since the `JSIConverter<T>` is just a template, you can extend it with any other custom types by overloading the interface.

For example, to add support for an enum, overload `JSIConverter<YourEnum>`:

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

..and on the JS side, you can implicitly cast the `number` to an enum as well:

```js
enum MyEnum {
  FIRST = 0,
  SECOND = 1
}
const value = myHybridObject.getEnumValue() // <-- typed as `MyEnum` instead of `number`
```

Make sure to always include the header that defines the `JSIConverter<MyEnum>` overload inside the `MyHybridObject` file, as this is where the `JSIConverter<T>` overloads are accessed from.

[**Nitrogen**](../nitrogen/) can automatically generate such `JSIConverter<T>` extensions for enums, TypeScript unions, and even structs/objects - so it is generally recommended to use nitrogen.
