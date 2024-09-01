---
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Types

Nitro uses a templating system called `JSIConverter<T>` to efficiently convert between JS and C++ types - statically defined and **fully typesafe at compile-time**.

For example, a JS `number` will always be a `double` on the native side:

```cpp
class HybridMath : public HybridMathSpec {
public:
  double add(double a, double b);
}
```

If the user passes a different type to `add(...)` (for example, a `string`), Nitro will throw an error. By using TypeScipt, all type errors will also be visible at compile-time in your code editor.

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
    <td><code>[A, B, C, ...]</code></td>
    <td><code>std::tuple&lt;A, B, C, ...&gt;</code></td>
    <td><code>(A, B, C)</code> 🟡  (<a href="https://github.com/mrousavy/nitro/issues/38">#38</a>)</td>
    <td>❌</td>
  </tr>
  <tr>
    <td><code>A | B | C | ...</code></td>
    <td><code>std::variant&lt;A, B, C, ...&gt;</code></td>
    <td><code>Variant_A_B_C</code> 🟡  (<a href="https://github.com/mrousavy/nitro/issues/39">#39</a>)</td>
    <td>❌</td>
  </tr>
  <tr>
    <td><code>Record&lt;string, T&gt;</code></td>
    <td><code>std::unordered_map&lt;std::string, T&gt;</code></td>
    <td><code>Dictionary&lt;String, T&gt;</code></td>
    <td><code>Map&lt;String, T&gt;</code></td>
  </tr>
  <tr>
    <td><code>T?</code></td>
    <td><code>std::optional&lt;T&gt;</code></td>
    <td><code>T?</code></td>
    <td><code>T?</code></td>
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

### Custom Types

<Tabs groupId="nitrogen-or-not">
  <TabItem value="nitrogen" label="With Nitrogen" default>


    Nitrogen does this automagically.



  </TabItem>
  <TabItem value="manually" label="Manually">

    #### Overloading a simple type

    The `JSIConverter<T>` is a template which can be extended with any custom type.

    For example, if you want to use `float` directly you can tell Nitro how to convert a `jsi::Value` to `float` by implementing `JSIConverter<float>`:

    ```cpp
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

    ```cpp
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

    ```cpp
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

    ..which can now safely be called with any JS value. If the given JS value is not an object of exactly the shape of `Person` (that is, a `name: string` and an `age: number` values)

  </TabItem>
</Tabs>
